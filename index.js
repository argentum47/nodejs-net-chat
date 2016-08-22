'use strict'

const readline = require('readline')
const net = require('net')
const scanner = require('./scan')
const dB = require('./old/clientDb')
const initializeServer = require('./server')
const initializeClient = require('./client')
const wrapEvent = require('./wrapEvent')
const MAX_ATTEMPTS = 5
const PORT = 5000

let listOfPeers = []
let attemptsCount = 0
let clientSocket, serverSocket, nick;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', (line) => {
})

function bootStrap() { 
  return initializeServer(PORT).then(socket => {
    clientSocket = socket
    
    return wrapEvent(socket, 'data')
  }).then((data) => {
      let message = parseAndEval(data, { ip: socket.remoteAddress })
      socket.write(JSON.stringify(message))
   }).catch(e => console.log(e))
}

function parseAndEval(_data, extra) {
  let data = JSON.parse(_data.toString('utf8'));
  let message = {}

  if(data.type == 'ping') {
    message = Object.create({}, message, extra, { type: 'pong', text: nick })
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
    console.log(peer.name)
  })
}

rl.question('Enter a nick name ', (name) => {
  nick = name;

  return bootStrap().then(() => {
    console.log('here')
    return scanner()
  }).then(data => { 
    listOfPeers = dB.get()
    showListofPeers()
    rl.prompt(true)
 })
})

