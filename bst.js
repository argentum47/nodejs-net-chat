// btree to keep track of records
//
function Node(key, value, left, right) {
  this.key = key
  this.value = value
  this.left = null
  this.right = null
  this.show = () => this.value
}

module.exports = function BSTree() {
  this.root = null
  this.insert = insert
  this.find = find
  this.remove = remove
  this.inOrder = inOrder
}

function insert(key, value) {
  let n = new Node(key, value, null, null)

  if(this.root == null) {
    this.root = n
  } else {
    let current = this.root;
    let parent;

    while(true) {
      parent = current

      if(key < current.key) {
        current = current.left

        if(current == null) {
          parent.left = n
          break;
        }
      } else {
        current = current.right

        if(current == null) {
          parent.right = n
          break;
        }
      }
    }
  }
}

function remove(_id) {
  let node = this.node(_id)

  // this is horrible
  if(node) node.value = null
}

function find(data) {
  let current = this.root

  while(current.key != data) {
    if(current.key < data) current = current.right
    else current = current.left

    if(current == null) return null
  }

  return current
}

function inOrder() {
  let data = [];

  (function traverse(node) {
    if(node) {
      traverse(node.left)
      data = data.concat(node.show())
      traverse(node.right)
    }
  })(this.root)

  return data  
}

