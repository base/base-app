'use strict';

require('mocha');
var assert = require('assert');
var App = require('..');
var app;

describe('base-app', function() {
  describe('prototype methods', function() {
    beforeEach(function() {
      app = new App();
    });

    it('should expose `set`', function() {
      assert.equal(typeof app.set, 'function');
    });
    it('should expose `get`', function() {
      assert.equal(typeof app.get, 'function');
    });
    it('should expose `visit`', function() {
      assert.equal(typeof app.visit, 'function');
    });
    it('should expose `define`', function() {
      assert.equal(typeof app.define, 'function');
    });
  });

  describe('instance', function() {
    beforeEach(function() {
      app = new App();
    });

    it('should set a value on the instance:', function() {
      app.set('a', 'b');
      assert.equal(app.a, 'b');
    });

    it('should get a value from the instance:', function() {
      app.set('a', 'b');
      assert.equal(app.get('a'), 'b');
    });
  });

  describe('initialization', function() {
    it('should listen for errors:', function(cb) {
      app = new App();
      app.on('error', function(err) {
        assert.equal(err.message, 'foo');
        cb();
      });
      app.emit('error', new Error('foo'));
    });
  });
});
