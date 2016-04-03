'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils; // eslint-disable-line

/**
 * Utils
 */

require('base-generators', 'generators');
require('base-pipeline', 'pipeline');
require('base-pkg', 'pkg');
require('base-runtimes', 'runtimes');
require('define-property', 'define');
require('extend-shallow', 'extend');
require = fn; // eslint-disable-line

/**
 * Return true if `val` is an instance of `app` or the given `ctorName`
 */

utils.isApp = function(val, ctorName) {
  return utils.isObject(val) && val['is' + ctorName] === true;
};

/**
 * Expose `utils`
 */

module.exports = utils;
