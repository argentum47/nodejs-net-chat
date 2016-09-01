'use strict';

const emitter = require('./events')
let store = {}

function Store(name) {
  this._name = name
  this._store = {}
}

Store.prototype.reduce = function (reducer) {
  this._store = reducer(this._store)
  return this
}

Store.prototype.get = function (prop) {
  return prop ? this._store[prop] : this._store
}

Store.prototype.update = function(prop, value) {
  if(typeof value === 'object' && this._store[prop]) this._store[prop] = Object.assign({}, this._store[prop], value)
  return this
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
