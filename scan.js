'use strict'

const net = require('net')
const leaderIp = '192.168.43'

for(let i = 0; i < 256; i++) {
  let socket = new net.Socket()

  socket.connect(5002, `${leaderIp}.${i}`, () => {
    console.log('connecting', socket.remoteAddress)
    setTimeout(() => { socket.destroy() }, 2000)
  })

  socket.on('error', () => {})
  socket.on('connect', () => {
    console.log('ping')
  })
}
