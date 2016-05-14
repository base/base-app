# base-app [![NPM version](https://img.shields.io/npm/v/base-app.svg?style=flat)](https://www.npmjs.com/package/base-app) [![NPM downloads](https://img.shields.io/npm/dm/base-app.svg?style=flat)](https://npmjs.org/package/base-app) [![Build Status](https://img.shields.io/travis/node-base/base-app.svg?style=flat)](https://travis-ci.org/node-base/base-app)

Starting point for creating a base application, with a few light plugins for running tasks and writing to the file system, and a functional CLI.

## TOC

- [Install](#install)
- [Quickstart](#quickstart)
- [CLI](#cli)
- [API Documentation](#api-documentation)
- [.cwd](#cwd)
- [File System API](#file-system-api)
  * [.src](#src)
  * [.symlink](#symlink)
  * [.dest](#dest)
  * [.copy](#copy)
- [Task API](#task-api)
  * [.task](#task)
  * [.build](#build)
  * [.series](#series)
  * [.parallel](#parallel)
- [Events](#events)
  * [starting](#starting)
  * [finished](#finished)
  * [error](#error)
  * [task:starting](#taskstarting)
  * [task:finished](#taskfinished)
  * [task:error](#taskerror)
  * [.dataLoader](#dataloader)
- [Plugin API](#plugin-api)
  * [.use](#use)
  * [.run](#run)
- [Options API](#options-api)
  * [.option](#option)
  * [.hasOption](#hasoption)
  * [.enable](#enable)
  * [.disable](#disable)
  * [.enabled](#enabled)
  * [.disabled](#disabled)
  * [.isTrue](#istrue)
  * [.isFalse](#isfalse)
  * [.isBoolean](#isboolean)
  * [.option.set](#optionset)
  * [.option.get](#optionget)
  * [.option.create](#optioncreate)
- [Data API](#data-api)
  * [.data](#data)
  * [.data.extend](#dataextend)
  * [.data.merge](#datamerge)
  * [.data.union](#dataunion)
  * [.data.set](#dataset)
  * [.data.get](#dataget)
  * [Glob patterns](#glob-patterns)
  * [Namespacing](#namespacing)
- [Related projects](#related-projects)
- [Contributing](#contributing)
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [License](#license)

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install base-app --save
```

## Quickstart

Below we provide a more detailed explanation of how to get started. But if you're familiar with node.js and prefer a fast-track:

**Install**

```sh
$ npm i -g base-app
```

**Create an "app"**

Then create a `basefile.js` with the following code:

```js
module.exports = function(app, base) {
  app.task('default', function(cb) {
    console.log('task >', this.name);
    cb();
  });
};
```

**Run base**

In the command line, run:

```sh
$ base
```

If everthing installed correctly, you should see `task > default` in the command line.

## CLI

**Installing the CLI**

To run base from the command line, you'll need to install `base-app` globally first. You can that now with the following command:

```sh
$ npm i -g base-app
```

This adds the `base` command to your system path, allowing it to be run from any directory or sub-directory in a project.

**How the CLI works**

When the `base` command is run, the globally installed `base-app` looks for a locally installed [base](https://github.com/node-base/base) module using node's `require()` system.

If a locally installed [base](https://github.com/node-base/base) is found, the CLI loads the local installation of the [base](https://github.com/node-base/base) library. If a local [base](https://github.com/node-base/base) module is not found, the globally installed `base-app` will be used.

Once the module is resolved, base applies the configuration from your `basefile.js` then executes any [generators](https://github.com/node-base/base-generators) or tasks you've specified for base to run.

## .cwd

Getter/setter that ensures the current working directory is always a fully resolved absolute filepath.

```js
app.cwd = 'foo';
console.log(app.cwd);
//=> /User/dev/base-app/foo
```

## File System API

### .src

Glob patterns or filepaths to source files.

**Params**

* `glob` **{String|Array}**: Glob patterns or file paths to source files.
* `options` **{Object}**: Options or locals to merge into the context and/or pass to `src` plugins

**Example**

```js
app.src('src/*.hbs', {layout: 'default'});
```

### .symlink

Glob patterns or paths for symlinks.

**Params**

* `glob` **{String|Array}**

**Example**

```js
app.symlink('src/**');
```

### .dest

Specify a destination for processed files.

**Params**

* `dest` **{String|Function}**: File path or rename function.
* `options` **{Object}**: Options and locals to pass to `dest` plugins

**Example**

```js
app.dest('dist/');
```

### .copy

Copy files with the given glob `patterns` to the specified `dest`.

**Params**

* `patterns` **{String|Array}**: Glob patterns of files to copy.
* `dest` **{String|Function}**: Desination directory.
* `returns` **{Stream}**: Stream, to continue processing if necessary.

**Example**

```js
app.task('assets', function(cb) {
  app.copy('assets/**', 'dist/')
    .on('error', cb)
    .on('finish', cb)
});
```

## Task API

Methods for running tasks are from the [base-task](https://github.com/node-base/base-task) plugin, which uses [composer](https://github.com/doowb/composer). Additional documentation can be found on those libaries.

### .task

Register a task

**Params**

* `name` **{String}**: Task name to register (tasks are cached on `app.tasks`)
* `dependencies` **{String|Array|Function}**: String, list or array of tasks.
* `callback` **{Function}**: Function to be called when the task is executed. Task functions should either return a stream or call the callback to let [composer](https://github.com/doowb/composer) know when the task is finished.

**Examples**

Register a task.

```js
app.task('default', function() {
  // return the stream to signal "done"
  return app.src('pages/*.hbs')
    .pipe(app.dest('dist'));
});
```

Register a task with dependencies (other tasks to run before executing the task):

```js
app.task('site', ['styles'], function() {
  return app.src('pages/*.hbs')
    .pipe(app.dest('dist'));
});

app.task('default', ['site']);
```

**Get a task**

```js
var task = app.task('site');
```

### .build

Run a task or array of tasks.

**Example**

```js
app.build('default', function(err, results) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(results);
});
```

### .series

Compose task or list of tasks into a single function that runs the tasks in series.

**Params**

* `tasks` **{String|Array|Function}**: List of tasks by name, function, or array of names/functions.
* `returns` **{Function}**: Composed function that may take a callback function.

**Example**

```js
app.task('foo', function(cb) {
  console.log('this is foo');
  cb();
});

var fn = app.series('foo', function(cb) {
  console.log('this is bar');
  cb();
});

fn(function(err) {
  if (err) return console.error(err);
  console.log('finished');
});
//=> this is foo
//=> this is bar
//=> finished
```

### .parallel

Compose task or list of tasks into a single function that runs the tasks in parallel.

**Params**

* `tasks` **{String|Array|Function}**: List of tasks by name, function, or array of names/functions.
* `returns` **{Function}**: Composed function that may take a callback function.

**Example**

```js
app.task('foo', function(cb) {
  setTimeout(function() {
    console.log('this is foo');
    cb();
  }, 500);
});

var fn = app.parallel('foo', function(cb) {
  console.log('this is bar');
  cb();
});

fn(function(err) {
  if (err) return console.error(err);
  console.log('finished');
});
//=> this is bar
//=> this is foo
//=> finished
```

## Events

The following events are emitted by [composer](https://github.com/doowb/composer). See the composer docs for more details

### starting

Emitted when a `build` is starting.

```js
app.on('starting', function(app, build) {});
```

The event emits 2 arguments:

1. the current instance of [composer](https://github.com/doowb/composer) as the `app` and
2. An object with `build` runtime information:

* `.date`: an object with the `.start` time as a `Date` object.
* `.hr`: an object with the `.start` time as an `hrtime` array.

### finished

Emitted when a `build` is finished.

```js
app.on('finished', function(app, build) {});
```

The event emits 2 arguments:

1. `app`: instance of [composer](https://github.com/doowb/composer)
2. `build`: an object with build runtime information:

* `.date`: object with `.start` and `.end` properties, with staring and ending times of the build as `Date` objects.
* `.hr`: object with `.start`, `.end`, `.duration`, and `.diff` properties with timing information calculated using `process.hrtime`

### error

Emitted when an error occurrs during a `build`.

```js
app.on('error', function(err) {});
```

### task:starting

Emitted when a task is starting.

```js
app.on('task:starting', function(task, run) {});
```

### task:finished

Emitted when a task has finished.

```js
app.on('task:finished', function(task, run) {});
```

### task:error

Emitted when an error occurrs while running a task.

```js
app.on('task:error', function(err) {});
```

### .dataLoader

Register a data loader for loading data onto `app.cache.data`.

**Params**

* `ext` **{String}**: The file extension for to match to the loader
* `fn` **{Function}**: The loader function.

**Example**

```js
var yaml = require('js-yaml');

app.dataLoader('yml', function(str, fp) {
  return yaml.safeLoad(str);
});

app.data('foo.yml');
//=> loads and parses `foo.yml` as yaml
```

## Plugin API

### .use

Define a plugin function to be called immediately upon init. The only parameter exposed to the plugin is the application instance.

Also, if a plugin returns a function, the function will be pushed
onto the `fns` array, allowing the plugin to be called at a
later point, elsewhere in the application.

**Params**

* `fn` **{Function}**: plugin function to call
* `returns` **{Object}**: Returns the item instance for chaining.

**Example**

```js
// define a plugin
function foo(app) {
  // do stuff
}

// register plugins
var app = new Base()
  .use(foo)
  .use(bar)
  .use(baz)
```

### .run

Run all plugins

**Params**

* `value` **{Object}**: Object to be modified by plugins.
* `returns` **{Object}**: Returns the item instance for chaining.

**Example**

```js
var config = {};
app.run(config);
```

## Options API

### .option

Set or get an option.

**Params**

* `key` **{String}**: The option name.
* `value` **{any}**: The value to set.
* `returns` **{any}**: Returns a `value` when only `key` is defined.

**Example**

```js
app.option('a', true);
app.option('a');
//=> true
```

### .hasOption

Return true if `options.hasOwnProperty(key)`

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**: True if `prop` exists.

**Example**

```js
app.hasOption('a');
//=> false
app.option('a', 'b');
app.hasOption('a');
//=> true
```

### .enable

Enable `key`.

**Params**

* `key` **{String}**
* `returns` **{Object}** `Options`: to enable chaining

**Example**

```js
app.enable('a');
```

### .disable

Disable `key`.

**Params**

* `key` **{String}**: The option to disable.
* `returns` **{Object}** `Options`: to enable chaining

**Example**

```js
app.disable('a');
```

### .enabled

Check if `prop` is enabled (truthy).

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**

**Example**

```js
app.enabled('a');
//=> false

app.enable('a');
app.enabled('a');
//=> true
```

### .disabled

Check if `prop` is disabled (falsey).

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**: Returns true if `prop` is disabled.

**Example**

```js
app.disabled('a');
//=> true

app.enable('a');
app.disabled('a');
//=> false
```

### .isTrue

Returns true if the value of `prop` is strictly `true`.

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**: Uses strict equality for comparison.

**Example**

```js
app.option('a', 'b');
app.isTrue('a');
//=> false

app.option('c', true);
app.isTrue('c');
//=> true

app.option({a: {b: {c: true}}});
app.isTrue('a.b.c');
//=> true
```

### .isFalse

Returns true if the value of `key` is strictly `false`.

**Params**

* `prop` **{String}**
* `returns` **{Boolean}**: Uses strict equality for comparison.

**Example**

```js
app.option('a', null);
app.isFalse('a');
//=> false

app.option('c', false);
app.isFalse('c');
//=> true

app.option({a: {b: {c: false}}});
app.isFalse('a.b.c');
//=> true
```

### .isBoolean

Return true if the value of key is either `true` or `false`.

**Params**

* `key` **{String}**
* `returns` **{Boolean}**: True if `true` or `false`.

**Example**

```js
app.option('a', 'b');
app.isBoolean('a');
//=> false

app.option('c', true);
app.isBoolean('c');
//=> true
```

### .option.set

Set option `key` on `app.options` with the given `value`

**Params**

* `key` **{String}**: Option key, dot-notation may be used.
* `value` **{any}**

**Example**

```js
app.option.set('a', 'b');
console.log(app.option.get('a'));
//=> 'b'
```

### .option.get

Get option `key` from `app.options`

**Params**

* `key` **{String}**: Option key, dot-notation may be used.
* `returns` **{any}**

**Example**

```js
app.option({a: 'b'});
console.log(app.option.get('a'));
//=> 'b'
```

### .option.create

Returns a shallow clone of `app.options` with all of the options methods, as well as a `.merge` method for merging options onto the cloned object.

**Params**

* `options` **{Options}**: Object to merge onto the returned options object.
* `returns` **{Object}**

**Example**

```js
var opts = app.option.create();
opts.merge({foo: 'bar'});
```

## Data API

### .data

Load data onto `app.cache.data`

**Params**

* `key` **{String|Object}**: Key of the value to set, or object to extend.
* `val` **{any}**
* `returns` **{Object}**: Returns the instance of `Template` for chaining

**Example**

```js
console.log(app.cache.data);
//=> {};

app.data('a', 'b');
app.data({c: 'd'});
console.log(app.cache.data);
//=> {a: 'b', c: 'd'}

// set an array
app.data('e', ['f']);

// overwrite the array
app.data('e', ['g']);

// update the array
app.data('e', ['h'], true);
console.log(app.cache.data.e);
//=> ['g', 'h']
```

### .data.extend

Shallow extend an object onto `app.cache.data`.

**Params**

* `key` **{String|Object}**: Property name or object to extend onto `app.cache.data`. Dot-notation may be used for extending nested properties.
* `value` **{Object}**: The object to extend onto `app.cache.data`
* `returns` **{Object}**: returns the instance for chaining

**Example**

```js
app.data({a: {b: {c: 'd'}}});
app.data.extend('a.b', {x: 'y'});
console.log(app.get('a.b'));
//=> {c: 'd', x: 'y'}
```

### .data.merge

Deeply merge an object onto `app.cache.data`.

**Params**

* `key` **{String|Object}**: Property name or object to merge onto `app.cache.data`. Dot-notation may be used for merging nested properties.
* `value` **{Object}**: The object to merge onto `app.cache.data`
* `returns` **{Object}**: returns the instance for chaining

**Example**

```js
app.data({a: {b: {c: {d: {e: 'f'}}}}});
app.data.merge('a.b', {c: {d: {g: 'h'}}});
console.log(app.get('a.b'));
//=> {c: {d: {e: 'f', g: 'h'}}}
```

### .data.union

Union the given value onto a new or existing array value on `app.cache.data`.

**Params**

* `key` **{String}**: Property name. Dot-notation may be used for nested properties.
* `array` **{Object}**: The array to add or union on `app.cache.data`
* `returns` **{Object}**: returns the instance for chaining

**Example**

```js
app.data({a: {b: ['c', 'd']}});
app.data.union('a.b', ['e', 'f']}});
console.log(app.get('a.b'));
//=> ['c', 'd', 'e', 'f']
```

### .data.set

Set the given value onto `app.cache.data`.

**Params**

* `key` **{String|Object}**: Property name or object to merge onto `app.cache.data`. Dot-notation may be used for nested properties.
* `val` **{any}**: The value to set on `app.cache.data`
* `returns` **{Object}**: returns the instance for chaining

**Example**

```js
app.data.set('a.b', ['c', 'd']}});
console.log(app.get('a'));
//=> {b: ['c', 'd']}
```

### .data.get

Get the value of `key` from `app.cache.data`. Dot-notation may be used for getting nested properties.

**Params**

* `key` **{String}**: The name of the property to get.
* `returns` **{any}**: Returns the value of `key`

**Example**

```js
app.data({a: {b: {c: 'd'}}});
console.log(app.get('a.b'));
//=> {c: 'd'}
```

### Glob patterns

Glob patterns may be passed as a string or array. All of these work:

```js
app.data('foo.json');
app.data('*.json');
app.data(['*.json']);
// pass options to node-glob
app.data(['*.json'], {dot: true});
```

### Namespacing

Namespacing allows you to load data onto a specific key, optionally using part of the file path as the key.

**Example**

Given that `foo.json` contains `{a: 'b'}`:

```js
app.data('foo.json');
console.log(app.cache.data);
//=> {a: 'b'}

app.data('foo.json', {namespace: true});
console.log(app.cache.data);
//=> {foo: {a: 'b'}}

app.data('foo.json', {
  namespace: function(fp) {
    return path.basename(fp);
  }
});
console.log(app.cache.data);
//=> {'foo.json': {a: 'b'}}
```

## Related projects

You might also be interested in these projects:

* [base-config](https://www.npmjs.com/package/base-config): base-methods plugin that adds a `config` method for mapping declarative configuration values to other 'base'… [more](https://www.npmjs.com/package/base-config) | [homepage](https://github.com/node-base/base-config)
* [base-pipeline](https://www.npmjs.com/package/base-pipeline): base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines. | [homepage](https://github.com/node-base/base-pipeline)
* [base](https://www.npmjs.com/package/base): base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting… [more](https://www.npmjs.com/package/base) | [homepage](https://github.com/node-base/base)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/node-base/base-app/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/node-base/base-app/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on May 14, 2016._