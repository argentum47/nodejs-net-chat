const remote = require('electron').remote
const emitter = remote.require('./events')
const main = remote.require('./main')
const index = remote.require('./index')

const selectors = {
  userList: '.container__wrapper-content__user-list',
  userListTemplate: '#user-list-template',
  conversationTemplate: '#conversation-template',
  conversationOwner: '.conversation-text__owner',
  conversationContent: '.conversation-text__content',
  userInfo: '.user-info',
  topic: '#chat-topic',
  chatWrapper: '.container__wrapper-content__chat-wrapper__chat-box',
  inputBox: '#container__wrapper-content__input',
  submitButton: '#container__wrapper-content__submit',
  userName: '#name',
  changeName: '#change-name',
  changeNameForm: 'form.change-name-form',
  proceed: 'proceed'
}

let rx = /<([^/>]+)\/?>$/,
    nick, 
    to;


/* dom helpers*/
function $(sel) {
  if(!sel) return;

  let d = sel.match(rx)

  if(d) return document.createElement(d[1])
  return document.querySelector(sel)
}

function $$(sel) {
  return document.querySelectorAll(sel)
}


/* route helpers */
function routeChange(hash) {

  Array.from($$('.pages')).forEach(p => {
    if(p.classList.contains('show')) p.classList.remove('show')
  })

  $(`.pages${hash}`).classList.add('show')
}

window.onhashchange = function() {
  routeChange(window.location.hash ? window.location.hash : '#user-name')
}


/* stuff */
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

  console.log(Object.keys(data));

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
    to = li.dataset.id
    $(selectors.topic).textContent = setChatTopic(nick, li.dataset.id)
  }
})

$(selectors.submitButton).addEventListener('click', () => {
  let value = $(selectors.inputBox).value;

  if(!(value && to && nick)) return
  
  main.sendMessage(nick, to, value)
  let el = createNewConversation($(selectors.conversationTemplate).content, nick, value)
  console.log(el)
  $(selectors.chatWrapper).appendChild(el)
})

window.onload = function() {
  index.getUser().then(name => {
    $(selectors.userName).textContent = name
    nick = name
  })
}

$(selectors.changeNameForm).addEventListener('submit', (e) => {
  e.preventDefault()
  let value = $(selectors.changeName).value

  if(value) {
    index.getUser(value).then(name => {
      nick = name
      routeChange('#chat-window')
    })
  }
})

function initiateConnections() {
  
}
