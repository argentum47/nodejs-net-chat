const InMemory = require('./peersDb')

let db = new InMemory('ips')

db.addFields(['ip', 'nick', 'color'])
db.setIndex('ip')

// add extra functionalities

db.nicks = function() {
  return db.all().map(k => k.value.nick)
}

module.exports = db
