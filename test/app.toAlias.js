'use strict';

require('mocha');
var assert = require('assert');
var Base = require('..');
var base;

describe('.toAlias', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should not create an alias when no prefix is given', function() {
    assert.equal(base.toAlias('foo-bar'), 'foo-bar');
  });

  it('should create an alias using the given alias function', function() {
    var alias = base.toAlias('one-two-three', {
      toAlias: function(name) {
        return name.slice(name.lastIndexOf('-') + 1);
      }
    });
    assert.equal(alias, 'three');
  });
});
