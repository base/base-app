'use strict';

var Assemble = require('assemble-core');
var utils = require('./utils');

function App(options) {
  Assemble.call(this, options);
  this.is('app');
  this.initApp();
}

/**
 * Inherit `assemble-core`
 */

Assemble.extend(App);

/**
 * Initialize defaults
 */

App.prototype.initApp = function() {
  Assemble.debug(this);
  App.emit('preInit', this);
  this.use(utils.generators());
  this.use(utils.pipeline());
  this.use(utils.pkg());
  App.emit('init', this);
};

/**
 * Expose `App`
 */

module.exports = App;
