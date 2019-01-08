import { _ } from 'lodash'
import { video } from './video.js'

class Overlay {

  constructor (width, height, scale) {
    this.width = width
    this.height = height
    this.scale = scale || 1.0
    this.last = 0
  }

  create () {
    this.canvas = new PIXI.CanvasBuffer(this.width, this.height)

    this.tex = PIXI.Texture.fromCanvas(this.canvas.canvas, PIXI.SCALE_MODES.NEAREST)
    this.tex.scaleMode = PIXI.SCALE_MODES.NEAREST

    this.sprite = new PIXI.Sprite(this.tex)
    this.sprite.scale.x = this.sprite.scale.y = this.scale

    this.context = this.canvas.canvas.getContext('2d', { alpha: true, antialias: false })
  }

  tick (t) {
  }

  update () {
    video.forceUpdate = true
  }

}

class Screen extends Overlay {

  constructor (width, height, scale) {
    super(width, height, scale)

    this.create()

    this.sprite.x = video.offset.x
    this.sprite.y = video.offset.y
  }

}

class Scanlines extends Overlay {

  constructor (width, height, scale, gap, alpha) {
    super(width, height, scale)

    this.gap = gap || 3
    this.alpha = alpha || 0.35

    this.create()

    let data = this.context.getImageData(0, 0, this.width, this.height)
    let pixels = data.data
    let sz = this.width * 4
    for (let y = 0; y < this.height; y += this.gap) {
      let idx = y * sz
      for (let i = idx; i < idx + sz; i += 4) {
        pixels[i] = 0
        pixels[i + 1] = 0
        pixels[i + 2] = 0
        pixels[i + 3] = 255 * this.alpha
      }
    }
    this.context.putImageData(data, 0, 0)
  }

}

class Scanline extends Overlay {

  constructor (width, height, scale, refresh, alpha, speed) {
    super(width, height, scale)

    this.refresh = refresh || 50
    this.speed = speed || 16
    this.alpha = alpha || 0.1

    this.create()

    let data = scanline.context.getImageData(0, 0, this.width, this.height)
    let pixels = data.data
    let sz = this.width * 4
    let l = 0
    let h = this.height
    let a = this.alpha * 255
    for (let y = 0; y < this.height * sz; y += sz) {
      for (let i = y; i < y + sz; i += 4) {
        pixels[i] = 25
        pixels[i + 1] = 25
        pixels[i + 2] = 25
        pixels[i + 3] = l / h * a
      }
      l++
    }
    this.context.putImageData(data, 0, 0)

    this.sprite.y = -this.sprite.height
  }

  tick (t) {
    if (t - this.last >= this.refresh) {
      this.sprite.y += this.speed
      if (this.sprite.y > this.height) {
        this.sprite.y = -this.sprite.height
      }
      this.last = t

      this.update()
    }
  }

}

class Noises extends Overlay {

  constructor (width, height, scale, refresh, count, rate, red, green, blue, alpha) {
    super(width, height, scale)

    this.refresh = refresh || 250
    this.count = count || 8
    this.rate = rate || 0.85
    this.red = red || 100
    this.green = green || 100
    this.blue = blue || 100
    this.alpha = alpha || 0.15

    this.noises = {}

    this.create()

    let a = this.alpha * 255
    for (let c = 0; c < this.count; c++) {
      let noise = this.create(this.width, this.height, this.scale)
      noise.visible = c === 0

      let data = noise.context.getImageData(0, 0, this.width, this.height)
      let pixels = data.data
      let len = pixels.length
      let r = this.red
      let g = this.green
      let b = this.blue
      for (let i = 0; i < len; i += 4) {
        if (Math.random() >= rate) {
          pixels[i] = Math.trunc(Math.random() * r)
          pixels[i + 1] = Math.trunc(Math.random() * g)
          pixels[i + 2] = Math.trunc(Math.random() * b)
          pixels[i + 3] = a
        }
      }
      noise.context.putImageData(data, 0, 0)
      this.noises[c] = noise
    }

    this.noiseKeys = _.keys(this.noises)
  }

