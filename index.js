'use strict';

var Base = require('base');
var utils = require('./utils');

class App {
  constructor(options) {
    Base.call(this, {}, options);
    this.is('app');
    this.initApp();
  }

  /**
   * Initialize defaults, emit events before and after
   */

  initApp() {
    App.emit('preInit', this);
    App.plugins(this);
    App.emit('init', this);
  }
}

/**
 * Expose plugins on the constructor to allow other `base`
 * apps to use the plugins before instantiating.
 */

App.plugins = function(app) {
  app.use(utils.option());
  app.use(utils.runtimes());
  app.use(utils.task());
  app.use(utils.cwd());
  app.use(utils.vfs());
};

/**
 * Inherit `base`
 */

Base.extend(App);

/**
 * Expose `App`
 */

module.exports = App;
