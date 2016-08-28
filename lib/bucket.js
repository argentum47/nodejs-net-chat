'use strict'

const assert = require('assert')
const crypto = require('crypto')
//const EventEmitter = require('events')
const util = require('util')

function createNode() {
  return { contacts: [] }
}

function Bucket(options) {
  options = options || {}
  //EventEmitter.call(this, options)

  this.localNodeId = options.localNodeId || crypto.randomBytes(20)
  this.root = createNode()
}

Bucket.prototype.add = function (contact) {
  let node = this.root
  let index = this._indexOf(node, contact.id)

  if(index >= 0) {
    this._update(node, index, contact)
    return this
  }

  node.contacts.push(contact)
  //this.emit('contact::added', contact)
  return contact
}

Bucket.prototype._indexOf = function (node, id) {
  for(let i = 0; i < node.contacts.length; i++) {
    if(node.contacts[i].id.equals(id)) return i
  }
}

Bucket.prototype.get = function (id) {
  let index = this._indexOf(this.root, id)
  return index ? this.root.contacts[index] : null
}

Bucket.prototype._update = function (node, index, contact) {
  if(node.contacts[index].id.equals(contact.id)) {
    node.contacts.splice(index, 1)
    node.contacts.push(contact)
  }
  return this
}

//util.inherits(Bucket, EventEmitter)
module.exports = Bucket
