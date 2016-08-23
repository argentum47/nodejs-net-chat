const InMemory = require('./peersDb')

let db = new InMemory('ips')

db.addFields(['ip', 'nick', 'color'])
db.setIndex('ip')

module.exports = db
