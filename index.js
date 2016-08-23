'use strict'

const readline = require('readline')
const net = require('net')
const scanner = require('./scan')
const dB = require('./ipDb')
const wrapEvent = require('./wrapEvent')
const Commander = require('./commander')
const makeColor = require('./color').make
const color = require('./color').paint
const cconsole = require('./cconsole')
const MAX_ATTEMPTS = 5
const PORT = 5000

let nick, attemptsCount = 0, listOfPeers = [], socket, client;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', (line) => {
  if(line.startsWith('!!')) {
    let message = executeCommand(line.slice(2))
    if(message) console.log(message)

  } else if(client && !client.destroyed) {
    client.write(JSON.stringify({ type: 'message', text: line, ip: client.remoteAddress }))
  }

  rl.prompt()
})

function executeCommand(_data) {
  let [command, ...value] = _data.split(" ")

  return Commander.execute(command, value.join(" "))
}

// generate default commands
function rtfm() {
  return Commander.guide()
}


function connect(clientIp) {
  let node = dB.find(clientIp)

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
  client.destroy()
}

Commander.register('rtfm', 'View available commands', rtfm)
Commander.register('connect', '<remote ip> To connect to a client', connect)
Commander.register('leave', 'the current conversation', leave)


function bootStrap(cb) {
  let server = net.createServer();

  server.listen(PORT, () => {
    console.log('listening')
    cb()
  })

  server.on('connection', (_socket) => {
    socket = _socket
    socket.on('data', (data) => {
      let message = parseAndEval(data, { ip: socket.remoteAddress }, socket);
      if(message) cconsole(message)
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

function showListofPeers() {
  listOfPeers.forEach(peer => {
    console.log(peer.nick, peer.ip)
  })
}

rl.question('Enter a nick name ', (name) => {
  nick = name;

  bootStrap(() => {
    scanner().then(data => {
      listOfPeers = dB.all()
      showListofPeers()
      rl.prompt(true)
    }).catch(e => console.log(e, 'err'))
  })
})
