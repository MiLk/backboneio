var app = (function(){
  var messages = new Chat.Collection()
    , view = new Chat.View({ app: this, collection: messages });
  return {
    run: function() {
      window.socket = io.connect('http://127.0.0.1:3000');
      this.read();
    },
    read: function() {
      messages.fetch({
        success: function(collection,resp){
          collection.bindClient();
        }
      });
      setTimeout(this.toJSON,100);
      return messages;
    },
    post: function(text, author) {
      var date = new Date()
        , message = new Chat.Model({ text: text, author: author ? author : 'Guest', time: date.toUTCString() });
      message.save();
      return true;
    },
    toJSON: function(){
      messages.each(function(message){
        console.log('['+message.get('time')+'] '+message.get('author')+' : '+message.get('text'));
      });
    },
  }
})();

jQuery(function($) {
  app.run();
});
