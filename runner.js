'use strict';

const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const runtimes = require('base-runtimes');
const Liftoff = require('liftoff');
const log = require('log-utils');

module.exports = function(config, configfile, cb) {
  const cli = new Liftoff(config);

  cli.launch(argv, function(env) {
    try {
      var Base = env.modulePath ? require(env.modulePath) : require('./');
      var base = new Base(argv);
      base.use(exists());
      base.use(runtimes());
      base.set('cache.argv', argv);
      base.on('error', function(err) {
        if (err.message === 'no default task defined') {
          console.warn('No tasks defined, stopping. If a', configfile, 'was found.');
          process.exit();
        }
        console.error(err.stack);
        process.exit(1);
      });

      if (env.configPath) {
        base.generator('default', env.configPath, argv);
      }
    } catch (err) {
      if (base && base.emit) {
        err.origin = __filename;
        base.emit('error', err);
      } else {
        throw err;
      }
    }

    var tasks = setTasks(base, argv);
    cb(tasks, base, argv);
  });
};

function exists(options) {
  return function plugin(app) {
    if (!app.isApp) return;
    if (app.isRegistered('file-exists')) return;

    app.define('exists', function(filename) {
      try {
        fs.statSync(path.resolve(this.cwd, filename));
        return true;
      } catch (err) {}
      return false;
    });
  }
}

function setTasks(base, argv) {
  if (argv._.length === 0) {
    if (base.exists('.verb.md') && !base.exists('appfile.js')) {
      return ['readme'];
    }
    return ['default'];
  }
  return argv._;
}
