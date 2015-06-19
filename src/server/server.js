// Generated by CoffeeScript 1.9.3
var FluxibleComponent, HtmlComponent, React, Router, Server, apiRouter, app, cookieParser, csrf, debug, express, fetchData, miki, navigateAction, routes, serialize, showSchedule;

express = require('express');

apiRouter = require('./apiRouter');

React = require('react');

Router = require('react-router');

navigateAction = require('../actions/navigate');

showSchedule = require('../actions/showSchedule');

require('node-jsx').install({
  extension: '.jsx'
});

app = require('./app');

serialize = require('serialize-javascript');

debug = require('debug')('Example');

FluxibleComponent = require('fluxible/addons/FluxibleComponent');

cookieParser = require('cookie-parser');

csrf = require('csurf');

HtmlComponent = React.createFactory(require('../components/Html.jsx'));

miki = require('../services/miki');

routes = require('../components/Routes.jsx');

fetchData = require('../utils/fetchData');

Server = (function() {
  function Server() {}

  Server.prototype.renderApp = function(context, location, cb) {
    var router;
    console.log("start renderapp");
    router = Router.create({
      routes: routes,
      location: location,
      transitionContext: context,
      onAbort: function(redirect) {
        return cb({
          redirect: redirect
        });
      },
      onError: function(err) {
        return cb(err);
      }
    });
    return router.run(function(Handler, routerState) {
      var html;
      if (routerState.routes[0].name === 'not-found') {
        html = React.renderToStaticMarkup(React.createElement(Handler));
        cb({
          notFound: true
        }, html);
        return;
      }
      return fetchData(context, routerState, function(err) {
        var appMarkup, dehydratedState, ele;
        console.log("fetchData done");
        if (err) {
          return cb(err);
        }
        dehydratedState = "window.App=" + (serialize(app.dehydrate(context))) + ";";
        appMarkup = React.renderToString(React.createElement(FluxibleComponent, {
          context: context.getComponentContext()
        }, React.createElement(Handler)));
        console.log("dehydratedState");
        console.log(dehydratedState);
        ele = React.createElement(HtmlComponent, {
          state: dehydratedState,
          markup: appMarkup
        });
        console.log("ele");
        console.log(JSON.stringify(ele, null, 2));
        html = React.renderToStaticMarkup(ele);
        return cb(null, html);
      });
    });
  };

  Server.prototype.start = function() {
    var fetchrPlugin, server, staticPath;
    server = express();
    staticPath = __dirname + "/../../build";
    server.use('/build', express["static"](staticPath));
    fetchrPlugin = app.getPlugin('FetchrPlugin');
    fetchrPlugin.registerService(require('../services/schedule'));
    server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware);
    server.use((function(_this) {
      return function(req, res, next) {
        var context;
        context = app.createContext({
          req: req,
          xhrContext: {}
        });
        return _this.renderApp(context, req.url, function(err, html) {
          console.log("render app done");
          if (err && err.notFound) {
            return res.status(404).send(html);
          }
          if (err && err.redirect) {
            return res.redirect(303, err.redirect.to);
          }
          if (err) {
            return next(err);
          }
          return res.send(html);
        });
      };
    })(this));
    server.listen(miki.config.port);
    return console.log('Listening on port ' + miki.config.port);
  };

  return Server;

})();

module.exports = new Server();
