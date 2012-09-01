(function () {
  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Chat, server = false;
  if (typeof exports !== 'undefined') {
    Chat = exports;
    server = true;
  } else {
    Chat = root.Chat = {};
  }

  // Require Underscore, Backbone & BackboneIO, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  var BackboneIO = root.BackboneIO;
  if (!BackboneIO && (typeof require !== 'undefined')) BackboneIO = require('backboneio');
  
  Chat.Model = BackboneIO.Model.extend({
    urlRoot: 'chat',
    defaults: {
      id: null,
      text: '',
      author: null,
      time: null,
    },
    initialize: function() {
      if(server && !this.get('id')) {
        this.set('id',this.cid);
      }
    },
  });
  
  Chat.Collection = BackboneIO.Collection.extend({
    model: Chat.Model,
    url: 'chat',
  });

  if(!server)
  {
    Chat.MessageView = BackboneIO.View.extend({
      tagName: 'li',
      model: '',
      initialize: function(options) {
          _.bindAll(this, 'render');
          this.model.bind('all', this.render);
      },
      render: function( event ){
        if(event == 'delete')
        {
          this.$el.remove();
        }
        else
        {
          var compiled_template = _.template('[<%= time %>] <%= author %> : <%= text %>');
          this.$el.html( compiled_template(this.model.toJSON()) );
        }
        return this; //recommended as this enables calls to be chained.
      }, 
    });

    Chat.View = BackboneIO.View.extend({
      app: '',
      collection: '',
      el: $("#app"), 
      initialize: function() {
        _.bindAll(this,'resetChat','addChat');
        this.collection.bind('add', this.addChat);
        this.collection.bind('reset', this.resetChat);
      }
      , events: {
        "submit form" : "sendMessage",
        "click #refresh" : "resetChat" 
      }
      , resetChat: function() {
        $("#chat li").remove();
        if(this.collection)
        {
          var self = this;
          this.collection.each(function(model){
            self.addChat(model);
          });
        }
      }
      , addChat: function(chat) {
        var view = new Chat.MessageView({model: chat});
        $('#chat').append(view.render().el);
      }
      , sendMessage: function(){
        app.post($('input[name=message]').val(), $('input[name=author]').val());
        $('input[name=message]').val('');
      }
    });
  }

if(server) module.exports = Chat;
else root.Chat = Chat;

}).call(this);
