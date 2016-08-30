'use strict'

const dgram        = require('dgram')
const emitter      = require('./events')
const net          = require('net')
const Utils        = require('./utils')
const Server       = require('./lib/server')
const DHT          = require('./lib/dht')
const createStore  = require('./store').createStore
const broadCastIp  = '192.168.1.255'
const PORT         = 5000
const ips          = Utils.ips

let nick
let nicks = createStore('nick')

function handleClientMessages(server) {
   server.on('message', (data, rinfo) => {
    try {
      if(data.type == 'clients') {
        let clients = JSON.parse(data.data)
        clients.forEach(c => {
          DHT.create(Buffer.from(c.id), c.ip, c.port, c.nick)
        })

        nicks.action((nd) => {
          JSON.parse(DHT.serialize()).forEach(c => nd[c.nick] = {ip: c.ip, owner: ips().includes(c.ip) })
          return nd;
        }, 'user::added')
      }
    } catch(e) {
      console.log(e)
    }
  })
}

function handleBroadCastMessages(server) {
  server.on('message', (data, rinfo) => {
    if(data.type == 'nick') {
      nicks.action(nd => {
        nd[data.nick] = { ip: rinfo.address, owner: ips().includes(rinfo.address) }
        return nd
      }, 'user::added')
      DHT.create(Utils.encrypt(rinfo.address), rinfo.address, PORT, nick)

      let client = dgram.createSocket('udp4')
      let message = new Buffer(JSON.stringify({ type: 'clients', data: DHT.serialize() }))

      client.send(message, 0, message.length, PORT, rinfo.address, () => {
        client.close()
        client = null
      })
    }
  })
}

function getUser(name) {
  let server, broadCastServer;

  return Utils.getUserName(name).then((data) => {
    nick = JSON.parse(data)
    server = new Server()
    broadCastServer = new Server()
  }).then(() => {
    handleClientMessages(server)
    return new Promise(res => {
      server.bind(PORT, res)
    })
  }).then(() => {
    handleBroadCastMessages(broadCastServer)
    return new Promise(res => {
      broadCastServer.bind(5123, () => {
        echoPresence(nick).then(res)
      })
    })
  }).then(() => nick).catch(e => console.log(e))
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
exports.handleClientMessages = handleClientMessages
exports.handleBroadCastMessages = handleBroadCastMessages
