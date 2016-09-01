const remote      = require('electron').remote
const jsesc       = require('jsesc')
const ipcRenderer = require('electron').ipcRenderer
const ips         = remote.require('./utils').ips
const main        = remote.require('./main')
const index       = remote.require('./index')

let isOwner = (ip) => ips().includes(ip)

ipcRenderer.on('update-nicks', (sender, data) => {
  let frag = document.createDocumentFragment()
  nick = Object.keys(data).filter(k => isOwner(data[k].ip))[0]

  //console.log(data);

  Object.keys(data).filter(k => !isOwner(data[k].ip)).forEach(name => {
    frag.appendChild(renderUser($(selectors.userListTemplate).content, name))
  })

  $(selectors.userList).innerHTML = ''
  $(selectors.userList).appendChild(frag)
})

ipcRenderer.on('update-messages', (sender, data) => {
  if(to !== data.from) {
    to = data.from
    $(selectors.topic).textContent = setChatTopic(nick, to)
  }

  let el = createNewConversation($(selectors.conversationTemplate).content, data.from, jsesc(JSON.parse(data.text)))
  $(selectors.chatWrapper).appendChild(el)
})

$(selectors.userList).addEventListener('click', (e) => {
  let li;

  if(e.target.tagName == "A") li = e.target.closest('li')
  else if(e.target.tagName == "LI") li = e.target
      
  to = li.dataset.id
  
  if(li) {
    main.initiateExchange(nick, to, () => {
      $(selectors.topic).textContent = setChatTopic(nick, to)
    })
  }
})

$(selectors.submitButton).addEventListener('click', () => {
  let value = $(selectors.inputBox).value;
  
  if(!(value && to && nick)) return
  
  main.sendMessage(nick, to, jsesc(value))

  let el = createNewConversation($(selectors.conversationTemplate).content, nick, jsesc(value))
  $(selectors.chatWrapper).appendChild(el)
  $(selectors.inputBox).value = ''
})

window.onload = function() {
  index.getUser().then(name => {
    nick = jsesc(name)
    $(selectors.userName).textContent = nick
  }).then(() => {
    return Promise.all([main.userServer(), main.broadCastServer(nick)])
  })
}

$(selectors.changeNameForm).addEventListener('submit', (e) => {
  e.preventDefault()
  let value = $(selectors.changeName).value

  if(value) {
    index.getUser(value).then(name => {
      main.updateNick(nick, name)
      nick = jsesc(name)
    }).then(() => {
      routeChange('#chat-window')
    })
  }
})

