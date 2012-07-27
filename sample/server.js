var express = require('express')
  , app = express.createServer()
  , io = require('socket.io');

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index');
});

io = io.listen(app.listen(process.env.npm_package_config_port || 3000, function(){
  console.log("Express server listening on port %d in %s mode", process.env.npm_package_config_port || 3000, app.settings.env);
}));

io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging
io.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);

var Chat = require(__dirname + '/public/models/Chat.js')
  , messages = new Chat.Collection();

(function(){
  var date = new Date();
  messages.add({ text: 'Chat server is running !', author: 'Server', time: date.toUTCString() });
  messages.add({ text: 'Run app.post(\'message\'); to post a message.', author: 'Server', time: date.toUTCString() });
})();

io.sockets.on('connection', function (socket) {
  messages.bindServer(socket);
  socket.on('disconnect', function () {
    messages.unbindServer(socket);
  });
});

