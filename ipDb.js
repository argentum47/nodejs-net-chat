const InMemory = require('./peersDb')

let db = new InMemory('ips')

db.addFields(['ip', 'nick']);
db.setIndex('ip')

module.exports = db
