describe('EventEmitter', function() {
  'use strict';

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
    it('should return a dictionary of events and listeners', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      var onBar = function() {};
      emitter.on({
        foo: onFoo,
        bar: onBar,
      });
      var listeners = emitter.listeners();
      expect(listeners.foo).toEqual([onFoo]);
      expect(listeners.bar).toEqual([onBar]);
    });
    it('should return the listeners added for an event', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      emitter.on('foo', onFoo);
      expect(emitter.listeners('foo')).toEqual([onFoo]);
    });
    it('should return an empty array if the event has no listeners', function() {
      var emitter = new EventEmitter();
      expect(emitter.listeners('foo')).toEqual([]);
    });
  });

  describe('on', function() {
    it('should add a listener for an event', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      emitter.on('foo', onFoo);
      expect(emitter.listeners('foo')).toEqual([onFoo]);
    });
    it('should add listeners for multiple events via a hash', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      var onBar = function() {};
      emitter.on({
        foo: onFoo,
        bar: onBar
      });
      expect(emitter.listeners('foo')).toEqual([onFoo]);
      expect(emitter.listeners('bar')).toEqual([onBar]);
    });
    it('should remove the listener after first invocation if options.once is true', function() {
      var emitter = new EventEmitter();
      var invocations = 0;
      var onFoo = function() { invocations++; };
      emitter.on('foo', onFoo, { once: true });
      emitter.emit('foo');
      expect(invocations).toBe(1);
      expect(emitter.listeners('foo').length).toBe(0);
    });
    it('should be chainable', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      var onBar = function() {};
      emitter
        .on('foo', onFoo)
        .on('foo', onFoo);
      expect(emitter.listeners('foo').length).toBe(2);
    });
  });

  describe('off', function() {
    it('should remove all listeners for all events', function() {
      var emitter = new EventEmitter();
      emitter.on({
        foo: function() {},
        bar: function() {}
      });
      emitter.off();
      expect(emitter.listeners('foo').length).toBe(0);
      expect(emitter.listeners('bar').length).toBe(0);
    });
    it('should remove all listeners for a single event', function() {
      var emitter = new EventEmitter();
      emitter.on({
        foo: function() {},
        bar: function() {}
      });
      emitter.off('foo');
      expect(emitter.listeners('foo').length).toBe(0);
      expect(emitter.listeners('bar').length).toBe(1);
    });
    it('should remove a single listener for a single event', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      var onFoo2 = function() {};
      emitter.on('foo', onFoo);
      emitter.on('foo', onFoo2);
      emitter.off('foo', onFoo);
      expect(emitter.listeners('foo')).toEqual([onFoo2]);
    });
    it('should pass gracefully if the listener for an event does not exist', function() {
      var emitter = new EventEmitter();
      emitter.off('foo', function() {});
    });
    it('should be chainable', function() {
      var emitter = new EventEmitter();
      emitter
        .on('foo', function() {})
        .on('bar', function() {})
        .off('foo')
        .off('bar');
      expect(emitter.listeners('foo').length).toBe(0);
      expect(emitter.listeners('bar').length).toBe(0);
    });
  });

  describe('emit', function() {
    it('should invoke the listeners with (sender, args)', function() {
      var emitter = new EventEmitter();
      var invokedWithSender;
      var invokedWithArgs;
      var onFoo = function(sender, args) {
        invokedWithSender = sender;
        invokedWithArgs = args;
      };
      var args = { arg1: 1, arg2: 2 };
      emitter
        .on('foo', onFoo)
        .emit('foo', args);
      expect(invokedWithSender).toBe(emitter);
      expect(invokedWithArgs).toBe(args);
    });
    it('should invoke all listeners for the event synchronously', function() {
      var emitter = new EventEmitter();
      var invocations = 0;
      var onFoo = function() { invocations++; };
      emitter
        .on('foo', onFoo)
        .on('foo', onFoo)
        .emit('foo');
      expect(invocations).toBe(2);
    });
    it('should invoke all listeners asynchronously if options.async is true', function() {
      var emitter = new EventEmitter();
      var invocations = 0;
      var onFoo = function() { invocations++; };
      emitter
        .on('foo', onFoo)
        .on('foo', onFoo)
        .emit('foo', null, { async: true });
      expect(invocations).toBe(0);
      waits(1);
      runs(function() {
        expect(invocations).toBe(2);
      });
    });
    it('should be chainable', function() {
      var emitter = new EventEmitter();
      var invocations = 0;
      emitter
        .on('foo', function() { invocations++; })
        .emit('foo')
        .emit('foo');
      expect(invocations).toBe(2);
    });
  });
});