  tick (t) {
    if (t - this.last >= this.refresh) {
      let noise = this.noiseKeys[Math.trunc(Math.random() * this.noiseKeys.length)]
      for (let k in this.noises) {
        this.noises[k].sprite.visible = false
      }
      this.noises[noise].sprite.visible = true
      this.last = t

      this.update()
    }
  }

}

class Rgb extends Overlay {

  constructor (width, height, scale, alpha) {
    super(width, height, scale)

    this.alpha = alpha || 0.075

    this.create()

    let data = this.context.getImageData(0, 0, this.width, this.height)
    let pixels = data.data
    let len = pixels.length
    for (let i = 0; i < len; i += 16) {
      pixels[i] = 100
      pixels[i + 1] = 100
      pixels[i + 2] = 100
      pixels[i + 3] = 255 * this.alpha
    }
    this.context.putImageData(data, 0, 0)
  }

}

class Crt extends Overlay {

  constructor (url, width, height, radius, inside_alpha, outside_alpha) {
    super(width, height, scale)

    this.radius = radius || 0.25
    this.inside_alpha = inside_alpha || 0.2
    this.outside_alpha = outside_alpha || 0.15

    this.create()

    this.context.globalCompositeOperation = 'darker'
    let gradient = this.context.createRadialGradient(this.width / 2, this.height / 2, this.height / 2, this.width / 2, this.height / 2, this.height / this.radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, ' + inside_alpha + ')')
    gradient.addColorStop(1, 'rgba(0, 0, 0, ' + outside_alpha + ')')
    this.context.fillStyle = gradient
    this.context.fillRect(0, 0, this.width, this.height)
    this.context.globalCompositeOperation = 'source-over'

    let tex = PIXI.Texture.fromImage(url)
    this.monitor = new PIXI.Sprite(tex)
    this.monitor.width = this.width
    this.monitor.height = this.height
  }

}

class TextCursor extends Overlay {

  constructor (width, height, scale, refresh, offset) {
    super(width, height, scale)

    this.refresh = refresh || 500
    this.offset = offset || { x: 0, y: 0 }

    this.create()
  }

  tick (t) {
    if (t - this.last >= this.refresh) {
      this.sprite.visible = !this.sprite.visible
      this.last = t

      this.update()
    }
  }

  update () {
    this.sprite.x = (this.x - 1) * this.sprite.width + this.offset.x
    this.sprite.y = (this.y - 1) * this.sprite.height + this.offset.y
    super.update()
  }

}

class MouseCursor extends Overlay {

  constructor (width, height, scale, refresh) {
    super(width, height, scale)

    this.refresh = refresh || 50

    this.create()
  }

  tick (t) {
    if (t - this.last >= this.refresh) {
      this.sprite.x = 0
      this.sprite.y = 0
      this.last = t

      this.update()
    }
  }

}

class Overlays {

  constructor () {
    let width = video.renderer.width
    let height = video.renderer.height
    let scale = video.renderer.scale

    this.screen = new Screen(width, height, scale)
    this.stage.addChild(this.screen.sprite)

    this.scanlines = new Scanlines(width, height, scale)
    this.stage.addChild(this.scanlines.sprite)

    this.scanline = new Scanline(width, height, scale)
    this.stage.addChild(this.scanline.sprite)

    this.rgb = new Rgb(width, height, scale)
    this.stage.addChild(this.rgb.sprite)

    this.noises = new Noises(width, height, scale)
    this.stage.addChild(this.noises.sprite)

    this.crt = new Crt(width, height, scale)
    this.stage.addChild(this.crt.sprite)
    this.stage.addChild(this.crt.monitor)

    this.textCursor = new TextCursor(video.charWidth * scale, video.charHeight * scale, scale)
    this.stage.addChild(this.textCursor.sprite)

    this.mouseCursor = new MouseCursor(video.spriteWidth * scale, video.spriteHeight * scale, scale)
    this.stage.addChild(this.mouseCursor.sprite)
  }

  tick (t) {
    this.screen.tick(t)
    this.scanlines.tick(t)
    this.scanline.tick(t)
    this.rgb.tick(t)
    this.noises.tick(t)
    this.crt.tick(t)
    this.textCursor.tick(t)
    this.mouseCursor.tick(t)
  }

}

export default {
  Overlays,
  overlays: new Overlays(),
}
