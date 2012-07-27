(function () {
  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var MyModels, server = false;
  if (typeof exports !== 'undefined') {
    MyModels = exports;
    server = true;
  } else {
    MyModels = root.MyModels = {};
  }

  // Require Underscore, Backbone & BackboneIO, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  var Backbone = root.Backbone;
  if (!Backbone && (typeof require !== 'undefined')) Backbone = require('backbone');
  
  var BackboneIO = root.BackboneIO;
  if (!BackboneIO && (typeof require !== 'undefined')) BackboneIO = require(__dirname+'/BackboneIO.js');
  
  MyModels.ServerModel = BackboneIO.Model.extend({
    urlRoot: 'server',
    defaults: {
      test: 1
    },
  });
  
  MyModels.ServerCollection = BackboneIO.Collection.extend({
    model: MyModels.ServerModel,
    url: 'servers',
  });

if(server) module.exports = MyModels;
else root.MyModels = MyModels;

}).call(this);
