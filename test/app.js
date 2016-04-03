'use strict';

require('mocha');
var assert = require('assert');
var App = require('..');
var app;

describe('base-app', function() {
  describe('constructor events', function() {
    it('should emit `preInit`', function(cb) {
      App.once('preInit', function(app) {
        assert(app.isApp);
        cb();
      });

      app = new App();
      assert(app.isApp);
    });

    it('should emit `init`', function(cb) {
      App.once('init', function(app) {
        assert(app.isApp);
        cb();
      });

      app = new App();
      assert(app.isApp);
    });
  });
});
