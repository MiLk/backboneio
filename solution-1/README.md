# BackboneIO : Solution 1

## Dépendences

* node.js
* backbone.js
* underscore.js
* socket.io

## Objectifs

* Utiliser le meme modèle Backbone.js sur le serveur et le client
* Initialiser le modèle du client à partir du serveur
* Informer le serveur d'une mise à jour d'un client
* Informer tous les clients concernés d'une mise à jour du serveur

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

## Reutilisation des modèles

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

## Initialisation

L'initialisation se fait via un event _initial_ lors de la connection du client.
Le serveur exporte le model et le client l'importe.
Les fonctions mport et xport sont issues de cet article : http://andyet.net/blog/2011/feb/15/re-using-backbonejs-models-on-the-server-with-node/

## Informer le serveur d'une mise à jour d'un client

Cela se passe en surchargeant la méthode _sync_ du modèle.
On envoie l'événement suivant au serveur : _url/id:update_.
La methode _bindServer(socket)_ permet de faire écouter le serveur sur cet événement.
Elle permet aussi de maintenir une liste de tous les sockets liés à ce modèle.
C'est aussi à se moment qu'est fixé l'id du model, afin que tous les clients aient le même et que ça ne crée pas de conflit.

## Informer tous les clients concernés

Lors de l'import par le serveur des données, celui-ci save ensuite ce qui redéclenche la méthode sync.
Cette fois-ci elle va broadcaster à tous les sockets qui ont été préalablement bindés, c'est à dire aux clients.

La méthode _bindClient_ permet d'écouter les modifications venant du serveur.

## Limites

Cette solution a des limites, elle ne permet de synchroniser qu'un seul modèle.
En revanche l'import et l'export étant récursif, il est possible de lui lier des collections et autres modèles qui seront exportés en meme temps.
Cette solution est donc utile pour synchroniser l'état d'une application complète entre le serveur et un ou plusieurs clients.

## Comparaison avec Backbone.io (http://scttnlsn.github.com/backbone.io/)

Avec Backbone.io, on enregistre un backend qui se charge de stocker tous les modèles, mais on peut difficilement y accéder depuis le serveur.
Le principe est plutot de partager les modèles entre tous les clients.
De plus tous les événements sont broadcastés sans sélection du client, selon les cas cela peut etre inadapté.

