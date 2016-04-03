#!/usr/bin/env node

var runner = require('../runner');
var config = {
  name: 'app',
  processTitle: 'base-app',
  moduleName: 'base-app',
  configName: 'appfile',
  extensions: {
    '.js': null
  }
};

runner(config, function(tasks, base, argv) {
  base.option('lookup', function(key) {
    return [key, 'generate-' + key, 'verb-' + key + '-generator'];
  });

  base.generate(tasks, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    base.emit('done');
    process.exit();
  });
});
