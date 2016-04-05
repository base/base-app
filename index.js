'use strict';

var Base = require('base');
var utils = require('./utils');

function App(options) {
  Base.call(this, options);
  this.is('app');
  this.initApp();
}

/**
 * Inherit `assemble-core`
 */

Base.extend(App);

/**
 * Initialize defaults
 */

App.prototype.initApp = function() {
  App.emit('preInit', this);
  this.use(utils.generators());
  App.emit('init', this);
};

/**
 * Expose `App`
 */

module.exports = App;
