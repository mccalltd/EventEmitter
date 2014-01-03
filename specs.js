describe('EventEmitter', function() {
  'use strict';

  var emitter;
  var onFoo = function() {};
  var onBar = function() {};
  var onFooNs = function() {};
  var onBarNs = function() {};
  var increment = function() { invocations++; };
  var invocations;

  beforeEach(function() {
    invocations = 0;
    emitter = new EventEmitter();
  });

  it('should exist globally', function() {
    expect(EventEmitter).toBeDefined();
  });

  describe('inheritence via extend', function() {
    it('should extend an object with its own prototype methods', function() {
      function Thing() {}
      EventEmitter.extend(Thing.prototype);
      Object.keys(EventEmitter.prototype).forEach(function(prop) {
        expect(Thing.prototype[prop]).toBeDefined();
      });
    });
  });

  describe('listeners', function() {
    beforeEach(function() {
      emitter.__listeners = {
        'foo': [onFoo],
        'bar': [onBar],
        'foo.namespace': [onFooNs],
        'bar.namespace': [onBarNs]
      };
    });
    it('should return a dictionary of events and listeners', function() {
      var listeners = emitter.listeners();
      expect(listeners.foo).toEqual([onFoo]);
      expect(listeners['foo.namespace']).toEqual([onFooNs]);
      expect(listeners.bar).toEqual([onBar]);
      expect(listeners['bar.namespace']).toEqual([onBarNs]);
    });
    it('should return all listeners for an event', function() {
      expect(emitter.listeners('foo')).toEqual([onFoo]);
    });
    it('should initialize and return an empty listeners array if the event is undefined', function() {
      var listeners = emitter.listeners('unknown');
      expect(listeners).toEqual([]);
      var listener = function() {};
      listeners.push(listener);
      expect(emitter.listeners('unknown')).toEqual([listener]);
    });
  });

  describe('on', function() {
    it('should throw if event name is null or undefined', function() {
      expect(function() { emitter.on(); }).toThrow('eventName is required');
      expect(function() { emitter.on(null); }).toThrow('eventName is required');
    });
    it('should throw if listener is null or undefined', function() {
      expect(function() { emitter.on('event'); }).toThrow('listener is required');
      expect(function() { emitter.on('event', null); }).toThrow('listener is required');
    });
    it('should throw if the eventName is a bare namespace', function() {
      expect(function() { emitter.on('.namespace'); })
        .toThrow('eventName cannot be a bare namespace: prefix with an event name instead');
    });
    it('should add a listener for an event', function() {
      emitter.on('foo', onFoo);
      expect(emitter.listeners('foo')).toEqual([onFoo]);
    });
    it('should remove the listener after first invocation if options.once is true', function() {
      emitter.on('foo', increment, { once: true });
      emitter.emit('foo');
      expect(invocations).toBe(1);
      expect(emitter.listeners('foo').length).toBe(0);
    });
    it('should be chainable', function() {
      emitter
        .on('foo', onFoo)
        .on('foo', onFoo);
      expect(emitter.listeners('foo').length).toBe(2);
    });
  });

  describe('off', function() {
    it('should remove all listeners for all events', function() {
      emitter.on('foo', onFoo);
      emitter.on('bar', onBar);
      emitter.off();
      expect(emitter.listeners('foo').length).toBe(0);
      expect(emitter.listeners('bar').length).toBe(0);
    });
    it('should remove all listeners for an event', function() {
      emitter.on('foo', onFoo);
      emitter.on('bar', onBar);
      emitter.off('foo');
      expect(emitter.listeners('foo').length).toBe(0);
      expect(emitter.listeners('bar').length).toBe(1);
    });
    it('should remove a single listener for an event', function() {
      var onFoo2 = function() {};
      emitter.on('foo', onFoo);
      emitter.on('foo', onFoo2);
      emitter.off('foo', onFoo);
      expect(emitter.listeners('foo')).toEqual([onFoo2]);
    });
    it('should pass gracefully if the listener for an event does not exist', function() {
      emitter.off('foo', onFoo);
    });
    it('should remove all listeners for all events in a namespace', function() {
      emitter.on('foo.namespace', onFooNs);
      emitter.on('bar.namespace', onBarNs);
      emitter.off('.namespace');
      expect(emitter.listeners('foo').length).toBe(0);
      expect(emitter.listeners('bar').length).toBe(0);
    });
    it('should remove all listeners in all namespaces for an event', function() {
      emitter.on('foo', onFoo);
      emitter.on('foo.namespace', onFooNs);
      emitter.off('foo');
      expect(emitter.listeners('foo').length).toBe(0);
    });
    it('should be chainable', function() {
      emitter
        .on('foo', onFoo)
        .on('bar', onBar)
        .off('foo')
        .off('bar');
      expect(emitter.listeners('foo').length).toBe(0);
      expect(emitter.listeners('bar').length).toBe(0);
    });
  });

  describe('emit', function() {
    it('should throw if event name is null or undefined', function() {
      expect(function() { emitter.emit(); }).toThrow('eventName is required');
    });
    it('should throw if the eventName is a bare namespace', function() {
      expect(function() { emitter.emit('.namespace'); })
        .toThrow('eventName cannot be a bare namespace: prefix with an event name instead');
    });
    it('should invoke the listeners with (sender, args)', function() {
      var invokedWith;
      var listener = function() { invokedWith = Array.prototype.slice.call(arguments); };
      var args = { arg1: 1, arg2: 2 };
      emitter.on('foo', listener);
      emitter.emit('foo', args);
      expect(invokedWith[0]).toBe(emitter);
      expect(invokedWith[1]).toBe(args);
    });
    it('should invoke all listeners in all namespaces for an event', function() {
      emitter.on('foo', increment );
      emitter.on('foo.namespace', increment);
      emitter.emit('foo');
      expect(invocations).toBe(2);
    });
    it('should invoke all listeners for the event synchronously', function() {
      emitter.on('foo', increment);
      emitter.on('foo', increment);
      emitter.emit('foo');
      expect(invocations).toBe(2);
    });
    it('should invoke all listeners asynchronously if options.async is true', function() {
      emitter.on('foo', increment);
      emitter.on('foo', increment);
      emitter.emit('foo', null, { async: true });
      expect(invocations).toBe(0);
      waits(1);
      runs(function() {
        expect(invocations).toBe(2);
      });
    });
    it('should be chainable', function() {
      emitter
        .on('foo', increment)
        .emit('foo')
        .emit('foo');
      expect(invocations).toBe(2);
    });
  });
});
