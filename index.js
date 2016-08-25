'use strict'

const net = require('net')
const fs = require('fs')
const scanner = require('./scan')
const Commander = require('./commander').Commander
const executeCommand = require('./commander').executeCommand
const makeColor = require('./color').make
const color = require('./color').paint
const cconsole = require('./cconsole')
const rl = require('./utils').rl
const hashCode = require('./utils').hashCode
const ips = require('./utils').ips
const showListofPeers = require('./utils').showListofPeers
const dB = require('./ipDb')

const MAX_ATTEMPTS = 5
const PORT = 5000

let nick, attemptsCount = 0, listOfPeers = [], socket, client;

rl.on('line', (line) => {
  if(line.startsWith('!!')) {
    let message = executeCommand(line.slice(2))
    if(message) console.log(message)

  } else if(client && !client.destroyed) {
    client.write(JSON.stringify({ type: 'message', text: line, ip: client.remoteAddress }))
  }

  rl.prompt()
})


// generate default commands
function rtfm() {
  return Commander.guide()
}

function connect(clientIp) {
  let node = dB.find(clientIp)

  if(!node) { console.log('this user not available online'); process.exit() }

  client = net.createConnection({ port: PORT, host: clientIp }, () => {
    console.log('connected to: ', (node ? node.nick : clientIp))
    rl.prompt()
  })

  client.on('connect', () => {
    client.write(JSON.stringify({ type: 'pong', text: nick, ip: clientIp }))
  })

  client.on('destroy', () => {
    client.wrtie(JSON.stringify({ type: 'destroy', text: nick }))
  })
}


function leave() {
  if(client) client.destroy()
}

function scanAndShow() {
  return scanner().then(() => {
    listOfPeers = dB.all()

    showListofPeers(listOfPeers)
  }).catch(e => console.log(e))
}

Commander.register('rtfm', 'View available commands', rtfm)
Commander.register('connect', '<remote ip> To connect to a client', connect)
Commander.register('leave', 'the current conversation', leave)
Commander.register('scan', 'rescan the users available online', scanAndShow)

function bootStrap(cb) {
  let server = net.createServer();

  server.listen(PORT, () => {
    cb()
  })

  server.on('connection', (_socket) => {
    socket = _socket
    socket.on('data', (data) => {
      let message = parseAndEval(data, { ip: socket.remoteAddress }, socket);
      if(message) cconsole(message)
      rl.prompt()
    })

    socket.on('error', (err) => {
      console.log('Some error occured')
      rl.prompt()
    })
  })
}

function parseAndEval(_data, extra, socket) {
  let data = JSON.parse(_data.toString('utf8'));
  let message = ''

  let action = {
    ping: () => {
      socket.write(JSON.stringify(Object.assign({}, message, extra, { type: 'pong', text: nick })))
    },

    pong: () => {
      dB.add({ip: data.ip, nick: data.text, color: makeColor(data.text) })
    },

    destroy: () => {
      message = color(`${data.text} disconnected`, '#ff0000')
    },

    message: () => {
      let node = dB.find(data.ip)

      if(!client) connect(data.ip)
      if(node)    message = color(`<${node.nick}>`, `#${node.color}`)

      message = [message, data.text].join(" ")
    }
  }[data.type];

  action()

  return message
}

function checkAttempCount(count) {
  if(count > MAX_ATTEMPTS) {
    console.log("Maximum number of retries failed")
    return true
  }
}

function chooseUserName(user_name) {
  let promise = listOfPeers.length? Promise.resolve(listOfPeers) : scanner().then(() => listOfPeers = dB.all())

  return promise.then(() => {
    if(!user_name || listOfPeers.map(peer => peer.nick).includes(user_name)) {
      if(!user_name) console.log('user name ', user_name, ' exists')

      if(checkAttempCount(attemptsCount)) { console.log('maximum retries, try again'); process.exit(1) }

      rl.question('Choose another ', (name) => {
        attemptsCount += 1
        chooseUserName(name)
      })
    } else {
      fs.writeFileSync('.userrc', JSON.stringify(user_name))
      return user_name
    }
  }).catch(e => console.log(e))
}

function checkUserName(cb) {
  let name;

  fs.readFile('.userrc', (err, data) => {
    if(err || !data) {
      console.log('setting a nick name.. please reset it with tell -u <nick>')

      let hash = Math.abs(hashCode(ips()[0]))
      name = `user_${hash}`

      fs.writeFile('.userrc', JSON.stringify(name), (err, data) => {
        if(err) console.log('internal error occured, please try again or report author')
        else {
          console.log('Your nick name has been set to ', name)
          cb(name)
        }
      })
    } else {
      cb(JSON.parse(data.toString('utf8')))
    }
  })
}

function setUpConnect(ip) {
  bootStrap(() => {
    scanner().then((data) => {
      if(nick) executeCommand(`connect ${ip}`);
      else {
        fs.readFile('.userrc', (err, data) => {
          if(!err) {
            nick = JSON.parse(data.toString('utf8'))
            executeCommand(`connect ${ip}`)
          } else {
            chooseUserName().then(name => {
              nick = name
              executeCommand(`connect ${ip}`)
            })
          }
        })
      }
    })
  })
}

function init(_args) {
  // possible actions
  // -s to scan for available connections
  // -u to set username
  // -c to connect to <ip/name>
  // -h for help
  //
  // Still couldn't decide the natural order of operations
  // so hardcoding in docs
  // options are selected based on the order of precedence
  // order of precedence being lowest priority stuff first
  //
  // Priority List
  // h
  // u
  // s
  // c
  // any combination of u and c , u comes first

  function scan_or_connect(arg) {
    if(arg.s) return scanAndShow().then(() => process.exit())
    if(arg.c) return checkUserName((name) => {
      nick = name
      setUpConnect(arg.c)
    })
    process.exit()
  }

  if(_args.h) return executeCommand('rtfm')
  if(_args.u) return chooseUserName(_args.u).then((name) => {
    console.log("user_name set ", name)
    nick = name;
    scan_or_connect(_args)
  })
  else if(_args.s || _args.c) scan_or_connect(_args)
  else { console.log("invalid options"); process.exit(1) }
}

init(require('minimist')(process.argv.slice(2)))
