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
var my_servers = new MyModels.ServerCollection();

for(i=1;i<5;i++) {
  var my_server = new MyModels.ServerModel({id: i});
  my_servers.add(my_server);
}

io.sockets.on('connection', function (socket) {
  my_servers.bindServer(socket);
  socket.on('disconnect', function () {
    my_servers.each(function(my_server){
      my_servers.unbindServer(socket);
    });
  });
});

setInterval(function() { 
  my_servers.get(1).set('test',my_servers.get(1).get('test')+1);
  my_servers.get(1).save();
}, 6000);
