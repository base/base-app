'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var option = require('base-option');
var Base = require('..');
var base;

var fixtures = path.resolve.bind(path, __dirname, 'fixtures');

describe('.generator', function() {
  beforeEach(function() {
    base = new Base();
    base.use(option());

    base.option('toAlias', function(key) {
      return key.replace(/^generate-(.*)/, '$1');
    });
  });

  describe('generator', function() {
    it('should get a generator by alias', function() {
      base.register('generate-foo', require('generate-foo'));
      var gen = base.getGenerator('foo');
      assert(gen);
      assert.equal(gen.env.name, 'generate-foo');
      assert.equal(gen.env.alias, 'foo');
    });

    it('should get a generator using a custom lookup function', function() {
      var gen = base.getGenerator('foo', {
        lookup: function(key) {
          return ['generate-' + key, 'verb-' + key + '-generator', key];
        }
      });

      assert(gen);
      assert.equal(gen.env.name, 'generate-foo');
      assert.equal(gen.env.alias, 'foo');
    });
  });

  describe('register > function', function() {
    it('should register a generator function by name', function() {
      base.generator('foo', function() {});
      assert(base.generators.hasOwnProperty('foo'));
    });

    it('should register a generator function by alias', function() {
      base.generator('generate-abc', function() {});
      assert(base.generators.hasOwnProperty('generate-abc'));
    });
  });

  describe('get > alias', function() {
    it('should get a generator by alias', function() {
      base.generator('generate-abc', function() {});
      var abc = base.generator('abc');
      assert(abc);
      assert.equal(typeof abc, 'object');
    });
  });

  describe('get > name', function() {
    it('should get a generator by name', function() {
      base.generator('generate-abc', function() {});
      var abc = base.generator('generate-abc');
      assert(abc);
      assert.equal(typeof abc, 'object');
    });
  });

  describe('generators', function() {
    it('should invoke a registered generator when `getGenerator` is called', function(cb) {
      base.register('foo', function(app) {
        app.task('default', function() {});
        cb();
      });
      base.getGenerator('foo');
    });

    it('should expose the generator instance on `app`', function(cb) {
      base.register('foo', function(app) {
        app.task('default', function(next) {
          assert.equal(app.get('a'), 'b');
          next();
        });
      });

      var foo = base.getGenerator('foo');
      foo.set('a', 'b');
      foo.build('default', function(err) {
        if (err) return cb(err);
        cb();
      });
    });

    it('should expose the "base" instance on `base`', function(cb) {
      base.set('x', 'z');
      base.register('foo', function(app, base) {
        app.task('default', function(next) {
          assert.equal(base.get('x'), 'z');
          next();
        });
      });

      var foo = base.getGenerator('foo');
      foo.set('a', 'b');
      foo.build('default', function(err) {
        if (err) return cb(err);
        cb();
      });
    });

    it('should expose the "env" object on `env`', function(cb) {
      base.register('foo', function(app, base, env) {
        app.task('default', function(next) {
          assert.equal(env.alias, 'foo');
          next();
        });
      });

      base.getGenerator('foo').build('default', function(err) {
        if (err) return cb(err);
        cb();
      });
    });

    it('should expose an app\'s generators on app.generators', function(cb) {
      base.register('foo', function(app) {
        app.register('a', function() {});
        app.register('b', function() {});

        app.generators.hasOwnProperty('a');
        app.generators.hasOwnProperty('b');
        cb();
      });

      base.getGenerator('foo');
    });

    it('should expose all root generators on base.generators', function(cb) {
      base.register('foo', function(app, b) {
        b.generators.hasOwnProperty('foo');
        b.generators.hasOwnProperty('bar');
        b.generators.hasOwnProperty('baz');
        cb();
      });

      base.register('bar', function(app, base) {});
      base.register('baz', function(app, base) {});
      base.getGenerator('foo');
    });
  });

  describe('cross-generators', function() {
    it('should get a generator from another generator', function(cb) {
      base.register('foo', function(app, b) {
        var bar = b.getGenerator('bar');
        assert(bar);
        cb();
      });

      base.register('bar', function(app, base) {});
      base.register('baz', function(app, base) {});
      base.getGenerator('foo');
    });

    it('should set options on another generator instance', function(cb) {
      base.generator('foo', function(app) {
        app.task('default', function(next) {
          assert.equal(app.option('abc'), 'xyz');
          next();
        });
      });

      base.generator('bar', function(app, b) {
        var foo = b.getGenerator('foo');
        foo.option('abc', 'xyz');
        foo.build(function(err) {
          if (err) return cb(err);
          cb();
        });
      });
    });
  });

  describe('generators > filepath', function() {
    it('should register a generator function from a file path', function() {
      var one = base.generator('one', fixtures('one/generator.js'));
      assert(base.generators.hasOwnProperty('one'));
      assert(typeof base.generators.one === 'object');
      assert.deepEqual(base.generators.one, one);
    });

    it('should register an instance from a file path', function() {
      var two = base.generator('two', fixtures('two/generator.js'));
      assert(base.generators.hasOwnProperty('two'));
      assert(typeof base.generators.two === 'object');
      assert.deepEqual(base.generators.two, two);
    });

    it('should get a registered generator by name', function() {
      var one = base.generator('one', fixtures('one/generator.js'));
      var two = base.generator('two', fixtures('two/generator.js'));
      assert.deepEqual(base.generator('one'), one);
      assert.deepEqual(base.generator('two'), two);
    });
  });

  describe('tasks', function() {
    it('should expose a generator\'s tasks on app.tasks', function(cb) {
      base.register('foo', function(app) {
        app.task('a', function() {});
        app.task('b', function() {});
        assert(app.tasks.a);
        assert(app.tasks.b);
        cb();
      });

      base.getGenerator('foo');
    });

    it('should get tasks from another generator', function(cb) {
      base.register('foo', function(app, b) {
        var baz = b.getGenerator('baz');
        var task = baz.tasks.aaa;
        assert(task);
        cb();
      });

      base.register('bar', function(app, base) {});
      base.register('baz', function(app, base) {
        app.task('aaa', function() {});
      });
      base.getGenerator('foo');
    });
  });
});
