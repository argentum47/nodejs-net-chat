'use strict';

const readline = require('readline')
const os = require('os')

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

let showListofPeers = function (listOfPeers) {
  if(!listOfPeers.length) console.log('no user connected')

  listOfPeers.forEach(peer => {
    console.log(peer.nick, peer.ip)
  })
}

let questionAsync = (str, cb) => new Promise((res) => { rl.question(str, answer => res(answer)) })

function hashCode(str) {
  let hash = 0;
  if(!str) return 0

  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 17) - hash);
    hash |= 0
  }

  return hash;
}


function ips(obj) {
  let interfaces = os.networkInterfaces();
  if(obj)
    return Object.keys(interfaces).reduce((acc, k) => {
      let items = interfaces[k].filter(i => i.family == 'IPv4' && !i.internal); acc[k] = items.length ? items[0].address : false; return acc  }, {})
  else
    return Object.keys(interfaces).reduce((acc, k) => { let items = interfaces[k].filter(i => i.family == 'IPv4' && !i.internal); return items.length ? acc.concat(items[0].address) : acc  }, [])
}

exports.rl = rl
exports.showListofPeers = showListofPeers
exports.questionAsync = questionAsync
exports.ips = ips
exports.hashCode = hashCode
