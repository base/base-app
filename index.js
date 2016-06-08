'use strict';

var Base = require('base');
var utils = require('./lib/utils');
var cli = require('./lib/cli');

/**
 * Create a new `App` with the given `options`.
 *
 * ```js
 * var App = require('base-app');
 * var app = new App();
 * ```
 *
 * @param {Object} `options` Options to initialize with
 * @api public
 */

function App(options) {
  Base.call(this, {}, options);
  this.is('app');
  this.initApp();
}

/**
 * Inherit `base`
 */

Base.extend(App);

/**
 * Initialize defaults, emit events before and after
 */

App.prototype.initApp = function() {
  App.emit('preInit', this);
  App.plugins(this);
  App.emit('init', this);
};

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
 * Expose static `cli` method
 */

App.cli = cli;

/**
 * Expose `App`
 */

module.exports = App;
