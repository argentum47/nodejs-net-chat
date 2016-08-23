'use strict'

const readline = require('readline')
const net = require('net')
const scanner = require('./scan')
const dB = require('./ipDb')
const wrapEvent = require('./wrapEvent')
const Commander = require('./commander')
const MAX_ATTEMPTS = 5
const PORT = 5000

let listOfPeers = []
let attemptsCount = 0
let socket, client;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', (line) => {
  if(line.startsWith('!!')) {
    let message = executeCommand(line.slice(2))
    if(message) console.log(message)

  } else if(client && client.remoteAddress) {
    client.write(JSON.stringify({ type: 'message', text: line }))
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
  /*
  client = net.createConnection({ port: PORT, address: clientIp}, () => {
    console.log('connected')    
    rl.prompt()
  })

  client.on('data', (data) => {
    console.log(data.toString('utf8'), 'client')
  })

  client.on('error', () => {
    console.log('cannot reach client, check ip')
  })
  */
  
  let data = dB.find(clientIp)

  if(data) {
    client = net.createConnect({ port: PORT, address: clientIp }, () => {
      console.log('connected')
      rl.prompt()
    }) 
  }
}


function leave(_client) {
  _client.destroy()
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
      let message = parseAndEval(data, { ip: socket.remoteAddress });
      socket.write(JSON.stringify(message))
    })
  })
}

function parseAndEval(_data, extra) {
  let data = JSON.parse(_data.toString('utf8'));
  let message = {}

  if(data.type == 'ping') {
    message = Object.assign({}, message, extra, { type: 'pong', text: nick })
  } if(data.type == 'message') {
    return Object.assign({}, message, { text: data.text })
  }

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
    console.log(peer.nick, peer.remoteAddress)
  })
}

let nick;

rl.question('Enter a nick name ', (name) => {
  nick = name;

  bootStrap(() => {
    console.log('here')
    scanner().then(data => {
      listOfPeers = dB.get()
      showListofPeers()
      rl.prompt(true)
    })
  })
})

