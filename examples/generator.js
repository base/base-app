'use strict';

var Base = require('..');
var app = new Base();

// app.disable('silent');

app.task('foo', function(cb) {
  // console.log('task >', this.name);
  cb();
});

app.task('bar', function(cb) {
  // console.log('task >', this.name);
  cb();
});

app.register('one', function(gen) {
  gen.task('foo', function(cb) {
    // console.log('generator', gen.name, 'task >', this.name);
    cb();
  });

  gen.task('bar', function(cb) {
    // console.log('generator', gen.name, 'task >', this.name);
    cb();
  });

  gen.task('default', ['foo', 'bar']);
});

app.register('two', function(gen) {
  gen.task('foo', function(cb) {
    // console.log('generator', gen.name, 'task >', this.name);
    cb();
  });

  gen.task('bar', function(cb) {
    // console.log('generator', gen.name, 'task >', this.name);
    cb();
  });

  gen.task('default', ['foo', 'bar']);
});

app.task('default', ['foo', 'bar']);

module.exports = app;
