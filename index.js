'use strict'

const readline = require('readline')
const listOfPeers = require('./scan')
const initializeServer = require('./server')
const initializeClient = require('./client')

const PORT = 5000
let attemptsCount = 0
let server = initializeUDPServer()
let client = initializeUDPClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function bootStrap() {
  showListofPeers()

  rl.question('enter a name', (name) => {
    attemptsCount += 1

    if(isUnique(name)) {
      server.name = name
      listenOnServer()
      broadcastToPeers()

      rl.prompt(true)
    } else if(attemptsCount > 4) {
      maximumRetriesFailed()
      process.exit(1)
    } else bootStrap()
  })
}

rl.on('line', (line) => {
  sendMessage(line)
})

function showListofPeers() {
  listOfPeers.forEach(peer => {
    console.log(peer.name)
  })
}

function listenOnServer() {
  server.on('listening', () => {
    console.log('...')
  })

  server.on('message', (msg, rinfo) => {
    console.log(msg, rinfo)
  })

  server.bind(PORT)
}
bootStrap()
