'use strict';

const net = require('net');
let client = new net.Socket();

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a nickname: ', (name) => {
  client.connect(process.env.PORT || 5000, '127.0.0.1', () => {
    client.write(JSON.stringify({type: 'name', name: name}));
    rl.prompt()
  })
})

rl.on('line', (line) => {
  client.write(JSON.stringify({type: 'message', message: line}))
  rl.prompt()
})
client.on('data', (data) => {
  data = data.toString('utf8')
  console.log(JSON.parse(data))
})

client.on('end', () => {
  console.log('closed')
})

module.exports = client

