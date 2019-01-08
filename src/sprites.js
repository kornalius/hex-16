
class Sprites {

  constructor () {
    this.sheets = {}
  }

  find (name) { return this.sheets[name] }

  load (name, path) {
    // sheets[name] = new Wad({ source: require('file?name=[path]/[name].[ext]!../sheets/' + path), loop })
  }

}

export default {
  Sprites,
  sprites: new Sprites(),
}
