[![Build Status](https://travis-ci.org/mccalltd/EventEmitter.png)](https://travis-ci.org/mccalltd/EventEmitter)

EventEmitter
============

> Simple JavaScript Event Framework


Features
--------

- Operates as a standalone object.
- Easy to extend your existing classes with its functionality.
- Available in all JavaScript runtime environements.
- AMD/CommonJS compatible.
- Small set of memorable methods: `on`, `once`, `off`, and `emit`. That's it.
- Standardized signature for event listeners: `function(sender, args)`.
- Chainable API for easy and elegant use.

Currently it is available for MODERN BROWSERS ONLY (IE 9+ et al).


Usage
-----

### Basics

```javascript
// Standalone usage (not extending anything here):
var emitter = new EventEmitter();

// Add listeners for events (single and multiple):
emitter.on('event', function listener() {});
emitter.on({
  foo: function onFoo() {},
  bar: function onBar() {},
  baz: function onBaz() {}
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

// Emit events (both synchronously and asynchronously):
emitter.emit('event');                      // Emit event with no args.
emitter.emit('event', /* ...args */);       // Emit event with any number of args.
emitter.emitAsync('event');
emitter.emitAsync('event', /* ...args */);

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
