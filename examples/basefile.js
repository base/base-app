'use strict';

module.exports = function(app, base) {
  app.task('default', function(cb) {
    console.log('generator', app.name, '> task', this.name);
    cb();
  });
};
