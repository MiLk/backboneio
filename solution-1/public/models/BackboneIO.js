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

BackboneIO.Model = Backbone.Model.extend({
  // builds and return a simple object ready to be JSON stringified
  xport: function (opt) {
    var result = {},
      settings = _({
        recurse: true
      }).extend(opt || {});

    function process(targetObj, source) {
      targetObj.id = source.id || null;
      targetObj.cid = source.cid || null;
      targetObj.attrs = source.toJSON();
      _.each(source, function (value, key) {
        // since models store a reference to their collection
        // we need to make sure we don't create a circular refrence
        if (settings.recurse) {
          if (key !== 'collection' && source[key] instanceof Backbone.Collection) {
            targetObj.collections = targetObj.collections || {};
            targetObj.collections[key] = {};
            targetObj.collections[key].models = [];
            targetObj.collections[key].id = source[key].id || null;
            _.each(source[key].models, function (value, index) {
              process(targetObj.collections[key].models[index] = {}, value);
            });
          } else if (source[key] instanceof Backbone.Model) {
            targetObj.models = targetObj.models || {};
            process(targetObj.models[key] = {}, value);
          }
        }
      });
    }

    process(result, this);

    return result;
  },

  // rebuild the nested objects/collections from data created by the xport method
  mport: function (data, silent) {
    function process(targetObj, data) {
      targetObj.id = data.id || null;
      targetObj.set(data.attrs, {silent: silent});
      // loop through each collection
      if (data.collections) {
        _.each(data.collections, function (collection, name) {
          targetObj[name].id = collection.id;
          Skeleton.models[collection.id] = targetObj[name];
          _.each(collection.models, function (modelData, index) {
            var newObj = targetObj[name]._add({}, {silent: silent});
            process(newObj, modelData);
          });
        });
      }

      if (data.models) {
        _.each(data.models, function (modelData, name) {
          process(targetObj[name], modelData);
        });
      }
    }
    process(this, data);
    return this;
  },
  url: '',
  sockets: [],
  bindClient: function() {
    if(typeof this.id !== 'undefined' && typeof this.previous('id') === 'undefined')
    {
      if(typeof window !== 'undefined')  
      {
        var model = this;
        window.socket.on(this.url+'/'+this.id+':update',function(data){
          model.mport(data);
        });
      }
    }
  },
  bindServer: function(socket){
    this.sockets.push(socket);
    if(typeof this.id === 'undefined') this.id = this.cid;
    var model = this;
    socket.on(this.url+'/'+this.id+':update',function(data) {
      model.mport(data);
      model.save();
    });
  },
  sync: function (method, model, options) {
    var url, data, event;
    url = options.url || model.url || urlError();
    if ( !data && model && model.xport) {
      data = model.xport() || {};
    }
    switch(method)
    {
      case 'update': event = url+'/'+model.id+':'+method; break;
      default: console.log('Unknow method '+method);
    }
    if(typeof window !== 'undefined' && window.socket)
      window.socket.emit(event,data);
    else
    {
      _.each(this.sockets, function(socket){
        socket.emit(event,data);
      });
    }
  },
});

  BackboneIO.Collection = Backbone.Collection.extend({
  });

if(server) module.exports = BackboneIO;
else root.BackboneIO = BackboneIO;

}).call(this);
