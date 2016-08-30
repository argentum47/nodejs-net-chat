const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
const emitter = remote.require('./events')
const main = remote.require('./main')
const index = remote.require('./index')

ipcRenderer.on('stuff', () => {
  console.log('here')
})

ipcRenderer.on('update-nicks', (data) => {
  let frag = document.createDocumentFragment()
  nick = Object.keys(data).filter(k => data[k].owner)[0]

  console.log(Object.keys(data));

  Object.keys(data).filter(k => !data[k].owner).forEach(name => {
    frag.appendChild(renderUser($(selectors.userListTemplate).content, name))
  })

  $(selectors.userList).innerHTML = ''
  $(selectors.userList).appendChild(frag)
})

ipcRenderer.on('update-messages', (data) => {
  let li;

  if(e.target.tagName == 'A') li = e.target.closest('li')
  else if(e.target.tagName == 'LI') li = e.target

  if(li) {
    to = li.dataset.id
    $(selectors.topic).textContent = setChatTopic(nick, li.dataset.id)
  }
})

$(selectors.userList).addEventListener('click', (e) => {
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
