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
   * EventEmitter provides a simple interface for publishing events to subscribers:
   *
   * - Operates as a standalone object.
   * - Easy to extend your existing classes with its functionality.
   * - Available in all JavaScript runtime environements.
   * - AMD/CommonJS compatible.
   * - Chainable API for easy and elegant use.
   *
   * Currently it is available for MODERN BROWSERS ONLY.
   *
   * @constructor
   */
  function EventEmitter() {
    this._listeners = {};
  }

  /**
   * Extend the given Type's prototype with methods from EventEmitter.prototype.
   * Combined with constrcutor borrowing, this provides for easy inheritance.
   *
   * @param  {Type} Type The type to extend
   * @example
   *
   * // Add EventEmitter behaviors to your classes:
   * function Thing() {
   *   EventEmitter.call(this);
   * }
   * EventEmitter.extend(Thing);
   *
   * // Now 'Thing' acts as an EventEmitter:
   * Thing.prototype.setName = function(name) {
   *   this.name = name;
   *   this.emit('named', name);
   * };
   *
   * var thing = new Thing();
   * thing.on('named', function(name) {
   *   console.log('The thing is called: ' + name);
   * });
   *
   * thing.setName('banana');
   * // -> 'The thing is called: banana'
   */
  EventEmitter.extend = function(Type) {
    Object.keys(EventEmitter.prototype).forEach(function(prop) {
      Type.prototype[prop] = EventEmitter.prototype[prop];
    });
  };

  /**
   * Get the listeners registered for an event.
   *
   * @param  {String} eventName
   * @return {Function[]} Registered listeners
   * @example
   *
   * var emitter = new EventEmitter();
   * emitter.on('foo', function onFoo1() {});
   * emitter.on('foo', function onFoo2() {});
   * emitter.listeners('foo');
   * // -> [onFoo1, onFoo2]
   */
  EventEmitter.prototype.listeners = function(eventName) {
    var dict = this._listeners;
    return dict[eventName] || (dict[eventName] = []);
  };

  /**
   * Add a listener for an event. There are two ways to call this method:
   * either add a single listener by passing the event name and listener;
   * or add multiple listeners at once by passing a hash of names and listeners.
   *
   * @param  {String|Object} eventName The event name or a hash of names and listeners
   * @param  {Function} [listener] The listener, required when passing event name
   * @return {EventEmitter}
   * @example
   *
   * var emitter = new EventEmitter();
   * emitter.on('event', function listener() {});
   * emitter.on({
   *   foo: function() {},
   *   bar: function() {},
   *   baz: function() {}
   * });
   */
  EventEmitter.prototype.on = function(eventName, listener) {
    var self = this;
    if (isObject(eventName)) {
      // Add multiple listeners.
      var hash = eventName;
      Object.keys(hash).forEach(function(eventName) {
        self.listeners(eventName).push(hash[eventName]);
      });
    } else {
      // Add a single listener.
      this.listeners(eventName).push(listener);
    }
    return this;
  };

  /**
   * Add a one-time listener for an event. The listener will be removed after
   * its first invocation. There are two ways to call this method:
   * either add a single listener by passing the event name and listener;
   * or add multiple listeners at once by passing a hash of names and listeners.
   *
   * @param  {String|Object} eventName The event name or a hash of names and listeners
   * @param  {Function} [listener] The listener, required when passing event name
   * @return {EventEmitter}
   * @example
   *
   * var emitter = new EventEmitter();
   * emitter.once('event', function listener() {});
   * emitter.once({
   *   foo: function() {},
   *   bar: function() {},
   *   baz: function() {}
   * });
   */
  EventEmitter.prototype.once = function(eventName, listener) {
    var self = this;
    var invokeOnce = function(eventName, listener) {
      return function oneTimeInvoker() {
        listener.apply(null, Array.prototype.slice.call(arguments));
        self.off(eventName, oneTimeInvoker);
      };
    };
    if (isObject(eventName)) {
      // Add multiple listeners.
      var hash = eventName;
      Object.keys(hash).forEach(function(prop) {
        self.on(prop, invokeOnce(prop, hash[prop]));
      });
    } else {
      // Add a single listener.
      this.on(eventName, invokeOnce(eventName, listener));
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
    if (isUndefined(eventName)) {
      // Remove all listeners for all events.
      this._listeners = {};
    } else if (isUndefined(listener)) {
      // Remove all listeners for the event.
      this.listeners(eventName).splice(0, Number.MAX_VALUE);
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
   *
   * @param  {String} eventName
   * @param  {...*} [listenerArgs]
   * @return {EventEmitter}
   * @example
   *
   * emitter.emit('event');
   * emitter.emit('event', arg1, arg2);
   */
  EventEmitter.prototype.emit = function(eventName) {
    var args = Array.prototype.slice.call(arguments).slice(1);
    this.listeners(eventName).forEach(function(listener) {
      listener.apply(null, args);
    });
    return this;
  };

  /**
   * Emit an event, triggering the asynchronous invocation of all listeners.
   *
   * @param  {String} eventName
   * @param  {...*} [listenerArgs]
   * @return {EventEmitter}
   * @example
   *
   * emitter.emitAsync('event');
   * emitter.emitAsync('event', arg1, arg2);
   */
  EventEmitter.prototype.emitAsync = function(eventName) {
    var args = Array.prototype.slice.call(arguments).slice(1);
    this.listeners(eventName).forEach(function(listener) {
      setImmediate(function() { listener.apply(null, args); });
    });
    return this;
  };

  return EventEmitter;
}));
