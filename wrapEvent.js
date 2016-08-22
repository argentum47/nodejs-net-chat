module.exports = function wrapEvent(emitter, eventType) {
  return new Promise((resolve) => {
    emitter.on(eventType, resolve)
  })
}

