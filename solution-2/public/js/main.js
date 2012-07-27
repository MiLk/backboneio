var app = (function(){
  var my_servers = null;
  return {
    run: function() {
      window.socket = io.connect('http://127.0.0.1:3000');
      this.read();
    },
    log: function(){
      console.log(my_servers);
      return my_servers.toJSON();
    },
    getTest: function(){
      return my_servers.get(1).get('test');
    },
    setTest: function(x){
      my_servers.get(1).set('test',x);
      my_servers.get(1).save();
      return true;
    },
    destroy: function(x){
      my_servers.get(x).destroy();
      return my_servers;
    },
    read: function() {
      my_servers = new MyModels.ServerCollection();
      my_servers.fetch({
        success: function(collection,resp){
          collection.bindClient();
        }
      });
      return my_servers;
    },
    add: function(x) {
      var my_server = new MyModels.ServerModel({ id: x });
      my_server.id = null;
      my_server.save();
      return true;
    },
  }
})();

jQuery(function($) {
  app.run();
});
