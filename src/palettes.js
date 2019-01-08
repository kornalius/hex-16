
class Palettes {

  constructor (count) {
    this.colors = []
    this.count = count || 32

    this.paletteRGBA(0, 0x000000ff)
    this.paletteRGBA(1, 0xffffffff)
    this.paletteRGBA(2, 0x120723ff)
    this.paletteRGBA(3, 0x080e41ff)
    this.paletteRGBA(4, 0x12237aff)
    this.paletteRGBA(5, 0x4927a1ff)
    this.paletteRGBA(6, 0x7f65d0ff)
    this.paletteRGBA(7, 0x60c8d0ff)
    this.paletteRGBA(8, 0xaad7dfff)
    this.paletteRGBA(9, 0x331a36ff)
    this.paletteRGBA(10, 0x993dadff)
    this.paletteRGBA(11, 0xdf8085ff)
    this.paletteRGBA(12, 0xf2d5e8ff)
    this.paletteRGBA(13, 0x152418ff)
    this.paletteRGBA(14, 0x12451aff)
    this.paletteRGBA(15, 0x50bf50ff)
    this.paletteRGBA(16, 0x8fea88ff)
    this.paletteRGBA(17, 0xf2efdeff)
    this.paletteRGBA(18, 0x28130dff)
    this.paletteRGBA(19, 0x5f1500ff)
    this.paletteRGBA(20, 0x3f2a00ff)
    this.paletteRGBA(21, 0x5e4800ff)
    this.paletteRGBA(22, 0x91382dff)
    this.paletteRGBA(23, 0x9c6526ff)
    this.paletteRGBA(24, 0xbfd367ff)
    this.paletteRGBA(25, 0xe2d38eff)
    this.paletteRGBA(26, 0x211f35ff)
    this.paletteRGBA(27, 0x36324bff)
    this.paletteRGBA(28, 0x5a5871ff)
    this.paletteRGBA(29, 0x877f97ff)
    this.paletteRGBA(30, 0xc1aebdff)
    this.paletteRGBA(31, 0xe3d1d6ff)
  }

  paletteRGBA (c, r, g, b, a) {
    let pi = this.colors + c * 4
    if (r) {
      if (r && g && b) {
        this.RGBAToMem(_vm.mem, pi, r, g, b, a)
      }
      else {
        _vm.mem.writeUInt32LE(r, pi)
      }
    }
    return _vm.mem.readUInt32LE(pi)
  }

  RGBAToPalette (r, g, b, a) {
    let rgba = this.RGBAToNum(r, g, b, a)
    for (let c = 0 c < this.count c++) {
      if (this.paletteRGBA(c) === rgba) {
        return c
      }
    }
    return -1
  }

}

export default {
  Palettes,
  palettes: new Palettes(),
}
