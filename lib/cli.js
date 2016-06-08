'use strict';

process.ORIGINAL_CWD = process.cwd();

var path = require('path');
var find = require('find-pkg');
var log = require('log-utils');
var exists = require('fs-exists-sync');
var extend = require('extend-shallow');
// var resolve = require('./resolve');
var resolve = require('resolve-file');
var gm = require('global-modules');
var initialized;
var argv = require('yargs-parser')(process.argv.slice(2), {
  alias: {configfile: 'f', template: 't'}
});

module.exports = function(Core, config, cb) {
  if (typeof cb !== 'function') {
    throw new TypeError('expected a callback function');
  }
  if (!config || typeof config !== 'object') {
    throw new TypeError('expected config to be an object');
  }

  var opts = extend({}, config, argv);
  var tasks = opts._.length ? opts._ : ['default'];

  function logger() {
    if (opts.silent) return;
    console.log.apply(console, arguments);
  }

  /**
   * Resolve `package.json` filepath and use it for `cwd`
   */

  var pkgPath = find.sync(process.cwd());
  var cwd = path.dirname(pkgPath);

  /**
   * Set `cwd`
   */

  if (cwd !== process.cwd()) {
    logger(log.timestamp, 'using cwd', log.yellow('~' + cwd));
    process.chdir(cwd);
  }

  /**
   * Check for config file
   */

  var configfile = tryResolve(opts.configfile || 'basefile.js', cwd);
  if (!exists(configfile)) {
    console.error('please specify a configfile using --configfile <filename> or -f <filename>');
    process.exit(1);
  }

  /**
   * Log configfile
   */

  logger(log.timestamp, 'using file', log.green('~' + configfile));

  /**
   * Get the Base ctor and instance to use
   */

  var base = resolveBase();
  if (!(base instanceof Core)) {
    base = new Core({}, opts);
  }

  /**
   * Require the config file (instance or function)
   */


  base.set('cache.argv', opts);
  var app = require(configfile);

  /**
   *
   */

  base.option('lookup', function(name) {
    console.log(base._name)
    var patterns = [];
    if (!/^(generate|verb|assemble)-/.test(name)) {
      patterns.push(`generate-${name}`);
      patterns.push(`verb-${name}-generator`);
      patterns.push(`assemble-${name}`);
    }
    return patterns;
  });

  base.on('unresolved', function(search, app) {
    var resolved = resolve(search.name) || resolve(search.name, {cwd: gm});
    if (resolved) {
      search.app = app.register(search.name, resolved);
    }
  });

  /**
   * Invoke `app`
   */

  if (typeof app === 'function' && typeof base.register === 'function') {
    base.register('default', app);
  } else if (typeof app === 'function') {
    base.use(app);
  } else if (app) {
    base = app;
  }

  /**
   * Handle errors
   */

  if (!base) {
    handleError(base, new Error('cannot run config file: ' + configfile));
  }
  if (typeof base !== 'function' && Object.keys(base).length === 0) {
    handleError(base, new Error('expected a function or instance of Base to be exported'));
  }

  /**
   * Setup listeners
   */

  base.on('build', function(event, build) {
    var prefix = event === 'finished' ? log.success + ' ' : '';
    logger(log.timestamp, event, build.key, prefix + log.red(build.time));
  });

  base.on('task', function(event, task) {
    logger(log.timestamp, event, task.key, log.red(task.time));
  });

  base.on('error', function(err) {
    logger(err.stack);
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
      { name: 'update', path: path.resolve(cwd, 'node_modules/update')},
      { name: 'verb', path: path.resolve(cwd, 'node_modules/verb')},
      { name: 'core', path: path.resolve(__dirname, '..')},
    ];

    var len = paths.length;
    var idx = -1;

    while (++idx < len) {
      var file = paths[idx];
      if (opts.app && file.name !== opts.app) {
        continue;
      }
      if ((base = resolveApp(file))) {
        return base;
      }
    }

    if (opts.app) {
      base = resolveApp({name: opts.app, path: path.resolve(cwd, 'node_modules', opts.app)});
    }
    return base;
  }

  /**
   * Try to resolve the path to the given module, require it,
   * and create an instance
   */

  function resolveApp(file) {
    if (exists(file.path)) {
      var Base = require(file.path);
      var base = new Base({isApp: true}, opts);
      base.define('log', log);

      if (typeof base.name === 'undefined') {
        base.name = file.name;
      }

      // if this is not an instance of base-app, load
      // app-base plugins onto the instance
      if (file.name !== 'core') {
        Core.plugins(base);
      }
      return base;
    }
  }

  function tryResolve(name, cwd) {
    var fp = path.resolve(cwd, name);
    if (exists(fp)) {
      return fp;
    }
    try {
      return require.resolve(fp);
    } catch (err) {}
    try {
      return require.resolve(name, {basedir: cwd});
    } catch (err) {}
  }

  function handleError(app, err) {
    if (app && app.hasListeners && app.hasListeners('error')) {
      app.emit('error', err);
    } else {
      console.error(err.stack);
      process.exit(1);
    }
  }

  cb(null, tasks, base);
};
