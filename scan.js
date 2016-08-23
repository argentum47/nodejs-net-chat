'use strict'

const net = require('net')
const dB = require('./ipDb')
const leaderIp = '192.168.1'
const makeColor = require('./color').make
const PORT = 5000

function destroy(socket, callback, data) {
  socket.destroy();
  if(socket.destroyed) callback(data)
}

module.exports = function() {
  let connections = []

  console.log('scanning avalabile ip\'s on ', PORT)
  
  for(let i = 1; i < 255; i++) {
    connections.push(connectToSocket(`${leaderIp}.${i}`))
  }

  return Promise.all(connections)
}

function connectToSocket(ip) {
  return new Promise((resolve) => {
    let socket = new net.Socket();
    
    socket.setTimeout(2000, () => { destroy(socket, resolve) })
    socket.connect(PORT, ip, () => {
      if(socket.localAddress != ip) socket.write(JSON.stringify({ type: 'ping' }))
      else destroy(socket, resolve)
    })
    socket.on('data', (data) => {
      data = data ? data.toString('utf8') : "{}"

      try {
        let jd = JSON.parse(data)

        if(jd.type == 'pong') {
          dB.add({ ip: socket.remoteAddress, nick: jd.text, color: makeColor(jd.text) })
        }
      } catch(e) { 
        console.log(e)
      }
       destroy(socket, resolve)
    })

    socket.on('error', () => {
      destroy(socket, resolve)
    })
  })
}

