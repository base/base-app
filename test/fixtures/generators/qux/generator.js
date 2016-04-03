'use strict';

module.exports = function(app, base, env) {
  console.log('generator >', this.alias);
  
  app.task('a', function(cb) {
    console.log('task >', this.name);
    cb();
  });
  app.task('b', function(cb) {
    console.log('task >', this.name);
    cb();
  });
  app.task('c', function(cb) {
    console.log('task >', this.name);
    cb();
  });
};
