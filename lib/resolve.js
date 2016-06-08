'use strict';

var path = require('path');
var gm = require('global-modules');
var glob = require('matched');
var files;

module.exports = function(app, patterns) {
  files = files || glob.sync(patterns, {cwd: gm});
  var len = files.length;
  var idx = -1;

  while (++idx < len) {
    var file = files[idx];
    try {
      app.register(file, require(path.resolve(gm, file)));
    } catch (err) {}
  }
};
