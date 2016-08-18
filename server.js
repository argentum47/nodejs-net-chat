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
  socket.write(JSON.stringify({message: `Welcome ${socket.nick}`}))
  broadCastToChannel(JSON.stringify({message:`${socket.nick} joined chat`}), filterClients(clients, socket))
}

function onReceiveData(socket) {
  return (data) => {
    data = JSON.parse(data)
    let message;

    if(data.type == 'name') {
      if(clientDb.isUnique(socket)) {
        clients = clientDb.create(socket).get()
        socket.nick = data.name
        return welcomeMessage(socket, data)
      } else {
        socket.write('User name exists, Reconnect and choose another')
        return socket.disconnect()
      }
    } else if(data.type == 'message'){
      broadCastToChannel(data, filterClients(clients, socket))
      console.log(JSON.parse(data.message).message)
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
    broadCastToChannel(`${socket.name} left channel`, clients)
  }
}

function filterClients(clients, sender) {
  return clients.filter(_client => _client != sender)
} 

function broadCastToChannel(message, clients) {
  clients.forEach(_client => {
    _client.write(message)  
  })
}

