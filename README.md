EventEmitter
============

> Client-Side JavaScript Events a la Node.js

[![Build Status](https://travis-ci.org/[mccalltd]/[EventEmitter].png)](https://travis-ci.org/[mccalltd]/[EventEmitter]) [Build History](https://travis-ci.org/mccalltd/EventEmitter/builds)

Usage
-----

### Basics

```javascript
// Standalone usage (not extending anything here):
var emitter = new EventEmitter();

// Add listeners for events (single and multiple):
emitter.on('event', function listener() {});
emitter.on({
  foo: function onOne() {},
  bar: function onOne() {},
  baz: function onOne() {}
});

// Add one-time listeners (single and multiple):
emitter.once('event', function listener() {});
emitter.once({
  foo: function() {},
  bar: function() {},
  baz: function() {}
});

// Fetch listeners:
emitter.listeners('foo');     // Return an array of listeners for event 'foo'.

// Remove listeners:
emitter.off();                // Remove all listeners for all events.
emitter.off('foo');           // Remove all listeners for event 'foo'.
emitter.off('foo', listener); // Remove a specific listener for event 'foo'.

// Emit events:
emitter.emit('event');                  // Emit event with no args.
emitter.emit('event', arg1, /* ... */); // Emit event with any number of args.

// Everything is chainable:
emitter
  .on('foo', function() { console.log('foo'); })
  .once('bar', function() { console.log('bar'); })
  .emit('foo') // -> 'foo'
  .emit('bar') // -> 'bar'
  .emit('bar') // ->
  .off('foo')
  .on('foo', function(who) { console.log('another foo for ' + who); })
  .emit('foo', 'you') // -> 'another foo for you'
  .off();
```

### Extending Classes With EventEmitter

```javascript
// Add EventEmitter behaviors to your classes:
function Thing() {
  EventEmitter.call(this);
}
EventEmitter.extend(Thing);
Thing.prototype.setName = function(name) {
  this.name = name;
  this.emit('named', name);
};

// Now 'Thing' acts as an EventEmitter:
var thing = new Thing();
thing.on('named', function(name) {
  console.log('The thing is called: ' + name);
});
thing.setName('banana');
// -> 'The thing is called: banana'
```


Development
------------

### Prerequisites

```bash
$ npm install -g grunt-cli
$ npm install
```

### Tasks

```bash
# lint and test:
$ grunt
# lint as you save
$ grunt watch:lint
# lint and test as you save files
$ grunt watch:dev
# setup karma hub and test as you save
$ grunt test
# generate code coverage
$ grunt cover
```
