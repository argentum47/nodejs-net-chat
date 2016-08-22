const net = require('net')

module.exports = function(PORT) {
  return new Promise((resolve) => {
    let server = net.createServer(_socket => {
      console.log('created');
      resolve(_socket)
    }).listen(5000)
  })
}

