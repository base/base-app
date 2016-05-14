'use strict';

var Base = require('base');
var utils = require('./utils');

function App(options) {
  Base.call(this, {}, options);
  this.is('app');
  this.initApp();
}

/**
 * Initialize defaults, emit events before and after
 */

App.prototype.initApp = function() {
  App.emit('preInit', this);
  App.plugins(this);
  App.emit('init', this);
};

/**
 * Inherit `base`
 */

Base.extend(App);

/**
 * Expose plugins on the constructor to allow other `base`
 * apps to use the plugins before instantiating.
 */

App.plugins = function(app) {
  app.use(utils.runtimes());
  app.use(utils.generators());
  app.use(utils.vfs());
};

/**
 * Expose `App`
 */

module.exports = App;
