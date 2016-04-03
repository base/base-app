'use strict';

module.exports = function(app, base, env, options) {
  // this.extendWith('verb-readme-generator');
  this.register('abc', 'verb-readme-generator');

  this.task('foo', function(cb) {
    app.generate('readme', cb);
  });

  this.task('bar', function(cb) {
    app.build('baz', cb);
  });

  this.task('baz', function(cb) {
    cb();
  });

  this.register('foo', function() {
    this.task('default', function(cb) {
      cb();
    });
    this.task('a', function(cb) {
      cb();
    });
    this.task('b', function(cb) {
      cb();
    });
  });

  this.register('bar', function() {
    this.task('default', function(cb) {
      app.build('baz', cb);
    });
  });

  this.task('default', ['foo', 'bar']);
};
