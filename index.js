'use strict'


const dgram        = require('dgram')
const EventEmitter = require('events')
const fs           = require('fs')
const os           = require('os')
const rl           = require('readline').createInterface({ input: process.stdin, output: process.stdout })

const broadCastIp = '192.168.1.255'
//const broadCastIp = '0.0.0.0'
const PORT        = 5000 
const rcfile      = '.userrc'

let nick
let Utils = {
  wrap: function(fn) {
          let ctx = this;

          return function() {
            let args = Array.from(arguments)
            
            return new Promise((resolve, reject) => {
              fn.apply(ctx, args.concat((err, result) => {
                if(err) reject(err)
                else resolve(result)
              }))
            })
          }
        },

  hashCode: function(data) {
              if(!data) return 0
              if(typeof data !== 'string') data = data.toString()
              
              let hash = 0
              for(let i =  0, len = data.length; i < len; i++) {
                hash = data.charCodeAt(i) + ((hash << 17) - hash)
                hash |= 0
              }

              return hash
            }
}

let readFileAsync = Utils.wrap(fs.readFile)
let writeFileAsync = Utils.wrap(fs.writeFile)

rl.on('line', (data) => {
  if(isCommand(data)) {
  } else {
    console.log(data)
  }
})

function ips() {
  let interfaces = os.networkInterfaces()

  return Object.keys(interfaces).reduce((acc, k) => {
    return acc.concat(interfaces[k].filter(i => i.family == 'IPv4' && !i.internal).map(i => i.address))
  }, [])
}

function isCommand(data) {
  if(data.startsWith('/')) {
    if(data == '/connect') {
      // connect to server
    }
  } else return false
}

// implement DHT for getting all users on network

let clients = {
  __data: {},
  add: function(ip, nick) { this.__data[ip] = { ip: ip, nick: nick }  },
  getNick: function(nick) { return Object.keys(this.__data).filter(k => this.__data[k] && this.__data[k].nick )[0] }
}

function getUserName(name) {
  let ip = ips()[0]
    
  return readFileAsync(rcfile).then(data => {
    nick = data.toString('utf8')
  }).catch(()=> {
    nick = `user_${Math.abs(Utils.hashCode(ip))}`
    return writeFileAsync(rcfile, JSON.stringify(nick));
  }).then(() => {
    console.log('username set to ', nick)
  }).catch(err => { console.log(err) })
}


getUserName().then(() => {
  let broadCastServer = dgram.createSocket('udp4')
  let emitter = new EventEmitter()

  broadCastServer.on('message', (msg, rinfo) => {
    try {
      let data = JSON.parse(msg.toString('utf8'))
      if(data.type == 'nick') {
        if(!ips().includes(rinfo.address)) clients.add(rinfo.address, data.nick)
      }
    } catch(e) {
      console.log('error parsing your data ', data.toString('utf8'))
    }
   rl.prompt(true)
  })

  broadCastServer.bind(5123, () => {
    emitter.emit('broadcast::connect')
  })

  emitter.on('broadcast::connect', () => {
    function echoPresence() {
      let broadCastClient = dgram.createSocket('udp4')
      let message = new Buffer(JSON.stringify({nick: nick, type: 'nick'}))

      broadCastClient.bind(PORT, () => {
        broadCastClient.setBroadcast(true)
        broadCastClient.send(message, 0, message.length, 5123, broadCastIp, () => {
          broadCastClient.close()
        })
      })
    }

    echoPresence()
    //setInterval(() => { echoPresence() }, 4000)
  })
})

