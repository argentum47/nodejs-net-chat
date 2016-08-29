const os     = require('os')
const fs     = require('fs')
const crypto = require('crypto')
const rcfile = '.userrc'

module.exports = {
  wrap: function(fn) {
    let ctx = this;
    return function() {
      let args = Array.from(arguments)

      return new Promise((resolve, reject) => {
        fn.apply(ctx, args.concat((err, result) => {
          if(err) reject(err)
          else resolve(result)
        }))
      })
    }
  },

  hashCode: function(data) {
    if(!data) return 0
    if(typeof data !== 'string') data = data.toString()

    let hash = 0
    for(let i =  0, len = data.length; i < len; i++) {
      hash = data.charCodeAt(i) + ((hash << 17) - hash)
      hash |= 0
    }

    return hash
  },

  ips: function() {
    let interfaces = os.networkInterfaces()

    return Object.keys(interfaces).reduce((acc, k) => {
      return acc.concat(interfaces[k].filter(i => i.family == 'IPv4' && !i.internal).map(i => i.address))
    }, [])
  },

  getUserName: function (name) {
    let ip = this.ips()[0]
    let [readFileAsync, writeFileAsync]  = [this.wrap(fs.readFile), this.wrap(fs.writeFile)]

    return readFileAsync(rcfile).then(data => {
      return data.toString('utf8')
    }).catch(()=> {
      let nick = `user_${Math.abs(this.hashCode(ip))}`
      writeFileAsync(rcfile, JSON.stringify(nick));
      return JSON.stringify(nick)
    })
  },

  encrypt: function (value, rule) {
    rule = rule || 'sha1'
    return crypto.createHash(rule).update(value).digest()
  }
}
