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

  function disallowBareNamespaces(eventName) {
    if (isString(eventName) && eventName.indexOf('.') === 0) {
      throw 'eventName cannot be a bare namespace: prefix with an event name instead';
    }
  }

  function each(arr, callback) {
    for (var i = 0, n = arr.length; i < n; i++) {
      callback(arr[i]);
    }
  }

  function empty(arr) {
    arr.splice(0, Number.MAX_VALUE);
  }

  function isNullOrUndefined(x) {
    return isUndefined(x) || x === null;
  }

  function isObject(x) {
    return typeof x === 'object';
  }

  function isString(x) {
    return typeof x === 'string';
  }

  function isUndefined(x) {
    return typeof x === 'undefined';
  }

  function own(obj, callback) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        callback(prop, obj[prop]);
      }
    }
  }

  function require(value, message) {
    if (isNullOrUndefined(value)) {
      throw message;
    }
  }

  function setImmediate(fn) {
    setTimeout(fn, 0);
  }

  //---------------------------------------------------------
  // EventEmitter
  //---------------------------------------------------------

  /**
   * Iterate over each event in the dictionary and invoke the action with
   * (nameWithNs, listeners) for events that match the event name or namespace.
   *
   * @private
   * @param  {EventEmitter} scope
   * @param  {String} eventName
   * @param  {Function} action
   * @example
   *
   * var emitter = new EventEmitter();
   * emitter.on('foo', function onFoo() {});
   * emitter.on('foo.namespace', function onFooNs() {});
   * emitter.on('bar.namespace', function onBarNs() {});
   *
   * eachEventMatching(emitter, 'foo', console.log);
   * // -> 'foo' [onFoo]
   * // -> 'foo.namespace' [onFooNs]
   *
   * eachEventMatching(emitter, '.namespace', console.log);
   * // -> 'foo.namespace' [onFooNs]
   * // -> 'bar.namespace' [onBarNs]
   */
  function eachEventMatching(scope, eventName, action) {
    var indexOfNamespace = eventName.indexOf('.');
    if (indexOfNamespace === 0) {
      // Invoke action for everything in the namespace.
      var namespace = eventName.slice(indexOfNamespace);
      own(scope.listeners(), function(prop, value) {
        if (~prop.indexOf(namespace)) {
          action(prop, value);
        }
      });
    } else {
      if (~indexOfNamespace) {
        // Invoke action for the namespaced event.
        action(eventName, scope.listeners(eventName));
      } else {
        // Invoke action for the event and all child namespaces.
        own(scope.listeners(), function(prop, value) {
          if (prop === eventName || prop.indexOf(eventName + '.') === 0) {
            action(prop, value);
          }
        });
      }
    }
  }

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
    own(EventEmitter.prototype, function(prop, value) {
      obj[prop] = value;
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
   * emitter.on('bar', function onBar() {});
   *
   * // Return all the listeners for every event.
   * emitter.listeners();
   * // -> {
   * //  foo: [onFoo1, onFoo2],
   * //  bar: [onBar]
   * //}
   *
   * // Return the listeners added for an event.
   * emitter.listeners('foo');
   * // -> [onFoo1, onFoo2]
   */
  EventEmitter.prototype.listeners = function(eventName) {
    var dict = this.__listeners || (this.__listeners = {});
    if (eventName) {
      return dict[eventName] || (dict[eventName] = []);
    } else {
      return dict;
    }
  };

  /**
   * Add a listener for an event.
   *
   * If `options.once` is true, the listener will be removed after its first invocation.
   *
   * @param  {String} eventName
   * @param  {Function} listener
   * @param  {Object} [options] Optional options
   * @return {EventEmitter}
   * @example
   *
   * var emitter = new EventEmitter();
   * var listener = function() {};
   * emitter.on('event', listener);                 // Add listener for event.
   * emitter.on('event', listener, { once: true }); // Add one-time listener.
   * emitter.on('event.namespace', listener);       // Add listener for namespaced event.
   */
  EventEmitter.prototype.on = function(eventName, listener, options) {
    require(eventName, 'eventName is required');
    disallowBareNamespaces(eventName);
    require(listener, 'listener is required');
    options = options || {};
    var listeners = this.listeners(eventName);
    if (options.once) {
      var emitter = this;
      listeners.push(function invokeOnce() {
        listener.apply(null, Array.prototype.slice.call(arguments));
        emitter.off(eventName, invokeOnce);
      });
    } else {
      listeners.push(listener);
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
   * var listener = function() {};
   * // ...
   * emitter.off();                // Remove all listeners for all events.
   * emitter.off('foo');           // Remove all listeners for event 'foo'.
   * emitter.off('foo', listener); // Remove a specific listener for event 'foo'.
   * emitter.off('foo.namespace'); // Remove all listeners for namespaced event.
   * emitter.off('.namespace');    // Remove all event listeners with 'namespace'.
   */
  EventEmitter.prototype.off = function(eventName, listener) {
    if (isUndefined(eventName)) {
      // Remove all listeners for all events.
      own(this.listeners(), function(prop, value) {
        empty(value);
      });
    } else if (isUndefined(listener)) {
      // Remove listeners for events that match the event name.
      eachEventMatching(this, eventName, function(nameWithNs, listeners) {
        empty(listeners);
      });
    } else {
      // Remove the given listener for the event.
      var listeners = this.listeners(eventName);
      var indexOfListener = listeners.indexOf(listener);
      if (~indexOfListener) {
        listeners.splice(indexOfListener, 1);
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
   * emitter.emit('event');                        // Emit event with no args.
   * emitter.emit('event', args);                  // Emit event with args.
   * emitter.emit('event', args, { async: true }); // Emit event asynchronously.
   */
  EventEmitter.prototype.emit = function(eventName, args, options) {
    require(eventName, 'eventName is required');
    disallowBareNamespaces(eventName);
    options = options || {};
    var emitter = this;
    var invoker = function() {
      eachEventMatching(emitter, eventName, function(nameWithNs, listeners) {
        each(listeners.slice(), function(listener) {
          listener.call(null, emitter, args);
        });
      });
    };
    if (options.async) {
      setImmediate(invoker);
    } else {
      invoker();
    }
    return this;
  };

  return EventEmitter;
}));
