'use strict';

var defaults = require('./defaults');
var fs = require('assemble-fs');

module.exports = function(app, base, env, options) {
  app.option('runner', require('./package'));
  app.use(defaults());

  // app.extendWith('verb-readme-generator');

  // app.generator('abc', 'verb-readme-generator');
  // app.register('abc', 'verb-readme-generator');

  // console.log(app.getGenerator('abc'));

  app.task('foo', function(cb) {
    app.generate('readme', cb);
    // app.generate('verb-readme-generator', cb);
  });

  app.task('bar', function(cb) {
    app.build('baz', cb);
  });

  app.task('baz', function(cb) {
    cb();
  });

  app.task('qux', function* () {
    var thunkify = require('thunkify');
    var render = thunkify(app.render.bind(app));
    app.engine('md', require('engine-base'));
    app.create('pages');
    app.data({name: 'Brian'});
    var page = app.page('foo.md', {content: '<%= name %>'});
    var view = yield render(page);
    console.log(view);
  });

  app.task('fez', function* () {
    var thunkify = require('thunkify');
    var render = thunkify(app.render.bind(app));
    app.engine('md', require('engine-base'));
    app.create('pages');
    app.data({name: 'Brian'});
    var page = app.page('foo.md', {content: '<%= name %>'});
    var page2 = app.page('bar.md', {content: '<%= name %>'});
    var views = yield [page, page2].map(function(p) {
      return render(p);
    });

    console.log(views);
  });

  // app.register('foo', function(foo) {
  //   foo.register('abc', 'verb-readme-generator');
  //   foo.task('a', function(cb) {
  //     cb();
  //   });
  //   foo.task('b', function(cb) {
  //     cb();
  //   });

  //   foo.task('default', ['a', 'b']);
  // });

  // app.register('bar', function(bar) {
  //   bar.task('default', function(cb) {
  //     app.build('baz', cb);
  //   });

  //   bar.task('zzz', function(cb) {
  //     app.generate('foo:a,b', cb);
  //   });
  // });

  // app.task('default', ['bar']);
  app.task('default', function(cb) {
    cb();
  });
};
