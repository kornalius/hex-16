import _ from 'lodash'

class Sounds {

  constructor () {
    this.banks = {}
  }

  find (name) { return this.banks[name] }

  load (name, path, loop = false) {
    banks[name] = new Wad({ source: require('file?name=[path]/[name].[ext]!../banks/' + path), loop })
  }

  play (name, options = {}) {
    let s = this.find(name)
    if (s) {
      s.play(_.defaultsDeep({}, options, { env: { hold: 500 } }))
    }
  }

}

export default {
  Sounds,
  sounds: new Sounds(),
}
