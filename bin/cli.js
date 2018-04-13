#!/usr/bin/env node

process.ORIGINAL_CWD = process.cwd();
const Base = require('..');
const argv = require('minimist')(process.argv.slice(2), {
  alias: { configfile: 'f' }
});

Base.cli(Base, argv, function(err, tasks, app) {
  if (err) return console.log(err);

  app.generate(tasks, function(err) {
    if (err) return console.log(err);
    app.emit('done');
  });
});
