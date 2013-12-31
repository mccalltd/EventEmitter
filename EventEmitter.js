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

  //---------------------------------------------------------
  // EventEmitter
  //---------------------------------------------------------

  function EventEmitter() {
    this._listeners = {};
  }

  EventEmitter.extend = function(Type) {
    Object.keys(EventEmitter.prototype).forEach(function(prop) {
      Type.prototype[prop] = EventEmitter.prototype[prop];
    });
  };

  EventEmitter.prototype.listeners = function(eventName) {
    var dict = this._listeners;
    return dict[eventName] || (dict[eventName] = []);
  };

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

  EventEmitter.prototype.once = function(eventName, listener) {
    var self = this;
    var invokeOnce = function invokeOnce(eventName, listener) {
      return function oneTimeInvoker() {
        listener.apply(null, Array.prototype.slice.call(arguments));
        self.off(eventName, oneTimeInvoker);
      };
    }
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

  EventEmitter.prototype.emit = function(eventName, options) {
    options = options || {};
    var args = Array.prototype.slice.call(arguments).slice(1);
    this.listeners(eventName).forEach(
      (options.async) ?
        function asyncInvoker(listener) {
          setTimeout(function() {
            listener.apply(null, args);
          }, 0);
        } :
        function syncInvoker(listener) {
          listener.apply(null, args);
        }
    );
    return this;
  };

  return EventEmitter;
}));
