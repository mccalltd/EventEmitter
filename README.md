[![Build Status](https://travis-ci.org/mccalltd/EventEmitter.png)](https://travis-ci.org/mccalltd/EventEmitter)

EventEmitter
============

> Simple Interface for Publishing JavaScript Events.


Features
--------

- Operates as a standalone object.
- Easy to extend your existing classes with its functionality.
- Available in all JavaScript runtime environements.
- AMD/CommonJS compatible.
- Small set of memorable methods: `on`, `off` and `emit`. That's it.
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
emitter.on('event', function listener() {}, { once: true });
emitter.on({
  foo: function() {},
  bar: function() {},
  baz: function() {}
}, { once: true });

// Fetch listeners:
emitter.listeners('foo');     // Return an array of listeners for event 'foo'.

// Remove listeners:
emitter.off();                // Remove all listeners for all events.
emitter.off('foo');           // Remove all listeners for event 'foo'.
emitter.off('foo', listener); // Remove a specific listener for event 'foo'.

// Emit events:
var args = { prop: 'value' };
emitter.emit('event');                        // Emit event with no args.
emitter.emit('event', args);                  // Emit event with args.
emitter.emit('event', args, { async: true }); // Emit event asynchronously.

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
function Thing() {}
EventEmitter.extend(Thing.prototype);

// Now 'Thing' acts as an EventEmitter:
Thing.prototype.setName = function(name) {
  this.name = name;
  this.emit('named', { name: name });
};

var thing = new Thing();
thing.on('named', function(sender, args) {
  console.log('The thing is called: ' + args.name);
});
thing.setName('banana');
// -> 'The thing is called: banana'
```
