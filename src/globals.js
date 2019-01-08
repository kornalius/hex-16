import _ from 'lodash'

export default {

  mixin: (proto, ...mixins) => {
    mixins.forEach(mixin => {
      Object.getOwnPropertyNames(mixin).forEach(key => {
        if (key !== 'constructor') {
          let descriptor = Object.getOwnPropertyDescriptor(mixin, key)
          Object.defineProperty(proto, key, descriptor)
        }
      })
    })
  },

  rnd: (min, max) => {
    return Math.trunc(Math.random() * (max - min) + min)
  },

  delay: (ms) => {
    var t = performance.now()
    while (performance.now() - t <= ms) {
      PIXI.ticker.shared.update()
    }
  },

  bufferToString: (b) => {
    var len = b.length
    var i = 0
    var s = ''
    while (i < len) {
      s += b[i++].toString(16)
    }
    return s
  },

  stringToBuffer: (str) => {
    var len = str.length
    var i = 0
    var b = new Buffer(Math.trunc(str.length / 2))
    var x = 0
    while (i < len) {
      var hex = str.substr(i, 2)
      b[x++] = parseInt(hex, 16)
      i += 2
    }
    return b
  },

}
