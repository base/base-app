'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');
var unused = require('gulp-unused');

gulp.task('coverage', function() {
  return gulp.src(['index.js', 'utils.js', 'bin/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['coverage'], function() {
  return gulp.src('test/*.js')
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports());
});

gulp.task('lint', function() {
  return gulp.src(['*.js', 'test/*.js', 'bin/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('unused', function() {
  var keys = Object.keys(require('./utils.js'));
  return gulp.src(['*.js', 'bin/*.js'])
    .pipe(unused({keys: keys}));
});

gulp.task('default', ['test', 'lint']);
