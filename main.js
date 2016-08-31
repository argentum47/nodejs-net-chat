'use strict'

const electron      = require('electron')
const net           = require('net')
const dgram         = require('dgram');
const index         = require('./index')
const createStore   = require('./store').createStore
const Utils         = require('./utils')
const DFH           = require('./lib/dfh')
const DHT           = require('./lib/dht')
const Server        = require('./lib/server')
const app           = electron.app
const BrowserWindow = electron.BrowserWindow
const PORT          = 5000
const BROPORT       = 5123

let nicks      = createStore('nick')
let mainWindow = null
let server, bServer, nick

function createWindow() {
 mainWindow = new BrowserWindow({
    height: 600,
    width: 800
  })

  mainWindow.loadURL(`file://${__dirname}/app/views/index.html`)
  mainWindow.webContents.openDevTools()
  mainWindow.on('close', () => {
    mainWindow = null
  })
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('stuff')
  })

}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit()
})
app.on('before-quit', () => {
  if(server) server.close()
  if(bServer) bServer.close()
})

function parseUserMessage(msg, rinfo) {
  //console.log('parseUserMessage', msg)
  try {
    if(msg.type == 'clients') {
      let clients = JSON.parse(msg.data)
      //console.log('user', rinfo.address, clients.map(c => c.ip + ' ' + c.nick))
      clients.forEach(c => DHT.create(Buffer.from(c.id), c.ip, c.port, c.nick))
      nicks.reduce(n => {
        clients.forEach(c => n[c.nick] = { ip: c.ip })
        return n
      })
      //console.log('sending', nicks.get())
      mainWindow.webContents.send('update-nicks', nicks.get())
    } else if(msg.type == 'message') {
      mainWindow.webContents.send('update-messages', { from: msg.from, text: msg.text })
    }
  } catch(e) {
    console.log(e)
    mainWindow.webContents.send('error', { message: e.message })
  }
}

function parseBroadcastMessage(msg, rinfo, nick) {
  console.log('parseBroadcastMessage', msg)
  try {
    if(msg.type == 'nick') {
      nicks.reduce(n => {
        n[msg.nick] = { ip: rinfo.address }
        return n
      })

      DHT.create(Utils.encrypt(rinfo.address), rinfo.address, PORT, msg.nick)
      mainWindow.webContents.send('update-nicks', nicks.get())

      let client = dgram.createSocket('udp4')
      let message = new Buffer(JSON.stringify({ type: 'clients', data: DHT.serialize() }))

      client.send(message, 0, message.length, PORT, rinfo.address, () => {
        client.close()
        client = null
      })
    } else if(msg.type == 'leave') {
      nicks.reduce(n => {
        delete n[msg.nick]
        return n
      })

      mainWindow.webContents.send('update-nicks', nicks.get())
    }
  } catch(e) {
    console.log(e)
    mainWindow.webContents.send('error', e.message)
  }
}

exports.broadCastServer = function(name) {
  nick = name

  return new Promise(res => {
    bServer = new Server()

    bServer.on('message', (msg, rinfo) => parseBroadcastMessage(msg, rinfo, nick))

    bServer.on('close', () => {
      index.echoPresence({ nick: nick, type: 'leave' })
    })

    bServer.bind(BROPORT, () => {
      console.log('broadcast server listening on PORT ', BROPORT)
      index.echoPresence({nick: nick, type: 'nick'}).then(() => res()).catch(e => console.log(e))
    })
  })
}

exports.userServer = function() {
  return new Promise(res => {
    server = new Server()

    server.on('message', (msg, info) => {
      parseUserMessage(msg, info)
    })

    server.bind(PORT, () => {
      console.log('user server listening on PORT ', PORT)
      res()
    })
  })
}

exports.initiateExchange = function(from, to) {

}

exports.sendMessage = function (from, to, value) {
  if(nicks) {
    let client = dgram.createSocket('udp4')
    client.on('message', (msg, rinfo) => {
      try {
        let data = JSON.parse(msg.toString('utf8'))
        console.log(data)
      } catch(e){
        console.log(e)
      }
    })

    let toIp = nicks.get(to)
    let fromIp = nicks.get(from)

    if(toIp && fromIp && net.isIP(toIp.ip), net.isIP(fromIp.ip)) {
      let message = new Buffer(JSON.stringify({ type: 'message', from: from, text: JSON.stringify(value)}))
      client.send(message, 0, message.length, PORT, toIp.ip)
    }
  }
}
