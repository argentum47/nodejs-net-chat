'use strict'

const crypto = require('crypto');

function DeffMan(prime, generator) {
  this.user = prime && generator ? crypto.createDiffieHellman(prime, generator) : crypto.createDiffieHellman(120)
  this.sharedPrime = this.user.getPrime()
  this.generator = this.user.getGenerator()
}

DeffMan.prototype.getPublicKey = function() {
  this.user.generateKeys()
  return this.user.getPublicKey()
}

DeffMan.prototype.computeSecret = function(public_key) {
  return this.user.computeSecret(public_key)
}

module.exports = DeffMan
// usage
/*
let alice = new DeffMan();
let bob = new DeffMan(alice.sharedPrime, alice.generator);

let alice_key = alice.getPublicKey();
let bob_key = bob.getPublicKey();

assert(alice.computeSecret(bob_key).toString('hex'), bob.computeSecret(alice_key).toString('hex'))
*/
