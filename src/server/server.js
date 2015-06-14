// Generated by CoffeeScript 1.9.1
var FluxibleComponent, HtmlComponent, React, Router, api, app, config, debug, express, navigateAction, port, serialize, server;

express = require('express');

api = require('./api');

React = require('react');

Router = require('react-router');

navigateAction = require('../actions/navigate');

app = require('./fluxibleApp');

serialize = require('serialize-javascript');

debug = require('debug')('Example');

config = require('../configs/configLoader');

FluxibleComponent = require('fluxible/addons/FluxibleComponent');

HtmlComponent = React.createFactory(require('../components/Html.jsx'));

server = express();

server.use(function(req, res, next) {
  var context;
  console.log("req");
  context = app.createContext();
  console.log("d");
  debug('Executing navigate action');
  Router.run(app.getComponent(), req.path, function(Handler, state) {
    console.log("get components");
    context.executeAction(navigateAction, state, function() {
      var Component, exposed, html;
      console.log("executeAction");
      debug('Exposing context state');
      exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';
      debug('Rendering Application component into html');
      Component = React.createFactory(Handler);
      html = React.renderToStaticMarkup(HtmlComponent({
        state: exposed,
        markup: React.renderToString(React.createElement(FluxibleComponent, {
          context: context.getComponentContext()
        }, Component()))
      }));
      debug('Sending markup');
      res.send(html);
    });
  });
});

port = process.env.PORT || 3434;

server.listen(port);

console.log('Listening on port ' + port);
