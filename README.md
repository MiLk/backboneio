= BackboneIO

This module allow you to reuse the same _Backbone.js_ model between the client and the server (_Node.js_) and synchronize them with _socket.io_.
This solution is built on top of _Backbone.iobind_ (http://alogicalparadox.com/backbone.iobind/).
_BackboneIO_ extend the _Backbone_ module and provide a _BackboneIO.sync_ function that communicate with _socket.io_ instead of using HTTP methods.
The _BackboneIO.Model_ has default functions to _update_ or _delete_ a _Model_.
The _BackboneIO.Collection_ has default functions to _create_ a _Model_ or _read_ a _Collection_.

== Install

For the server just type :
```
npm install backboneio
```
or via git repository :
```
npm install git://github.com/MiLk/backboneio.git
```

For the client you need to copy the files _backbone.js_ and _backboneio.js_ in your javascript directory.
Then put this code in your HTML :
```html
<script src="/js/backbone.js"></script>
<script src="/js/backboneio.js"></script>
```

== Use

A basic example is available in sample directory.

== Thanks

* Jake Luer [[Github: @logicalparadox](http://github.com/logicalparadox)] [[Twitter: @jakeluer](http://twitter.com/jakeluer)] [[Website](http://alogicalparadox.com)]

== LICENSE

New BSD License

Copyright (c) 2012, Emilien Kenler hello@emilienkenler.com
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
