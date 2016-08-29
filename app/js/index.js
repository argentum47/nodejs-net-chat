const remote = require('electron').remote
const emitter = remote.require('./events')

const selectors = {
  userList: '.container__wrapper-content__user-list',
  userListTemplate: '#user-list-template',
  conversationOwner: '.conversation-text__owner',
  conversationContent: '.content-text__content',
  userInfo: '.user-info',
  topic: '#chat-topic'
}

let rx = /<([^/>]+)\/?>$/
let nick

function $(sel) {
  if(!sel) return;

  let d = sel.match(rx)

  if(d) return document.createElement(d[1])
  return document.querySelector(sel)
}

function $$(sel) {
  return document.querySelectorAll(sel)
}

function createNewConversation(el, owner, content) {
  let ownerEl = el.querySelector(selectors.conversationOwner)
  let contentEl = el.querySelector(selectors.conversationContent)

  ownerEl.textContent = owner
  contentEl.textContent = content

  return document.importNode(el, true)
}

function setChatTopic( user_1, user_2) {
  return `${user_1} - ${user_2}`
}

function renderUser(el, user_name) {
  el.querySelector('li').dataset.id = user_name
  el.querySelector(selectors.userInfo).textContent = user_name

  return document.importNode(el, true)
}

emitter.on('user::added', function(data) {
  let frag = document.createDocumentFragment()
  nick = Object.keys(data).filter(k => data[k].owner)[0]

  Object.keys(data).filter(k => !data[k].owner).forEach(name => {
    frag.appendChild(renderUser($(selectors.userListTemplate).content, name))
  })

  $(selectors.userList).innerHTML = ''
  $(selectors.userList).appendChild(frag)
})

$(selectors.userList).addEventListener('click', (e) => {
  let li;

  if(e.target.tagName == 'A') li = e.target.closest('li')
  else if(e.target.tagName == 'LI') li = e.target

  if(li) {
    $(selectors.topic).textContent = setChatTopic(nick, li.dataset.id)
  }
})
