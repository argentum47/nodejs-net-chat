const BSTree = require('./bst');

module.exports = function InMemory(name, _fields) {
  this.dbName = name
  this.fields = _fields || []
  this.bst = new BSTree()
  this.indexKey = '_id'
  this.lastId = 0

  this.addFields = addFields
  this.setIndex = setIndex
  this.add = add
  this.find = find
  this.all = all
  this.remove = remove
}

function addFields(_fields) {
  if(Array.isArray(_fields)) this.fields = this.fields.concat(_fields)
  else if(typeof _fields == 'string') this.fields.push(_fields)
  else if(typeof _fields == 'object') Object.keys(_fields).forEach(k => { if(_fields[k]) this.fields.push(k) })
}

function setIndex(key) {
  this.indexKey = key
  return this
}

function add(data) {
  let { fields, indexKey } = this
  let result = {}

  if(fields.length) {
    result = fields.reduce((acc, k) => {
      if(data[k]) acc[k] = data[k]
      return acc
    }, {});
  } else result = Object.assign({}, data)

  this.lastId = this.lastId + 1
  result._id = this.lastId
  this.bst.insert(result[indexKey], result)

  return result
}

function find(_id) {
  let node = this.bst.find(_id)
  return node ? node.value : null
}

function all() {
  return this.bst.inOrder()
}

function remove(_id) {
  this.bst.remove(_id)
  return this
}

