#!/usr/bin/env node

var App = require('..');
var argv = require('minimist')(process.argv.slice(2));
var runner = require('../runner');
var config = {
  name: 'app',
  runner: require('../package'),
  setTasks: function(app, configfile, tasks) {
    if (tasks.length === 0) {
      if (app.exists && app.exists('.verb.md') && !app.exists(configfile)) {
        return ['readme'];
      }
      return ['default'];
    }
    return tasks;
  },
  moduleName: 'base-app',
  extensions: {
    '.js': null
  }
};

runner(App, config, argv, function(base, options) {
  base.option('lookup', function(key) {
    return [key, `generate-${key}`, `verb-${key}-generator`];
  });

  // var opts = base.pkg.get(env.configName);
  var opts = base.pkg.get('verb');
  var argv = options.argv;

  if (opts && !argv.noconfig) {
    base.set('cache.config', opts);
    base.option(opts);
  }

  base.option(argv);

  base.generate(options.tasks, function(err) {
    if (err) {
      base.emit('error', err);
    } else {
      base.emit('done');
      process.exit();
    }
  });
});

