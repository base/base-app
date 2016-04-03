'use strict';

var assemble = require('assemble-core');
var utils = require('./utils');

var App = module.exports = function App(options) {
  assemble.call(this, options);
  this.is('app');
  assemble.debug(this);
  this.use(utils.generators());
  this.use(utils.pipeline());
  this.use(utils.pkg());
};

/**
 * Inherit `assemble`
 */

assemble.extend(App);
