'use strict';

const net      = require('net');
const color    = require('ansi-color').set
const readline = require('readline')
const cconsole = require('./cconsole')

let client = new net.Socket();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a nickname: ', (name) => {
  client.nick = name
  client.connect(process.env.PORT || 5000, '127.0.0.1', () => {
    client.write(JSON.stringify({type: 'name', name: name}))
    rl.prompt(true)
  })
})

rl.on('line', (line) => {
  client.write(JSON.stringify({type: 'message', message: line}))
  rl.prompt()
})

client.on('data', (data) => {
  data = data.toString('utf8')

  cconsole(formatMessage(data))
  rl.prompt(true)
})

client.on('end', () => {
  console.log('closed')
})


function formatMessage(data) {
  try {
    let formatedMessage;
    data = JSON.parse(data)
    
    if(data.message) {
      if(data.type == 'broadcast') {
        formatedMessage = color('<broadcast>', 'red')
      } else if(data.type == 'chat') {
        formatedMessage = color(`<${data.from}>`, 'green')
      } else if(data.type == 'me')  {
        formatedMessage = color('<server>', 'cyan') 
      } else if(data.type == 'tell') {
        formatedMessage = color(`[${data.from} -> ${data.to}]`, 'violet')
      }

      return [formatedMessage, data.message].join(' ')
    }
  } catch(e) {
    return color('Server Error', 'pink')
  }
}

module.exports = client

