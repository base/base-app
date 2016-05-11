#!/usr/bin/env node

var path = require('path');
var exists = require('fs-exists-sync');
var log = require('log-utils');
var color = log.colors;
var argv = require('minimist')(process.argv.slice(2), {
  alias: {configfile: 'f'}
});

/**
 * Resolve cwd
 */

var pkgPath = require('find-pkg').sync(process.cwd());
var cwd = path.dirname(pkgPath);

/**
 * Check for config file
 */

var configfile = path.resolve(cwd, argv.configfile || 'basefile.js');
if (!exists(configfile)) {
  console.error('please specify a configfile using `--configfile` or `-f`');
  process.exit(1);
}

/**
 * Log configfile
 */

console.log(log.timestamp, 'config', color.green('~' + configfile));

/**
 * Get the Base ctor and instance to use
 */

var base = resolveBase('base');
var app = require(configfile);

if (base && typeof app === 'function') {
  base.use(app);
} else {
  base = app;
}

if (!base) {
  handleError(base, new Error('cannot run config file: ' + configfile));
}

/**
 * Run tasks
 */

base.build(argv._.length ? argv._ : ['default'], function(err) {
  if (err) handleError(base, err);
  base.emit('done');
});

/**
 * Resolve the "app" to use
 */

function resolveBase() {
  var paths = [
    { name: 'base', path: path.resolve(cwd, 'node_modules/base')},
    { name: 'base-app', path: path.resolve(cwd, 'node_modules/base-app')},
    { name: 'assemble-core', path: path.resolve(cwd, 'node_modules/assemble-core')},
    { name: 'assemble', path: path.resolve(cwd, 'node_modules/assemble')},
    { name: 'generate', path: path.resolve(cwd, 'node_modules/generate')},
    { name: 'verb', path: path.resolve(cwd, 'node_modules/verb')},
    { name: 'core', path: path.resolve(__dirname, '..')},
  ];

  var len = paths.length;
  var idx = -1;

  while (++idx < len) {
    var file = paths[idx];
    if (argv.app && file.name !== argv.app) {
      continue;
    }
    if ((base = resolveApp(file))) {
      return base;
    }
  }

  if (argv.app) {
    return resolveApp({name: argv.app, path: path.resolve(cwd, 'node_modules', argv.app)});
  }
  return base;
}

/**
 * Try to resolve the path to the given module, require it,
 * and create an instance
 */

function resolveApp(file) {
  var Core = require('..');

  if (exists(file.path)) {
    console.log(log.timestamp, 'module', color.bold(color.yellow(file.name)));
    var Base = require(file.path);
    var base = new Base(argv);
    base.log = log;

    if (typeof base.name === 'undefined') {
      base.name = file.name;
    }

    // if this is not an instance of base-app, load
    // app-base plugins onto the instance
    if (file.name !== 'app-base') {
      Core.plugins(base);
    }
    return base;
  }
}

function handleError(app, err) {
  if (app && app.hasListeners && app.hasListeners('error')) {
    app.emit('error', err);
  } else {
    console.error(err);
    process.exit(1);
  }
}
