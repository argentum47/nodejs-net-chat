'use strict';

const emitter = require('./events')
let store = {}

function Store(name) {
  this._name = name
  this._store = {}
}

Store.prototype.action = function (reducer, event) {
  this._store = reducer(this._store)
  console.log(this._store, 'haha')

  setTimeout(() => {
    emitter.emit(event, this._store)
  }, 1000)
}

Store.prototype.get = function (prop) {
  return this._store[prop]
}

function createStore(name) {
  let s = new Store(name)
  store[name] = s
  return s
}

function getStore(name) {
  return store[name]
}
exports.getStore = getStore
exports.createStore = createStore
