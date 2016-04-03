/*!
 * bbb <https://github.com/jonschlinkert/bbb>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function (app, base, env, options) {
  app.task('default', function(cb) {
    console.log(app.alias, '> task >', this.name);
    cb();
  });
};
