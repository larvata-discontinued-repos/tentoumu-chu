// Generated by CoffeeScript 1.8.0
var Kojima, Nishino, Okada, config, mako, meru, miki, naachan;

Nishino = require('./libs/miki');

Kojima = require('./libs/kojimako');

Okada = require('./libs/naachan');

config = require('./tentoumu-chu.json');

miki = new Nishino(config);

mako = new Kojima(miki);

mako.startServer();

naachan = new Okada(miki);

naachan.startMonitor();

meru = new Meru(miki);

meru.startMonitor();
