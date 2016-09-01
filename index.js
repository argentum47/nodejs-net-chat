'use strict'

const dgram       = require('dgram')
const emitter     = require('./events')
const net         = require('net')
const Utils       = require('./utils')
const Server      = require('./lib/server')
const appConfig   = require('./package.json').appConfig
const clientPort  = Utils.normalizePort(appConfig.broadcastClientPort)
const serverPort  = Utils.normalizePort(appConfig.broadcastServerPort)
const broadCastIp = appConfig.broadcastIp

let nick

function getUser(name) {
  let server, broadCastServer;

  return Utils.getUserName(name).then((data) => {
    nick = JSON.parse(data)
  }).then(() => nick).catch(e => console.log(e))
}

function echoPresence(message) {
  return new Promise((res) => {
    let broadCastClient = dgram.createSocket('udp4')
    message = new Buffer(JSON.stringify(message))

    broadCastClient.bind(clientPort, () => {
      //console.log('broadcast client running on PORT ', 5124)

      broadCastClient.setBroadcast(true)
      broadCastClient.send(message, 0, message.length, serverPort, broadCastIp, () => {
        broadCastClient.close(() => { console.log('client shutdown') })
        res()
      })
    })
  })
}

exports.getUser = getUser
exports.echoPresence = echoPresence
