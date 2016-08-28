'use strict'

const dgram        = require('dgram')
const EventEmitter = require('events')
const net          = require('net')
const rl           = require('readline').createInterface({ input: process.stdin, output: process.stdout })
const Utils        = require('./utils')
const Server       = require('./lib/server')
const DHT          = require('./lib/dht')
const broadCastIp  = '192.168.1.255'
const PORT         = 5000
const ips          = Utils.ips

let nick
let emitter = new EventEmitter()
let nicks = {}

rl.on('line', (data) => {
  if(isCommand(data)) {
  } else {
    console.log(data)
  }
  rl.prompt(true)
})

function isCommand(data) {
  if(data.startsWith('/')) {
    let [command, nick, ...value] = data.split(' ')
    value = value.join('')

    if(command == '/msg') {
      let client = dgram.createSocket('udp4')
      client.on('message',(msg, rinfo) => {
        try {
          let data = JSON.parse(msg.toString('utf8'))
          console.log(data)
        } catch(e){
          console.log(e)
        }
      })

      let message = new Buffer(JSON.stringify(value))

      if(net.isIP(nick)) {
        client.send(message, 0, message.length, PORT, nick)
      } else if(net.isIP(nicks[nick])) {
        client.send(message, 0, message.length, PORT, clients.getNick(nick))
      }
    }
  } else return false
}

function setNicks(data) {
  if(!data) return

  if(Array.isArray(data)) {
    data.forEach(n => {
      nicks[n.nick] = n.ip
    })
  } else if(data.nick && data.ip) {
    nicks[data.nick] = data.ip
  }
}

Utils.getUserName().then((data) => {
  nick = JSON.parse(data)
  let server = new Server()
  let broadCastServer = new Server()

  server.on('message', (data, rinfo) => {
    try {
      if(data.type == 'clients') {
        let clients = JSON.parse(data.data)
        clients.forEach(c => {
          DHT.create(Buffer.from(c.id), c.ip, c.port, c.nick)
        })

        setNicks(JSON.parse(DHT.serialize()).map(c => ({ nick: c.nick, ip: c.ip})))
      }
    } catch(e) {
      console.log(e)
    }
    rl.prompt(true)
  })

  server.bind(5000, () => {
    console.log('server listening on 5000')
    rl.prompt()
  })

  broadCastServer.on('message', (data, rinfo) => {
    if(data.type == 'nick') {
      nicks[data.nick] = rinfo.address
      DHT.create(Utils.encrypt(rinfo.address), rinfo.address, PORT, nick)

      let client = dgram.createSocket('udp4')
      let message = new Buffer(JSON.stringify({ type: 'clients', data: DHT.serialize() }))

      client.send(message, 0, message.length, PORT, rinfo.address, () => {
        client.close()
        client = null
      })
    }
   rl.prompt(true)
  })

  broadCastServer.bind(5123, () => {
    emitter.emit('broadcast::connect', nick)
  })
}).catch(e => console.log(e))

emitter.on('broadcast::connect', (data) => {
  echoPresence(data)
})

function echoPresence(name) {
  let broadCastClient = dgram.createSocket('udp4')
  let message = new Buffer(JSON.stringify({nick: name, type: 'nick'}))

  broadCastClient.bind(5124, () => {
    broadCastClient.setBroadcast(true)
    broadCastClient.send(message, 0, message.length, 5123, broadCastIp, () => {
      broadCastClient.close()
    })
  })
}
