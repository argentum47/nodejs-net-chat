'use strict';

const net = require('net');
const clientDb = require('./clientDb');

let clients = clientDb.get()

let server = net.createServer(function(socket) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort

  socket.on('data', onReceiveData(socket))
  socket.on('error', onError(socket))
  socket.on('end', onEnd(socket))
})

server.listen(process.env.PORT || 5000, '127.0.0.1', () => {
  console.log('Listening on 5000')
})

module.exports = server

function welcomeMessage(socket) {
  broadCastToUser(socket, JSON.stringify({message: `Welcome ${socket.nick}`, type: 'me' }))
  broadCastToChannel(`${socket.nick} joined chat`, filterClients(clients, socket), 'broadcast')
}

function onReceiveData(socket) {
  return (data) => {
    let _data = JSON.parse(data)
    let message;

    if(_data.type == 'name') {
        socket.nick = _data.name
      if(clientDb.isUnique(socket)) {
        clients = clientDb.create(socket).get()
        return welcomeMessage(socket)
      } else {
        broadCastToUser(socket, JSON.stringify({message: 'User name exists, Reconnect and choose another', type: 'me'}))
        return socket.destroy()
      }
    } else if(_data.type == 'message'){
      broadCastToChannel(_data.message, filterClients(clients, socket), 'chat', socket.nick)
      console.log(_data)
    }
  }
}

function onError(socket) {
  return (err) => {
    console.log(err);
  }
}

function onEnd(socket) {
  return () => {
    clients = filterClients(clientDb.remove(socket).get(), socket)
    broadCastToChannel(`${socket.nick} left channel`, clients, 'broadcast')
  }
}

function filterClients(clients, sender) {
  return clients.filter(_client => _client != sender)
}

function parseMessage(message) {

}

function broadCastToUser(client, message) {
  client.write(message)
}

function broadCastToChannel(message, clients, type, from) {
  clients.forEach(_client => {
    broadCastToUser(_client, JSON.stringify({message: message, type: type, from: from }))
  })
}

