'use strict';

/**
 * testing...
 */

module.exports = function(app, base, env) {
  app.task('default', function(cb) {
    console.log('e > default');
    cb();
  });
  app.task('one', function(cb) {
    console.log('e > one');
    cb();
  });
  app.task('two', function(cb) {
    console.log('e > two');
    cb();
  });

  app.task('three', function(cb) {
    app.generate('docs:x', cb);
  });

  app.register('ccc', '../c');

  app.register('docs', function(docs) {
    console.log('generator >', this.alias);

    docs.task('x', function(cb) {
      console.log('e > x');
      cb();
    });
    docs.task('y', function(cb) {
      console.log('e > y');
      cb();
    });
    docs.task('z', function(cb) {
      console.log('e > z');
      cb();
    });
  });
};
