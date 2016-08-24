const color = require('ansi-color').set

exports.make = function(str) {
  return intToRGB(Math.abs(hashCode(str)))
}

exports.paint = function(text, hex) {
  let R, G, B;
  let { r, g, b } = splitHexToRGB(hex)

  if(r && g && b ) {
    R = calculate(r),  G = calculate(g), B = calculate(b);
    let max = Math.max(R, G, B)

    if(max == R) return color(text, 'red')
    if(max == G) return color(text, 'green')
    if(max == B) return color(text, 'cyan')
  }
  return color(text, 'white')
}

exports.hashCode = hashCode

function hashCode(str) {
  let hash = 0;

  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 17) - hash);
    hash |= 0
  }

  return hash;
}

function splitHexToRGB(hex) {
  if(hex.length == 7) {
    let [r, g, b] = hex.slice(1).match(/.{1,2}/g)
    return { r, g, b }
   } else if(hex.length == 3) {
    let [r, g, b] = hex.slice(1).split('')
    r += r, g+= g, b+= b;
    return { r, g, b }
   }

  return { r: 0, g: 0, b: 0}
}

function calculate(cp) {
  let [c, p] = cp.split('')

  return (parseInt(c, 16) * 16) + parseInt(p, 16)
}

function intToRGB(i){
  let c = i.toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
}
