var app = (function(){
  var my_server = null;
  return {
    run: function() {
      window.socket = io.connect('http://127.0.0.1:3000');
      my_server = new MyModels.ServerModel();
      my_server.fetch({
        success: function(model,resp){
          if(typeof model.get('server_id') !== 'undefined')
            model.bindClient(model.get('server_id'));
        }
      });
    },
    log: function(){
      console.log(my_server);
      return my_server.toJSON();
    },
    getTest: function(){
      return my_server.get('test');
    },
    setTest: function(x){
      my_server.set('test',x);
      my_server.save();
      return true;
    },
  }
})();

jQuery(function($) {
  app.run();
});
