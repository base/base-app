#!/usr/bin/env node

var Base = require('..');
var argv = require('yargs-parser')(process.argv.slice(2), {
  alias: {configfile: 'f'}
});

Base.cli(Base, argv, function(err, tasks, app) {
  app.generate(tasks, function(err) {
    if (err) return console.log(err);
    app.emit('done');
  });
});
