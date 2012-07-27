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

io = io.listen(app.listen(process.env.npm_package_config_port, function(){
  console.log("Express server listening on port %d in %s mode", process.env.npm_package_config_port, app.settings.env);
}));

var MyModels = require(__dirname + '/public/models/MyModels.js');
var my_server = Array();

for(i=1;i<5;i++) {
  my_server[i] = new MyModels.ServerModel({server_id: i});
  my_server[i].id = i;
}

io.sockets.on('connection', function (socket) {
  for(i=1;i<5;i++) {
    my_server[i].bindServer(socket);
  }
  socket.on('server:read', function(data,fn){
    fn(null,my_server[1].toJSON());
  });
  socket.on('disconnect', function () {
    for(i=1;i<5;i++) {
      my_server[i].unbindServer(socket);
    }
  });
});

  setInterval(function() { 
    my_server[1].set('test',my_server[1].get('test')+1);
    my_server[1].save();
  }, 5000);
