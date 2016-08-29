'use strict'

const dgram        = require('dgram')
const emitter      = require('./events')
const net          = require('net')
const Utils        = require('./utils')
const Server       = require('./lib/server')
const DHT          = require('./lib/dht')
const createStore  = require('./store').createStore
const broadCastIp  = '192.168.43.255'
const PORT         = 5000
const ips          = Utils.ips

let nick
let nicks = createStore('nick')

/*
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
      } else if(net.isIP(nicks.get(nick))) {
        client.send(message, 0, message.length, PORT, clients.getNick(nick))
      }
    }
  } else return false
}
*/

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

        nicks.action((nd) => {
          JSON.parse(DHT.serialize()).forEach(c => nd[c.nick] = {ip: c.ip, owner: ips().includes(c.ip) })
          return nd;
        }, 'user::added')
      }
    } catch(e) {
      console.log(e)
    }
  })

  server.bind(5000, () => {
    console.log('server listening on 5000')
  })

  broadCastServer.on('message', (data, rinfo) => {
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

  broadCastServer.bind(5123, () => {
    emitter.emit('broadcast::connect', nick)
  })
}).catch(e => console.log(e))

emitter.on('broadcast::connect', (data) => {
  console.log('connected to broadcast server')
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
