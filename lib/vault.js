'use strict'

const crypto = require('crypto')
const algorithm = 'aes-256-cbc'

exports.encrypt = function (text, password){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text, 'utf8', 'base64')
  crypted += cipher.final('base64');
  return crypted;
}

exports.decrypt = function (text, password){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text, 'base64', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

// stream and buffers available
// https://github.com/chris-rock/node-crypto-examples
