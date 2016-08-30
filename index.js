'use strict'

const dgram        = require('dgram')
const emitter      = require('./events')
const net          = require('net')
const Utils        = require('./utils')
const Server       = require('./lib/server')
const broadCastIp  = '192.168.1.255'

let nick

function getUser(name) {
  let server, broadCastServer;

  return Utils.getUserName(name).then((data) => {
    nick = JSON.parse(data)
  }).then(() => nick).catch(e => console.log(e))
}

function createServer(PORT) {
  return new Promise(res => {
    let server = new Server()
    server.bind(PORT, () => res(server))
  })
}

function echoPresence(name) {
  return new Promise((res) => {
    let broadCastClient = dgram.createSocket('udp4')
    let message = new Buffer(JSON.stringify({nick: name, type: 'nick'}))

    broadCastClient.bind(5124, () => {
      broadCastClient.setBroadcast(true)
      broadCastClient.send(message, 0, message.length, 5123, broadCastIp, () => {
        broadCastClient.close()
        res()
      })
    })
  })
}

exports.getUser = getUser
exports.createServer = createServer
exports.echoPresence = echoPresence

