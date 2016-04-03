'use strict';

var Base = require('base');

function App() {
  this.isApp = true;
  Base.call(this);
}

Base.extend(App);

/**
 * Expose `App`
 */

module.exports = App;
