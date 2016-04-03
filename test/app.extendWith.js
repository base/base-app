
'use strict';

require('mocha');
require('generate-foo/generator.js');

var path = require('path');
var assert = require('assert');
var commands = require('spawn-commands');
var utils = require('generator-util');
var option = require('base-option');
var gm = require('global-modules');
var App = require('..');
var app;

var fixture = path.resolve.bind(path, __dirname, 'fixtures/generators');

function install(name, cb) {
  commands({
    args: ['install', '-g', '--silent', name],
    cmd: 'npm'
  }, cb);
}

describe('.extendWith', function() {
  before(function(cb) {
    if (!utils.exists(path.resolve(gm, 'generate-bar'))) {
      install('generate-bar', cb);
    } else {
      cb();
    }
  });

  beforeEach(function() {
    app = new App();
    app.use(option());
    app.option('toAlias', function(name) {
      return name.replace(/^generate-/, '');
    });
  });

  it('should throw an error when a generator is not found', function(cb) {
    app.register('foo', function(app) {
      app.extendWith('fofoofofofofof');
    });

    try {
      app.getGenerator('foo');
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'cannot find generator fofoofofofofof');
      cb();
    }
  });

  it('should get a named generator', function(cb) {
    var count = 0;
    app.register('foo', function(app) {
      app.extendWith('bar');
      count++;
    });

    app.register('bar', function(app) {
      app.task('a', function() {});
      app.task('b', function() {});
      app.task('c', function() {});
    });

    app.getGenerator('foo');
    assert.equal(count, 1);
    cb();
  });

  it('should extend a generator with a named generator', function(cb) {
    app.register('foo', function(app) {
      assert(!app.tasks.a);
      assert(!app.tasks.b);
      assert(!app.tasks.c);

      app.extendWith('bar');
      assert(app.tasks.a);
      assert(app.tasks.b);
      assert(app.tasks.c);
      cb();
    });

    app.register('bar', function(app) {
      app.task('a', function() {});
      app.task('b', function() {});
      app.task('c', function() {});
    });

    app.getGenerator('foo');
  });

  it('should extend a generator with an array of generators', function(cb) {
    app.register('foo', function(app) {
      assert(!app.tasks.a);
      assert(!app.tasks.b);
      assert(!app.tasks.c);

      app.extendWith(['bar', 'baz', 'qux']);
      assert(app.tasks.a);
      assert(app.tasks.b);
      assert(app.tasks.c);
      cb();
    });

    app.register('bar', function(app) {
      app.task('a', function() {});
    });

    app.register('baz', function(app) {
      app.task('b', function() {});
    });

    app.register('qux', function(app) {
      app.task('c', function() {});
    });

    app.getGenerator('foo');
  });

  describe('invoke generators', function(cb) {
    it('should extend with a generator instance', function(cb) {
      app.register('foo', function(app) {
        var bar = app.getGenerator('bar');
        app.extendWith(bar);

        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        assert(app.tasks.hasOwnProperty('c'));
        cb();
      });

      app.register('bar', function(app) {
        app.isBar = true;
        app.task('a', function() {});
        app.task('b', function() {});
        app.task('c', function() {});
      });

      app.getGenerator('foo');
    });

    it('should invoke a named generator', function(cb) {
      app.register('foo', function(app) {
        app.extendWith('bar');

        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        assert(app.tasks.hasOwnProperty('c'));
        cb();
      });

      app.register('bar', function(app) {
        app.task('a', function() {});
        app.task('b', function() {});
        app.task('c', function() {});
      });

      app.getGenerator('foo');
    });
  });

  describe('extend generators', function(cb) {
    it('should extend a generator with a generator invoked by name', function(cb) {
      app.register('foo', function(app) {
        assert(!app.tasks.a);
        assert(!app.tasks.b);
        assert(!app.tasks.c);

        app.extendWith('bar');
        assert(app.tasks.a);
        assert(app.tasks.b);
        assert(app.tasks.c);
        cb();
      });

      app.register('bar', function(app) {
        app.task('a', function() {});
        app.task('b', function() {});
        app.task('c', function() {});
      });

      app.getGenerator('foo');
    });

    it('should extend a generator with a generator invoked by alias', function(cb) {
      app.register('foo', function(app) {
        assert(!app.tasks.a);
        assert(!app.tasks.b);
        assert(!app.tasks.c);

        app.extendWith('qux');
        assert(app.tasks.a);
        assert(app.tasks.b);
        assert(app.tasks.c);
        cb();
      });

      app.register('generate-qux', function(app) {
        app.task('a', function() {});
        app.task('b', function() {});
        app.task('c', function() {});
      });

      var qux = app.getGenerator('qux');
      app.getGenerator('foo');
    });

    it('should extend with a generator invoked by filepath', function(cb) {
      app.register('foo', function(app) {
        assert(!app.tasks.a);
        assert(!app.tasks.b);
        assert(!app.tasks.c);

        app.extendWith(fixture('qux'));
        assert(app.tasks.a);
        assert(app.tasks.b);
        assert(app.tasks.c);
        cb();
      });

      app.getGenerator('foo');
    });

    it('should extend with a generator invoked from node_modules by name', function(cb) {
      app.register('abc', function(app) {
        assert(!app.tasks.a);
        assert(!app.tasks.b);
        assert(!app.tasks.c);

        app.extendWith('generate-foo');
        assert(app.tasks.a);
        assert(app.tasks.b);
        assert(app.tasks.c);
        cb();
      });

      app.getGenerator('abc');
    });

    it('should extend with a generator invoked from global modules by name', function(cb) {
      app.register('zzz', function(app) {
        assert(!app.tasks.a);
        assert(!app.tasks.b);
        assert(!app.tasks.c);
        app.extendWith('generate-bar');

        assert(app.tasks.a);
        assert(app.tasks.b);
        assert(app.tasks.c);
        cb();
      });

      app.getGenerator('zzz');
    });

    it('should extend with a generator invoked from global modules by alias', function(cb) {
      app.register('generate-bar');

      app.register('zzz', function(app) {
        assert(!app.tasks.a);
        assert(!app.tasks.b);
        assert(!app.tasks.c);

        app.extendWith('bar');
        assert(app.tasks.a);
        assert(app.tasks.b);
        assert(app.tasks.c);
        cb();
      });

      app.getGenerator('zzz');
    });
  });

  describe('sub-generators', function(cb) {
    it('should invoke sub-generators', function(cb) {
      app.register('foo', function(app) {
        app.register('one', function(app) {
          app.task('a', function() {});
        });
        app.register('two', function(app) {
          app.task('b', function() {});
        });

        app.extendWith('one');
        app.extendWith('two');

        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        cb();
      });

      app.getGenerator('foo');
    });

    it('should invoke a sub-generator on the base instance', function(cb) {
      app.register('foo', function(app) {
        app.extendWith('bar.sub');
        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        assert(app.tasks.hasOwnProperty('c'));
        cb();
      });

      app.register('bar', function(app) {
        app.register('sub', function(sub) {
          sub.task('a', function() {});
          sub.task('b', function() {});
          sub.task('c', function() {});
        });
      });

      app.getGenerator('foo');
    });

    it('should invoke a sub-generator from node_modules by name', function(cb) {
      app.register('abc', function(app) {
        assert(!app.tasks.a);
        assert(!app.tasks.b);
        assert(!app.tasks.c);

        app.extendWith('xyz');
        assert(app.tasks.a);
        assert(app.tasks.b);
        assert(app.tasks.c);
        cb();
      });

      app.register('xyz', function(app) {
        app.extendWith('generate-foo');
      });

      app.getGenerator('abc');
    });

    it('should invoke a sub-generator from node_modules by alias', function(cb) {
      app.register('generate-foo');

      app.register('abc', function(app) {
        assert(!app.tasks.a);
        assert(!app.tasks.b);
        assert(!app.tasks.c);

        app.extendWith('xyz');
        assert(app.tasks.a);
        assert(app.tasks.b);
        assert(app.tasks.c);
        cb();
      });

      app.register('xyz', function(app) {
        app.extendWith('foo');
      });

      app.getGenerator('abc');
    });

    it('should invoke an array of sub-generators', function(cb) {
      app.register('foo', function(app) {
        app.register('one', function(app) {
          app.task('a', function() {});
        });
        app.register('two', function(app) {
          app.task('b', function() {});
        });

        app.extendWith(['one', 'two']);

        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        cb();
      });

      app.getGenerator('foo');
    });

    it('should invoke sub-generators from sub-generators', function(cb) {
      app.register('foo', function(app) {
        app.register('one', function(sub) {
          sub.register('a', function(a) {
            a.task('a', function() {});
          });
        });

        app.register('two', function(sub) {
          sub.register('a', function(a) {
            a.task('b', function() {});
          });
        });

        app.extendWith('one.a');
        app.extendWith('two.a');

        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        cb();
      });

      app.getGenerator('foo');
    });

    it('should invoke an array of sub-generators from sub-generators', function(cb) {
      app.register('foo', function(app) {
        app.register('one', function(sub) {
          sub.register('a', function(a) {
            a.task('a', function() {});
          });
        });

        app.register('two', function(sub) {
          sub.register('a', function(a) {
            a.task('b', function() {});
          });
        });

        app.extendWith(['one.a', 'two.a']);

        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        cb();
      });

      app.getGenerator('foo');
    });

    it('should invoke sub-generator that invokes another generator', function(cb) {
      app.register('foo', function(app) {
        app.extendWith('bar');
        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        assert(app.tasks.hasOwnProperty('c'));
        cb();
      });

      app.register('bar', function(app) {
        app.extendWith('baz');
      });

      app.register('baz', function(app) {
        app.task('a', function() {});
        app.task('b', function() {});
        app.task('c', function() {});
      });

      app.getGenerator('foo');
    });

    it('should invoke sub-generator that invokes another sub-generator', function(cb) {
      app.register('foo', function(app) {
        app.extendWith('bar.sub');
        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        assert(app.tasks.hasOwnProperty('c'));
        cb();
      });

      app.register('bar', function(app) {
        app.register('sub', function(sub) {
          sub.extendWith('baz.sub');
        });
      });

      app.register('baz', function(app) {
        app.register('sub', function(sub) {
          sub.task('a', function() {});
          sub.task('b', function() {});
          sub.task('c', function() {});
        });
      });

      app.getGenerator('foo');
    });

    it('should invoke sub-generator that invokes another sub-generator', function(cb) {
      app.register('foo', function(app) {
        app.extendWith('bar.sub');
        assert(app.tasks.hasOwnProperty('a'));
        assert(app.tasks.hasOwnProperty('b'));
        assert(app.tasks.hasOwnProperty('c'));
        cb();
      });

      app.register('bar', function(app) {
        app.register('sub', function(sub) {
          sub.extendWith('baz.sub');
        });
      });

      app.register('baz', function(app) {
        app.register('sub', function(sub) {
          sub.task('a', function() {});
          sub.task('b', function() {});
          sub.task('c', function() {});
        });
      });

      app.getGenerator('foo');
    });
  });
});
