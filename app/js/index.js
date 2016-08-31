const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
const ips = remote.require('./utils').ips
const main = remote.require('./main')
const index = remote.require('./index')

let isOwner = (ip) => ips().includes(ip)

ipcRenderer.on('stuff', () => {
  console.log('here')
})

ipcRenderer.on('update-nicks', (sender, data) => {
  let frag = document.createDocumentFragment()
  nick = Object.keys(data).filter(k => isOwner(data[k].ip))[0]

  console.log(data);
  Object.keys(data).forEach(k => {
    console.log(data[k].ip, ips(), isOwner(data[k].ip))
  });

  Object.keys(data).filter(k => !isOwner(data[k].ip)).forEach(name => {
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
  let li;

  if(e.target.tagName == "A") li = e.target.closest('li')
  else if(e.target.tagName == "LI") li = e.target

  if(li) {
    to = li.dataset.id
    $(selectors.topic).textContent = setChatTopic(nick, to)
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
  }).then(() => {
    return Promise.all([main.userServer(), main.broadCastServer(nick)])
  })
}

$(selectors.changeNameForm).addEventListener('submit', (e) => {
  e.preventDefault()
  let value = $(selectors.changeName).value

  if(value) {
    index.getUser(value).then(name => {
      nick = name
    }).then(() => {
      return Promise.all([main.userServer(), main.broadCastServer(nick)])
    }).then(() => {
      routeChange('#chat-window')
    })
  }
})
