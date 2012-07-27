# BackboneIO : Solution 2

This solution is built on top of _Backbone.iobind_ (http://alogicalparadox.com/backbone.iobind/).
_BackboneIO_ extend the _Backbone_ module and provide a _BackboneIO.sync_ function that communicate with _socket.io_ instead of using HTTP methods.
The _BackboneIO.Model_ has default functions to _update_ or _delete_ a _Model_.
The _BackboneIO.Collection_ has default functions to _create_ a _Model_ or _read_ a _Collection_.

## Dépendences

* node.js
* backbone.js
* underscore.js
* socket.io

## Objectifs

* Utiliser le même modèle Backbone.js sur le serveur et le client
* Utiliser les mêmes collections sur le serveur et le client
* Support des opérations create, read, update, delete
* Informer le serveur lors d'une opération depuis un client
* Informer les clients lors d'une opération depuis le serveur

## Test

Faites les commandes suivantes :
```
npm install
npm start
```

Accédez à http://127.0.1:3000

Ouvrez la console javascript.
Vous pouvez utilisez les commandes _app.getTest();_ et _app.setTest(x)_ en spécifiant un entier pour voir comment cela fonctionne.
Le serveur incrémente de 1 la variable à interval régulier.

## Réutilisation des modèles

Ceci est fait grâce à la specification CommonJS.
La structure est inspirée du code de backbone.js.

```javascript
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
    url: 'server',
    defaults: {
      test: 1
    },
  });

  if(server) module.exports = MyModels;
  else root.MyModels = MyModels;

}).call(this);
```
## Fonctionnement général

L'ensemble du fonctionnement des modèles côté client est issu du code de Backbone.iobind (http://alogicalparadox.com/backbone.iobind/).
J'ai repris le code tel quel et l'ai mis en module CommonJS réutilisable.
J'y ai ensuite fait quelques modifications afin de rendre opérationnel l'utilisation du modèle depuis le serveur.
Par défaut iobind demande de réaliser une API qui communique via socket.io pour répondre aux clients.
Ici ce n'est pas le cas, et des fonctions standards sont en place dans le modèle.

## Methodes callback

### Model

__onClientChange__ est appelée sur le serveur lorsqu'un client demande une modification d'un _Model_ via la méthode _save()_.
__onClientDelete__ est appelée sur le serveur lorsqu'un client demande la suppression d'un _Model_ via la méthode _destroy()_.
Ces 2 méthodes font ensuite appel aux méthodes permettant de répercuter les modifications à l'ensemble des clients liés.

__onServerChange__ est appelée sur le client lorsque le serveur demande une modification d'un _Model_ via la méthode _save()_.
__onServerDelete__ est appelée sur le client lorsque le serveur demande la suppression d'un _Model_ via la méthode _destroy()_.

### Collection

__onClientRead__ est appelée sur le serveur lors de l'utilisation de la méthode _fetch()_ par le client.
__onClientCreate__ est appelée sur le serveur lors de la création d'un _Model_ par le client avec la méthode _save()_, l'_id_ du _Model_ doit etre nul. La modification est répercutée sur les autres clients.

__onServerCreate__ est appelée sur le client lorsque le serveur demande la création d'un _Model_.

