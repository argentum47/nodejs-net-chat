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

