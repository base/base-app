'use strict';

process.ORIGINAL_CWD = process.cwd();

const fs = require('fs');
const path = require('path');
const gm = require('global-modules');
const log = require('log-utils');
const find = require('find-pkg');
const resolve = require('resolve-file');
const options = { alias: { configfile: 'f', template: 't' } };
const argv = require('minimist')(process.argv.slice(2), options);

module.exports = function(Core, config, cb) {
  if (typeof cb !== 'function') {
    throw new TypeError('expected a callback function');
  }
  if (!config || typeof config !== 'object') {
    throw new TypeError('expected config to be an object');
  }

  const opts = Object.assign({}, config, argv);
  const tasks = opts._.length ? opts._ : ['default'];

  function logger(...args) {
    if (!opts.silent) console.log(...args);
  }

  /**
   * Resolve `package.json` filepath and use it for `cwd`
   */

  const pkgPath = find.sync(process.cwd(), 1);
  const cwd = path.dirname(pkgPath);

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

  const configfile = tryResolve(opts.configfile || 'basefile.js', cwd);
  if (!fs.existsSync(configfile)) {
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

  let base = resolveBase();
  if (!(base instanceof Core)) {
    base = new Core({}, opts);
  }

  /**
   * Require the config file (instance or function)
   */

  base.set('cache.argv', opts);
  const app = require(configfile);

  /**
   *
   */

  base.option('lookup', function(name) {
    const patterns = [];
    if (!/^(generate|verb|assemble)-/.test(name)) {
      patterns.push(`generate-${name}`, `verb-${name}-generator`, `assemble-${name}`);
    }
    return patterns;
  });

  base.on('unresolved', function(search, app) {
    const resolved = resolve(search.name) || resolve(search.name, { cwd: gm });
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
   * Resolve the "app" to use
   */

  function resolveBase(app) {
    const paths = [
      { name: 'base', path: path.resolve(cwd, 'node_modules/base') },
      { name: 'base-app', path: path.resolve(cwd, 'node_modules/base-app') },
      { name: 'assemble-core', path: path.resolve(cwd, 'node_modules/assemble-core') },
      { name: 'assemble', path: path.resolve(cwd, 'node_modules/assemble') },
      { name: 'generate', path: path.resolve(cwd, 'node_modules/generate') },
      { name: 'update', path: path.resolve(cwd, 'node_modules/update') },
      { name: 'verb', path: path.resolve(cwd, 'node_modules/verb') },
      { name: 'core', path: path.resolve(__dirname, '..') }
    ];

    for (const file of paths) {
      if (opts.app && file.name === opts.app && (app = resolveApp(file))) {
        return app;
      }
    }

    if (opts.app) {
      app = resolveApp({
        name: opts.app,
        path: path.resolve(cwd, 'node_modules', opts.app)
      });
    }
    return app;
  }

  /**
   * Try to resolve the path to the given module, require it,
   * and create an instance
   */

  function resolveApp(file) {
    if (fs.existsSync(file.path)) {
      const Base = require(file.path);
      const base = new Base(null, opts);
      base.define('log', log);

      if (typeof base.name === 'undefined') {
        base.name = file.name;
      }

      // if this is not an instance of base-app, load
      // app-base plugins onto the instance
      // if (file.name !== 'core') {
      //   Core.plugins(base);
      // }
      return base;
    }
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

function tryResolve(name, cwd) {
  const fp = path.resolve(cwd, name);
  if (fs.existsSync(fp)) {
    return fp;
  }
  try {
    return require.resolve(fp);
  } catch (err) { /* ignore */ }
  try {
    return require.resolve(name, { basedir: cwd });
  } catch (err) { /* ignore */ }
}
