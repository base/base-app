'use strict';

require('mocha');
var assert = require('assert');
var option = require('base-option');
var Base = require('..');
var base;

describe('.generateEach', function() {
  beforeEach(function() {
    base = new Base();
    base.use(option());
  });

  describe('generators', function(cb) {
    it('should throw an error when a generator is not found', function(cb) {
      base.generateEach('fdsslsllsfjssl', function(err) {
        assert(err);
        assert.equal('Cannot find generator: "fdsslsllsfjssl"', err.message);
        cb();
      });
    });

    // special case
    it('should throw an error when a generator is not found in argv.cwd', function(cb) {
      base.option('cwd', 'foo/bar/baz');
      base.generateEach('sflsjljskksl', function(err) {
        assert(err);
        assert.equal('Cannot find generator: "sflsjljskksl" in "foo/bar/baz"', err.message);
        cb();
      });
    });

    it('should throw an error when a task is not found', function(cb) {
      base.register('fdsslsllsfjssl', function() {});
      base.generateEach('fdsslsllsfjssl:foo', function(err) {
        assert(err);
        assert.equal('Cannot find task: "foo" in generator: "fdsslsllsfjssl"', err.message);
        cb();
      });
    });

    it('should run a task on the instance', function(cb) {
      base.task('foo', function(next) {
        next();
      });

      base.generateEach('foo', function(err) {
        assert(!err);
        cb();
      });
    });

    it('should run an array of tasks on the instance', function(cb) {
      var count = 0;
      base.task('a', function(next) {
        count++;
        next();
      });
      base.task('b', function(next) {
        count++;
        next();
      });
      base.task('c', function(next) {
        count++;
        next();
      });

      base.generateEach('a,b,c', function(err) {
        if (err) return cb(err);
        assert.equal(count, 3);
        assert(!err);
        cb();
      });
    });

    it('should run the default task on a registered generator', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.task('default', function(next) {
          count++;
          next();
        });
      });

      base.generateEach('foo', function(err) {
        if (err) return cb(err);
        assert.equal(count, 1);
        cb();
      });
    });

    it('should run an array of generators', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.task('default', function(next) {
          count++;
          next();
        });
      });

      base.register('bar', function(app) {
        app.task('default', function(next) {
          count++;
          next();
        });
      });

      base.generateEach(['foo', 'bar'], function(err) {
        if (err) return cb(err);
        assert.equal(count, 2);
        cb();
      });
    });

    it('should run the default task on the default generator', function(cb) {
      var count = 0;
      base.register('default', function(app) {
        app.task('default', function(next) {
          count++;
          next();
        });
      });

      base.generateEach(function(err) {
        if (err) return cb(err);
        assert.equal(count, 1);
        cb();
      });
    });

    it('should run the specified task on a registered generator', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.task('default', function(next) {
          count++;
          next();
        });

        app.task('abc', function(next) {
          count++;
          next();
        });
      });

      base.generateEach('foo:abc', function(err) {
        if (err) return cb(err);
        assert.equal(count, 1);
        cb();
      });
    });

    it('should run an array of tasks on a registered generator', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.task('default', function(next) {
          count++;
          next();
        });

        app.task('a', function(next) {
          count++;
          next();
        });

        app.task('b', function(next) {
          count++;
          next();
        });

        app.task('c', function(next) {
          count++;
          next();
        });
      });

      base.generateEach('foo:a,b,c', function(err) {
        if (err) return cb(err);
        assert.equal(count, 3);
        cb();
      });
    });
  });

  describe('sub-generators', function(cb) {
    it('should run the default task on a registered sub-generator', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.register('sub', function(sub) {
          sub.task('default', function(next) {
            count++;
            next();
          });

          sub.task('abc', function(next) {
            count++;
            next();
          });
        });
      });

      base.generateEach('foo.sub', function(err) {
        if (err) return cb(err);
        assert.equal(count, 1);
        cb();
      });
    });

    it('should run the specified task on a registered sub-generator', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.register('sub', function(sub) {
          sub.task('default', function(next) {
            count++;
            next();
          });

          sub.task('abc', function(next) {
            count++;
            next();
          });
        });
      });

      base.generateEach('foo.sub:abc', function(err) {
        if (err) return cb(err);
        assert.equal(count, 1);
        cb();
      });
    });

    it('should run an array of tasks on a registered sub-generator', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.register('bar', function(bar) {
          bar.task('default', function(next) {
            count++;
            next();
          });

          bar.task('a', function(next) {
            count++;
            next();
          });

          bar.task('b', function(next) {
            count++;
            next();
          });

          bar.task('c', function(next) {
            count++;
            next();
          });
        });
      });

      base.generateEach('foo.bar:a,b,c', function(err) {
        if (err) return cb(err);
        assert.equal(count, 3);
        cb();
      });
    });

    it('should run an multiple tasks on a registered sub-generator', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.register('bar', function(bar) {
          bar.task('default', function(next) {
            count++;
            next();
          });

          bar.task('a', function(next) {
            count++;
            next();
          });

          bar.task('b', function(next) {
            count++;
            next();
          });

          bar.task('c', function(next) {
            count++;
            next();
          });
        });
      });

      base.register('qux', function(app) {
        app.register('fez', function(fez) {
          fez.task('default', function(next) {
            count++;
            next();
          });

          fez.task('a', function(next) {
            count++;
            next();
          });

          fez.task('b', function(next) {
            count++;
            next();
          });

          fez.task('c', function(next) {
            count++;
            next();
          });
        });
      });

      base.generateEach(['foo.bar:a,b,c', 'qux.fez:a,b,c'], function(err) {
        if (err) return cb(err);
        assert.equal(count, 6);
        cb();
      });
    });
  });

  describe('cross-generator', function(cb) {
    it('should run a generator from another generator', function(cb) {
      var res = '';

      base.register('foo', function(app, two) {
        app.register('sub', function(sub) {
          sub.task('default', function(next) {
            res += 'foo > sub > default ';
            base.generateEach('bar.sub', next);
          });
        });
      });

      base.register('bar', function(app) {
        app.register('sub', function(sub) {
          sub.task('default', function(next) {
            res += 'bar > sub > default ';
            next();
          });
        });
      });

      base.generateEach('foo.sub', function(err) {
        if (err) return cb(err);
        assert.equal(res, 'foo > sub > default bar > sub > default ');
        cb();
      });
    });

    it('should run the specified task on a registered sub-generator', function(cb) {
      var count = 0;
      base.register('foo', function(app) {
        app.register('sub', function(sub) {
          sub.task('default', function(next) {
            count++;
            next();
          });

          sub.task('abc', function(next) {
            count++;
            next();
          });
        });
      });

      base.generateEach('foo.sub:abc', function(err) {
        if (err) return cb(err);
        assert.equal(count, 1);
        cb();
      });
    });
  });

  describe('events', function(cb) {
    it('should emit generate', function(cb) {
      base.on('generate', function() {
        cb();
      });

      base.register('foo', function(app) {
        app.register('sub', function(sub) {
          sub.task('default', function(next) {
            next();
          });

          sub.task('abc', function(next) {
            next();
          });
        });
      });

      base.generateEach('foo.sub:abc', function(err) {
        if (err) return cb(err);
      });
    });

    it('should expose the generator alias as the first parameter', function(cb) {
      base.on('generate', function(name) {
        assert.equal(name, 'sub');
        cb();
      });

      base.register('foo', function(app) {
        app.register('sub', function(sub) {
          sub.task('default', function(next) {
            next();
          });

          sub.task('abc', function(next) {
            next();
          });
        });
      });

      base.generateEach('foo.sub:abc', function(err) {
        if (err) return cb(err);
      });
    });

    it('should expose the tasks array as the second parameter', function(cb) {
      base.on('generate', function(name, tasks) {
        assert.deepEqual(tasks, ['abc']);
        cb();
      });

      base.register('foo', function(app) {
        app.register('sub', function(sub) {
          sub.task('default', function(next) {
            next();
          });

          sub.task('abc', function(next) {
            next();
          });
        });
      });

      base.generateEach('foo.sub:abc', function(err) {
        if (err) return cb(err);
      });
    });
  });
});
