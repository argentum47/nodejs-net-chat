'use strict';

const net = require('net');
let clients = [];

let server = net.createServer(function(socket) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort

  clients.push(socket);

  socket.write(`Welcome ${socket.name}\n`);
  broadCastToChannel(`${socket.name} joined chat`, filterClients(clients, socket))
  
  socket.on('data', function(data) {
    let message = `${socket.name} > ${data}`
    broadCastToChannel(message, filterClients(clients, socket))
    process.stdout.write(message + "\n")
  })

  socket.on('error', (err) => {
    console.log(error);
  })

  socket.on('end', () => {
    clients = filterClients(clients, socket)
    broadCastToChannel(`${socket.name} left channel`, clients)
  })
})

server.listen(process.env.PORT || 5000, '127.0.0.1', () => {
  console.log('Listening on 5000')
})
module.exports = server;

function filterClients(clients, sender) {
  return clients.filter(_client => _client != sender)
} 

function broadCastToChannel(message, clients) {
  clients.forEach(_client => {
    _client.write(message);  
  })
}

