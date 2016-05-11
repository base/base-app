'use strict';

require('mocha');
var assert = require('assert');
var App = require('..');
var app;

describe('base-app', function() {

  describe('constructor', function() {
    it('should create an instance of App:', function() {
      app = new App();
      assert(app instanceof App);
    });
  });

  describe('static methods', function() {
    it('should expose `extend`:', function() {
      assert(typeof App.extend === 'function');
    });
  });

  describe('prototype methods', function() {
    beforeEach(function() {
      app = new App();
    });

    it('should expose `set`', function() {
      assert(typeof app.set === 'function');
    });
    it('should expose `get`', function() {
      assert(typeof app.get === 'function');
    });
    it('should expose `visit`', function() {
      assert(typeof app.visit === 'function');
    });
    it('should expose `define`', function() {
      assert(typeof app.define === 'function');
    });
  });

  describe('instance', function() {
    beforeEach(function() {
      app = new App();
    });

    it('should set a value on the instance:', function() {
      app.set('a', 'b');
      assert(app.a === 'b');
    });

    it('should get a value from the instance:', function() {
      app.set('a', 'b');
      assert(app.get('a') === 'b');
    });
  });

  describe('initialization', function() {
    it('should listen for errors:', function(cb) {
      app = new App();
      app.on('error', function(err) {
        assert(err.message === 'foo');
        cb();
      });
      app.emit('error', new Error('foo'));
    });
  });

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
