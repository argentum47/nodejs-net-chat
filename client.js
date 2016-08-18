'use strict';

const net = require('net');
let client = new net.Socket();

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a nickname: ', (name) => {
  client.name = name

  client.connect(process.env.PORT || 5000, '127.0.0.1', () => {
    client.write(`${name} has joined channel`);
    rl.prompt(true)
  })
})

rl.on('line', (line) => {
  client.write(line)
  rl.prompt()
})
client.on('data', (data) => {
  console.log(data.toString('utf8'))
})

client.on('end', () => {
  console.log('closed')
})

module.exports = client

