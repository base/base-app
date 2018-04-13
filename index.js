'use strict';

const Base = require('base');
const vfs = require('base-fs');
const generators = require('base-generators');

/**
 * Create a new `App` with the given `options`.
 *
 * ```js
 * const App = require('base-app');
 * const app = new App();
 * ```
 *
 * @param {Object} `options` Options to initialize with
 * @api public
 */

class App extends Base {
  constructor(options) {
    super(options);
    this.use(generators())
    this.use(vfs());
  }

  static get cli() {
    return require('./lib/cli');
  }
};

module.exports = App;
