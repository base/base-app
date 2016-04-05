'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('base:base-app:utils');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils; // eslint-disable-line
var fileCache = {};

/**
 * Utils
 */

require('base-cli', 'cli');
require('base-config', 'config');
require('base-generators', 'generators');
require('log-utils', 'log');
require('os-homedir', 'home');
require = fn; // eslint-disable-line

/**
 * ansi colors
 */

utils.color = utils.log.colors;

/**
 * Return true if `str` is a string with length greater than zero.
 */

utils.isString = function(str) {
  return str && typeof str === 'string';
};

/**
 * Rename the `key` used for storing views/templates
 *
 * @param {String} `key`
 * @param {Object} `view` the `renameKey` method is used by [templates][] for both setting and getting templates. When setting, `view` is exposed as the second parameter.
 * @return {String}
 * @api public
 */

utils.renameKey = function(key, view) {
  return view ? view.stem : path.basename(key, path.extname(key));
};

/**
 * Get a home-relative filepath
 */

utils.homeRelative = function(filepath) {
  debug('creating home relative path "%s"', filepath);
  if (!utils.isString(filepath)) {
    throw new TypeError('expected filepath to be a string');
  }
  filepath = path.relative(utils.home(), path.resolve(filepath));
  if (filepath.charAt(0) === '/') {
    filepath = filepath.slice(1);
  }
  return filepath;
};

/**
 * Return a formatted, home-relative config-file path.
 *
 * @param {String} `configName` Config file name
 * @param {String} `filepath`
 * @return {String}
 */

utils.configPath = function(msg, filepath) {
  var fp = utils.color.green('~/' + utils.homeRelative(filepath));
  utils.timestamp(msg + ' ' + fp);
};

utils.timestamp = function() {
  var args = [].slice.call(arguments);
  args.unshift(utils.log.timestamp);
  console.log.apply(console, args);
};

utils.logTimeDiff = function(argv) {
  return function(time, name, msg) {
    if (argv.times) {
      utils.timestamp(msg, utils.color.magenta(time.end(name)));
    }
  };
};

/**
 * Expose `utils`
 */

module.exports = utils;
