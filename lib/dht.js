const Bucket = require('./bucket')
let bucket  = new Bucket()

let contactsMap = {}

let DHT = {
  __bucket: bucket,

  create: function (id, ip, port, nick) {
    let obj = { id: id, ip: ip, port: port, nick }
    let contact = bucket.add(obj)
    contactsMap[ip] = contact.id

    return this
  },

  find: function (ip) {
    let id = contactsMap[ip]

    if(!id) return null
    bucket.get(id)

    return this;
  },

  update: function (ip) {
    let id = contactsMap[ip]

    if(!id) return null
    bucket.add(bucket.get(id))

    return this
  },

  serialize: function() {
    return JSON.stringify(bucket.root.contacts)
  }
}

module.exports = DHT
