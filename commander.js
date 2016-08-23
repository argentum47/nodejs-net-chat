let Commander = (function(){
  let dispatchTable = {};

  function register(command, helpText, action) {
    dispatchTable[command] = { name: command, text: helpText, action: action }
  }

  function execute(command, value) {
    if(dispatchTable[command]) {
      return dispatchTable[command].action(value)
    } else {
      return "!!rtfm"
    }
  }

  function generateDocs() {
    return Object.keys(dispatchTable).reduce((acc, v) => {
      let text = dispatchTable[v].text || "meh"

      acc += `-${dispatchTable[v].name} ${text}` + "\n"
      return acc
    }, "Command guide for Bot, All bot commands start with a !!\n")
  }

  // exposed for API only
  return {
    register: register,
    execute: execute,
    guide: generateDocs
  }
})()


module.exports = Commander

