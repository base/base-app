'use strict';

const path = require('path');
const Time = require('time-diff');
const time = new Time();
time.start('load');

const runtimes = require('base-runtimes');
const Liftoff = require('liftoff');
const utils = require('./utils');
utils.timestamp('initializing');

module.exports = function(Ctor, config, argv, cb) {
  var cli = new Liftoff(config);
  var diff = utils.logTimeDiff(argv);
  var ctx = {};

  diff(time, 'load', 'init: loaded requires');
  time.start('env');

  // if `configName` is passed via command line, update now
  if (argv[config.configName]) {
    argv.configPath = path.resolve(argv[config.configName]);
  }

  cli.launch(argv, function(env) {
    diff(time, 'env', 'init: loaded environment');
    time.start('app');

    env.configName = config.configName;
    env.configfile = env.configName + '.js';

    try {
      var Base = env.modulePath ? require(env.modulePath) : Ctor;
      var base = new Base(argv);

      base.use(errors(env));
      base.use(listen());
      base.use(runtimes());

      var tasks = argv._.length ? argv._ : ['default'];
      if (typeof config.setTasks === 'function') {
        tasks = config.setTasks(base, env.configfile, argv._);
      }

      if (env.configPath) {
        base.register('default', env.configPath);
      }

      diff(time, 'app', 'init: initialized ' + config.name);
      diff(time, 'load', 'init: finished');

      if (env.configPath) {
        utils.configPath('using ' + env.configName, env.configPath);
      }

      process.nextTick(function() {
        ctx.argv = argv;
        ctx.config = config;
        ctx.env = env;
        ctx.tasks = tasks;
        cb(base, ctx);
      });

    } catch (err) {
      if (base) {
        base.emit('error', err);
      } else {
        console.log(err.stack);
        process.exit(1);
      }
    }
  });
};

function errors(env) {
  return function(app) {
    if (!app.isApp) return;
    if (app.isRegistered('cli-errors')) return;
    app.on('error', function(err) {
      if (err.message === 'no default task defined') {
        console.warn('No tasks defined, stopping.');
        process.exit();
      }
      console.error(err.stack);
      process.exit(1);
    });
  };
}

/**
 * Listen for events on `app`
 *
 * @param {Object} app
 * @param {Object} options
 */

function listen(options) {
  return function(app) {
    options = options || {};
    var cwds = [app.cwd];

    app.on('option', function(key, val) {
      if (key === 'cwd') {
        val = path.resolve(val);

        if (cwds[cwds.length - 1] !== val) {
          var dir = utils.magenta('~/' + utils.homeRelative(val));
          utils.timestamp('changing cwd to ' + dir);
          cwds.push(val);
        }
      }
    });
  };
}
