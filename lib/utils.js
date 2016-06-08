'use strict';

var plugins = require('lazy-cache')(require);
var fn = require;
require = plugins;

/**
 * Lazily required module dependencies
 */

require('base-fs', 'vfs');
require('base-generators', 'generators');
require('base-runtimes', 'runtimes');
require = fn;

/**
 * Expose plugins
 */

module.exports = plugins;
