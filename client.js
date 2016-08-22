const net = require('net')

module.exports = function(PORT, ip) {
  return new Promise((resolve) => {
    let client = net.createConnection({port: PORT, address: ip}, () => {
      resolve(client)
    })
  })
}

