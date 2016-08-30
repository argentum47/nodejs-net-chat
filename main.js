'use strict'

const electron      = require('electron')
const net           = require('net')
const dgram         = require('dgram');
const app           = electron.app
const BrowserWindow = electron.BrowserWindow
const getStore      = require('./store').getStore

let mainWindow = null

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
    require('./index')
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
 if(process.platform !== 'darwin') app.quit()
})

exports.sendMessage = function (from, to, value) {
  let nicks = getStore('nick')
  let PORT = 5000

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

    let message = new Buffer(JSON.stringify({ type: 'message', text: JSON.stringify(value)}))
    let toIp = nicks.get(to)
    
    if(toIp && net.isIP(toIp.ip)) {
      client.send(message, 0, message.length, PORT, toIp.ip)
    }
  }
}
