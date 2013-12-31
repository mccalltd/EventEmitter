;(function(root, factory) {
  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.EventEmitter = factory();
  }
}(this, function() {
  'use strict';

  //---------------------------------------------------------
  // Utilities
  //---------------------------------------------------------

  function isObject(x) {
    return typeof x === 'object';
  }
  function isUndefined(x) {
    return typeof x === 'undefined';
  }
  function setImmediate(fn) {
    setTimeout(fn, 0);
  }

  //---------------------------------------------------------
  // EventEmitter
  //---------------------------------------------------------

  /**
   * EventEmitter provides a simple interface for publishing events.
   *
   * @constructor
   */
  function EventEmitter() {}

  /**
   * Extend the given object with methods from EventEmitter.prototype,
   * thereby making the object an EventEmitter.
   *
   * @param  {Type} Type The type to extend
   * @example
   *
   * // Add EventEmitter behaviors to your classes:
   * function Thing() {}
   * EventEmitter.extend(Thing.prototype);
   *
   * // Now 'Thing' acts as an EventEmitter:
   * Thing.prototype.setName = function(name) {
   *   this.name = name;
   *   this.emit('named', name);
   * };
   *
   * var thing = new Thing();
   * thing.on('named', function(sender, args) {
   *   console.log('The thing is called: ' + args.name);
   * });
   *
   * thing.setName('banana');
   * // -> 'The thing is called: banana'
   */
  EventEmitter.extend = function(obj) {
    Object.keys(EventEmitter.prototype).forEach(function(prop) {
      obj[prop] = EventEmitter.prototype[prop];
    });
  };

  /**
   * Get the listeners added for an event. If called with no argument,
   * the entire listeners dictionary will be returned.
   *
   * @param  {String} [eventName] Optional event name
   * @return {Function[]} Registered listeners
   * @example
   *
   * var emitter = new EventEmitter();
   * emitter.on('foo', function onFoo1() {});
   * emitter.on('foo', function onFoo2() {});
   *
   * // Return all the listeners for every event.
   * emitter.listeners();
   * // -> { foo: [onFoo1, onFoo2] }
   *
   * // Return the listeners added for an event.
   * emitter.listeners('foo');
   * // -> [onFoo1, onFoo2]
   */
  EventEmitter.prototype.listeners = function(eventName) {
    // Use super-private naming to help prevent collisions when inherited.
    var dict = this.__listeners || (this.__listeners = {});
    if (eventName) {
      return dict[eventName] || (dict[eventName] = []);
    } else {
      return dict;
    }
  };

  /**
   * Add a listener for an event. There are two ways to call this method:
   * either add a single listener by passing the event name and listener;
   * or add multiple listeners at once by passing a hash of names and listeners.
   *
   * If `options.once` is true, the listener will be removed after its first invocation.
   *
   * @param  {String|Object} eventName The event name or a hash of names and listeners
   * @param  {Function|Object} [listener] Optional listener or options
   * @param  {Object} [options] Optional options
   * @return {EventEmitter}
   * @example
   *
   * var emitter = new EventEmitter();
   *
   * // Add persistent listeners
   * emitter.on('event', function listener() {});
   * emitter.on({
   *   foo: function() {},
   *   bar: function() {},
   *   baz: function() {}
   * });
   *
   * // Add one-time listeners
   * emitter.on('event', function listener() {}, { once: true });
   * emitter.on({
   *   foo: function() {},
   *   bar: function() {},
   *   baz: function() {}
   * }, { once: true });
   */
  EventEmitter.prototype.on = function(eventName, listener, options) {
    var self = this;
    var addListener = function(eventName, listener) {
      var listeners = self.listeners(eventName);
      if (options.once) {
        listeners.push(function invokeOnce() {
          listener.apply(null, Array.prototype.slice.call(arguments));
          self.off(eventName, invokeOnce);
        });
      } else {
        listeners.push(listener);
      }
    };
    if (isObject(eventName)) {
      // Add multiple listeners.
      var hash = eventName;
      options = listener || {};
      Object.keys(hash).forEach(function(eventName) {
        addListener(eventName, hash[eventName]);
      });
    } else {
      // Add a single listener.
      options = options || {};
      addListener(eventName, listener);
    }
    return this;
  };

  /**
   * Remove listeners for events. There are three ways to call this method:
   * remove all listeners for all events by passing no arguments;
   * remove all listeners for a single event by passing an event name;
   * or remove a single listener by passing an event name and listener.
   *
   * @param  {String} [eventName]
   * @param  {Function} [listener]
   * @return {EventEmitter}
   * @example
   *
   * var emitter = new EventEmitter();
   * // ...
   * emitter.off();                // Remove all listeners for all events.
   * emitter.off('foo');           // Remove all listeners for event 'foo'.
   * emitter.off('foo', listener); // Remove a specific listener for event 'foo'.
   */
  EventEmitter.prototype.off = function(eventName, listener) {
    var self = this;
    var removeListeners = function(eventName) {
      self.listeners(eventName).splice(0, Number.MAX_VALUE);
    };
    if (isUndefined(eventName)) {
      // Remove all listeners for all events.
      Object.keys(this.listeners()).forEach(function(eventName) {
        removeListeners(eventName);
      });
    } else if (isUndefined(listener)) {
      // Remove all listeners for the event.
      removeListeners(eventName);
    } else {
      // Remove the given listener for the event.
      var listeners = this.listeners(eventName);
      var index = listeners.indexOf(listener);
      if (~index) {
        listeners.splice(index, 1);
      }
    }
    return this;
  };

  /**
   * Emit an event, triggering the synchronous invocation of all listeners.
   * Listeners are invoked with (sender, args), where sender is the EventEmitter
   * or the class that inherits EventEmitter.
   *
   * If `options.async` is true, the listeners will be invoked asynchronously.
   *
   * @param  {String} eventName
   * @param  {Object} [args] Optional object passed to listeners via args argument
   * @param  {Object} [options] Optional options
   * @return {EventEmitter}
   * @example
   *
   * var emitter = new EventEmitter();
   * emitter.on('event', function(sender, args) {
   *   console.log(sender.constructor.name, args && args.prop);
   * });
   *
   * var args = { prop: 'value' };
   *
   * // Emit event with no args.
   * emitter.emit('event');
   * // -> 'EventEmitter undefined'
   *
   * // Emit event with args.
   * emitter.emit('event', args);
   * // -> 'EventEmitter value'
   *
   * // Emit event asynchronously.
   * emitter.emit('event', args, { async: true });
   * // -> 'EventEmitter value'
   */
  EventEmitter.prototype.emit = function(eventName, args, options) {
    var self = this;
    options = options || {};
    var invoke = (options.async) ?
      function(listener) {
        setImmediate(function() { listener.call(null, self, args); });
      } :
      function(listener) {
        listener.call(null, self, args);
      };
    this.listeners(eventName).forEach(invoke);
    return this;
  };

  return EventEmitter;
}));
