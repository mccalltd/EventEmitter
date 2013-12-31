describe('EventEmitter', function() {
  'use strict';

  it('should exist globally', function() {
    expect(EventEmitter).toBeDefined();
  });

  describe('inheritence via extend', function() {
    it('should extend a prototype with its own prototype methods', function() {
      function Thing() {}
      EventEmitter.extend(Thing);
      Object.getOwnPropertyNames(EventEmitter.prototype).forEach(function(prop) {
        expect(Thing.prototype[prop]).toBeDefined();
      });
    });
  });

  describe('listeners', function() {
    it('should return the listeners subscribed for an event', function() {
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

  describe('once', function() {
    it('should add a listener for an event', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      emitter.once('foo', onFoo);
      expect(emitter.listeners('foo').length).toBe(1);
    });
    it('should add listeners for multiple events via a hash', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      var onBar = function() {};
      emitter.once({
        foo: onFoo,
        bar: onBar
      });
      expect(emitter.listeners('foo').length).toBe(1);
      expect(emitter.listeners('bar').length).toBe(1);
    });
    it('should be chainable', function() {
      var emitter = new EventEmitter();
      var onFoo = function() {};
      var onBar = function() {};
      emitter
        .once('foo', onFoo)
        .once('foo', onFoo);
      expect(emitter.listeners('foo').length).toBe(2);
    });
    it('should remove the listener after the first invocation', function() {
      var emitter = new EventEmitter();
      var invocations = 0;
      var onFoo = function() { invocations++; };
      emitter.once('foo', onFoo);
      expect(emitter.listeners('foo').length).toBe(1);
      emitter.emit('foo');
      expect(invocations).toBe(1);
      expect(emitter.listeners('foo').length).toBe(0);
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
    it('should invoke all listeners for the event synchronously', function() {
      var emitter = new EventEmitter();
      var invocations = 0;
      var inc = function() { invocations++; };
      emitter
        .on('foo', inc)
        .on('foo', inc)
        .emit('foo');
      expect(invocations).toBe(2);
    });
    it('should invoke all listeners for the event asynchronously', function() {
      var emitter = new EventEmitter();
      var invocations = 0;
      var inc = function() { invocations++; };
      emitter
        .on('foo', inc)
        .on('foo', inc)
        .emit('foo', { async: true });
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
