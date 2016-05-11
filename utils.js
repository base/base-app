'use strict';

var plugins = require('lazy-cache')(require);
var fn = require;
require = plugins;

/**
 * Lazily required module dependencies
 */

require('base-cwd', 'cwd');
require('base-fs', 'vfs');
require('base-option', 'option');
require('base-runtimes', 'runtimes');
require('base-task', 'task');
require = fn;

/**
 * Expose plugins
 */

module.exports = plugins;
