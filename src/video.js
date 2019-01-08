import { _ } from 'lodash'

class Video {

  constructor (width, height, scale, offset) {
    this.width = width || 378
    this.height = height || 264

    this.scale = scale || 3

    this.offset = offset || new PIXI.Point(16, 16)

    this.screenSize = this.width * this.height

    this.paletteCount = 32
    this.paletteSize = this.paletteCount * 4

    this.spriteCount = 16
    this.spriteWidth = 16
    this.spriteHeight = 16
    this.spriteSize = this.spriteWidth * this.spriteHeight
    this.spritesSize = this.spriteCount * this.spriteSize

    this.charCount = 256
    this.charWidth = 7
    this.charHeight = 11
    this.charOffsetX = 0
    this.charOffsetY = 1

    this.textWidth = Math.round(this.width / this.char_width)
    this.textHeight = Math.round(this.height / this.charHeight)
    this.textSize = this.textWidth * this.textHeight * 3

    this.fontSize = this.charWidth * this.charHeight
    this.fontsSize = this.charCount * this.fontSize

    this.lastMouse = new PIXI.Point()

    this.forceUpdate = false
    this.forceFlip = false

    this.forceText = false
    this.forceSprites = false

    this.stage = new PIXI.Container()

    this.renderer = new PIXI.autoDetectRenderer(this.width * this.scale + this.offset.x * 2, this.height * this.scale + this.offset.y * 2, null, { })
    this.renderer.view.style.position = 'absolute'
    this.renderer.view.style.top = '0px'
    this.renderer.view.style.left = '0px'

    this.resize()

    document.body.appendChild(this.renderer.view)

    window.addEventListener('resize', this.resize.bind(this))

    this.setupPalette()

    let that = this
    PIXI.ticker.shared.add(time => {
      let t = performance.now()

      overlays.tick(t)

      if (that.forceUpdate) {
        that.forceUpdate = false

        if (that.forceSprites) {
          that.draw_sprites()
          that.forceSprites = false
        }

        if (that.forceText) {
          that.draw_text()
          that.forceText = false
        }

        if (that.forceFlip) {
          that.flip()
          that.forceFlip = false
        }

        that.renderer.render(that.stage)
      }
    })

    this.clear()

    this.test()

  }

  test () {
    _vm.fill(this.screen, 10, 2000)

    this.pixel(200, 0)
    this.pixel(400, 6)
    this.pixel(500, 8)
    this.pixel(600, 20)

    this.moveTo(1, 1)
    this.putChar('A', 29, 15)

    this.moveTo(10, 11)
    this.print('Welcome to DX32\nÉgalitée!', 2, 6)

    let chars = ''
    for (let i = 33 i < 256 i++) {
      chars += String.fromCharCode(i)
    }
    this.moveTo(1, 2)
    this.print(chars, 1, 0)

    this.moveTo(1, 23)
    this.print('Second to last line', 30, 0)

    this.moveTo(1, 24)
    this.print('012345678901234567890123456789012345678901234567890123', 1, 0)

    this.refreshText()
  }

  resize () {
    // let ratio = Math.min(window.innerWidth / this.width, window.innerHeight / this.height)
    // this.stage.scale.x = this.stage.scale.y = ratio
    // this.renderer.resize(Math.ceil(this.width * ratio), Math.ceil(this.height * ratio))
    this.renderer.view.style.left = window.innerWidth * 0.5 - this.renderer.width * 0.5 + 'px'
    this.renderer.view.style.top = window.innerHeight * 0.5 - this.renderer.height * 0.5 + 'px'
    this.refresh()
  }

  flip () {
    let screen = this.screen
    let data = screen.context.getImageData(0, 0, screen.width, screen.height)
    let pixels = data.data

    let sn = this.screen + this.screenSize
    for (let si = this.screen, pi = 0; si < sn; si++, pi += 4) {
      this.RGBAToMem(pixels, pi, _vm.mem.readUInt32LE(this.palette + _vm.mem[si] * 4))
    }

    screen.context.putImageData(data, 0, 0)
  }

  refresh (flip = true) {
    this.forceUpdate = true
    this.forceFlip = flip
  }

  refreshSprites (flip = true) {
    this.forceUpdate = true
    this.forceFlip = flip
    this.forceSprites = true
  }

  clear () {
    _vm.fill(this.screen, 0, this.screenSize)
    this.refresh()
  }

  pixelToIndex (x, y) { return y * this.width + x }

  indexToPixel (i) {
    let y = Math.trunc(i / this.width)
    let x = i - y
    return { x, y }
  }

  splitRGBA (rgba) { return { r: rgba >> 24 & 0xFF, g: rgba >> 16 & 0xFF, b: rgba >> 8 & 0xFF, a: rgba >> 0xFF } }

  red (rgba) { return rgba >> 24 & 0xFF }

  green (rgba) { return rgba >> 16 & 0xFF }

  blue (rgba) { return rgba >> 8 & 0xFF }

  alpha (rgba) { return rgba >> 0xFF }

  RGBAToNum (r, g, b, a) { return r << 24 | g << 16 | b << 8 | a }

  RGBAToMem (mem, i, r, g, b, a) {
    if (r && !g) {
      g = r >> 16 & 0xFF
      b = r >> 8 & 0xFF
      a = r & 0xFF
      r = r >> 24 & 0xFF
    }
    mem[i] = r
    mem[i + 1] = g
    mem[i + 2] = b
    mem[i + 3] = a
  }

  pixel (i, c) {
    let pi = this.screen + i
    if (c !== undefined && _vm.mem[pi] !== c) {
      _vm.mem[pi] = c
    }
    return _vm.mem[pi]
  }

  scroll (x, y) {
    _vm.mem.copy(_vm.mem, this.screen, this.screen + y * this.width, (this.height - y) * this.width)
    this.refresh()
  }

  _spr_find (id) {
    for (let s of this._sprites) {
      if (s.id === id) {
        return s
      }
    }
    return null
  }

  spr_add (id, sprite, x, y, z) {
    this._sprites.push({ id, sprite, x, y, z, index: this._sprite.length })
  }

  spr_del (id) {
    let s = this._spr_find(id)
    if (s) {
      this._sprites.splice(s.index, 1)
    }
  }

  spr_move (id, x, y, z) {
    let s = this._spr_find(id)
    if (s) {
      s.x = x
      s.y = y
      if (z) {
        s.z = z
      }
      this.refresh()
    }
  }

  spr_move_by (id, x, y) {
    let s = this._spr_find(id)
    if (s) {
      s.x = x
      s.y = y
      this.refresh()
    }
  }

  draw_sprites () {
    let sw = this.sprite_width
    let sh = this.sprite_height
    let sl = this.sprites
    let ss = this.sprite_size

    for (let s of _.sortBy(this._sprites, 'z')) {
      let ptr = sl + s.sprite * ss
      for (let by = 0 by < sh by++) {
        let pi = (s.y + by) * this.width + s.x
        for (let bx = 0 bx < sw bx++) {
          this.pixel(pi++, _vm.mem[ptr++])
        }
      }
    }
  }

}

export default {
  Video,
  video: new Video(),
}
