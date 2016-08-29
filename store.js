'use strict';
const emitter = require('./events')
const createStore = (initialValue) => {
  let obj = initialValue

  return {
    action: function(reducer, event) {
      obj = reducer(obj);
      console.log(obj)
      emitter.emit(event, obj)
    },

    get: (prop) => obj[prop]
  }
}

exports.createStore = createStore
exports.emitter = emitter
