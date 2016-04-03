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
require = fn; // eslint-disable-line

/**
 * Expose `utils`
 */

module.exports = utils;
