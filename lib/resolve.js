'use strict';

const path = require('path');
const gm = require('global-modules');
const glob = require('matched');

module.exports = function(app, patterns) {
  const files = glob.sync(patterns, { cwd: gm });
  let plugin;
  for (const file of files) {
    try {
      plugin = require(path.resolve(gm, file));
    } catch (err) {
      console.error(`cannot require: ${file}`);
      continue;
    }

    try {
      app.register(file, plugin);
    } catch (err) {
      console.error(`cannot register: ${file}`);
    }
  }
};
