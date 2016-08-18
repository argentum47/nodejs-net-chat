module.exports = (function() {
  'use strict';

  let clients = [];

  function existsClient(client, prop) {
    return clients.some(_client => _client[prop] == client[prop])
  }

  function find(clients) {
    if([].find) {
      return clients.find(cb)
    } else {
      let result

      for(let i = 0, len = clients.length; i < len; i++) {
        if((result = cb(clients[i]))) return result
      }
    }
  }

  function isUnique(client) {
    return !existsClient(client, 'nick')
  }

  function add(client) {
    if(isUnique(client)) {
      clients.push(client)
    } else {
      throw new Error('user name exists')
    }
    return this;
  }

  function fetch(client) {
    if(client && existsClient(client, 'nick')) {
      return find(clients, (_client) => _client.nick == client.nick)
    }
    return clients;
  }

  function remove(client) {
    if(client && existsClient(client, 'nick')) {
      clients = clients.filter(_client => _client.nick != client.nick)
    }
    return this
  }
  return {
    isUnique: isUnique,
    create: add,
    get: fetch,
    remove: remove
  }
})()
