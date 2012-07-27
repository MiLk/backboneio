= BackboneIO

This repository contains different approaches to reuse the same _Backbone.js_ model between the client and the server (_Node.js_) and synchronize them with _socket.io_.

== First Solution

This solution allows to synchronize a model between client and server and update itself when changing.
The changes are not broadcasted to all clients but only to those who use the model.
The export and import functions are recursive, you can link othets models or collections to a main model that you share.

== Second Solution


