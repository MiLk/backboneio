(function() {

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var BackboneIO, server = false;
  if (typeof exports !== 'undefined') {
    BackboneIO = exports;
    server = true;
  } else {
    BackboneIO = root.BackboneIO = {};
  }

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // Require Backbone, if we're on the server, and it's not already present.
  var Backbone = root.Backbone;
  if (!Backbone && (typeof require !== 'undefined')) Backbone = require('backbone');

  BackboneIO.sync = (function (method, model, options) {
    var getUrl = function (object) {
      if (!(object && object.url)) return null;
      return _.isFunction(object.url) ? object.url() : object.url;
    };
    
    var params = _.extend({
      req: getUrl(model) + ':' + method
    }, options);

    if ( !params.data && model ) {
      params.data = model.toJSON() || {};
    }

    console.log('Sync : '+params.req);
    console.log(params.data);
    if(typeof window !== 'undefined')
    {
      var io = model.socket || window.socket || BackboneIO.socket;
      io.emit(params.req, params.data, function (err, data) {
        if (err) {
          options.error(err);
        } else {
          options.success(data);
        }
      });
    }
    else
    {
      _.each(this.sockets, function(socket){
        socket.emit(params.req,params.data);
      });
    }
  });

  BackboneIO.Model = Backbone.Model.extend({
    sockets: [],
    bindServer: function(socket){
      if(this.sockets.indexOf(socket) === -1) this.sockets.push(socket);
      if(typeof this.id === 'undefined') this.id = this.cid;
      var model = this;
      _.bindAll(this, 'onClientChange', 'onClientDelete', 'modelCleanup');
      if (!this.noIoBind) {
        this.ioBind('update', socket, this.onClientChange, this);
        this.ioBind('delete', socket, this.onClientDelete, this);
      }
    },
    unbindServer: function(socket) {
      while(this.sockets.indexOf(socket) > -1)
      {
        this.ioUnbindAll(socket);
        this.sockets.splice(this.sockets.indexOf(socket),1);
      }
    },
    onClientChange: function(resp){
       if(!this.set(this.parse(resp))) return false;
       this.save();
    },
    onClientDelete: function(resp){
      this.destroy();
      if (this.collection) {
        this.collection.remove(this);
      } else {
        this.trigger('remove', this);
      }
      this.modelCleanup();
    },
    bindClient: function (id) {
      this.id = id;
      _.bindAll(this, 'onServerChange', 'onServerDelete', 'modelCleanup');
      if (!this.noIoBind) {
        this.ioBind('update', this.onServerChange, this);
        this.ioBind('delete', this.onServerDelete, this);
      }
    },
    onServerChange: function(resp){
      if (!this.set(this.parse(resp))) return false;
    },
    onServerDelete: function(resp){
      if (this.collection) {
        this.collection.remove(this);
      } else {
        this.trigger('remove', this);
      }
      this.modelCleanup();
    },
    modelCleanup: function(){
      this.ioUnbindAll();
      return this;
    },
    ioBind: function (eventName, io, callback, context) {
      var ioEvents = this._ioEvents || (this._ioEvents = {})
        , globalName = this.url() + ':' + eventName
        , self = this;
      if ('function' == typeof io) {
        context = callback;
        callback = io;
        io = this.socket || window.socket || Backbone.socket;
      }
      var event = {
        name: eventName,
        global: globalName,
        cbLocal: callback,
        cbGlobal: function (data) {
          self.trigger(eventName, data);
        }
      };
      this.bind(event.name, event.cbLocal, (context || self));
      io.on(event.global, event.cbGlobal);
      if (!ioEvents[event.name]) {
        ioEvents[event.name] = [event];
      } else {
        ioEvents[event.name].push(event);
      }
      return this;
    },
    ioUnbind: function (eventName, io, callback) {
      var ioEvents = this._ioEvents || (this._ioEvents = {})
        , globalName = this.url() + ':' + eventName;
      if ('function' == typeof io) {
        callback = io;
        io = this.socket || window.socket || Backbone.socket;
      }
      var events = ioEvents[eventName];
      if (!_.isEmpty(events)) {
        if (callback && 'function' === typeof callback) {
          for (var i = 0, l = events.length; i < l; i++) {
            if (callback == events[i].cbLocal) {
              this.unbind(events[i].name, events[i].cbLocal);
              io.removeListener(events[i].global, events[i].cbGlobal);
              events[i] = false;
            }
          }
          events = _.compact(events);
        } else {
          this.unbind(eventName);
          io.removeAllListeners(globalName);
        }
        if (events.length === 0) {
          delete ioEvents[eventName];
        }
      }
      return this;
    },
    ioUnbindAll: function (io) {
      var ioEvents = this._ioEvents || (this._ioEvents = {});
      if (!io) io = this.socket || window.socket || Backbone.socket;
      for (var ev in ioEvents) {
        this.ioUnbind(ev, io);
      }
      return this;
    },
    sync: BackboneIO.sync,
  });

  BackboneIO.Collection = Backbone.Collection.extend({
    sync: BackboneIO.sync,
  });

if(server) module.exports = BackboneIO;
else root.BackboneIO = BackboneIO;

}).call(this);
