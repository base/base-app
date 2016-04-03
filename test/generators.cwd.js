'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var Base = require('..');
var base;

describe('generators.cwd', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should get the current working directory', function() {
    assert.equal(base.cwd, process.cwd());
  });

  it('should set the current working directory', function() {
    base.cwd = 'test/fixtures';
    assert.equal(base.cwd, path.join(process.cwd(), 'test/fixtures'));
  });
});
