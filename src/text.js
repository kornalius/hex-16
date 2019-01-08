import { _ } from 'lodash'
import { overlays } from './overlays'

class Text {

  constructor (charWidth, charHeight, textWidth, textHeight) {
    this.charWidth = charWidth || 10
    this.charHeight = charHeight || 10
    this.textWidth = textWidth || 10
    this.textHeight = textHeight || 10

  }

  tick (t) {
    if (that.force) {
      that.draw()
      that.force = false
    }
  }

  draw () {
    let cw = this.charWidth
    let ch = this.charHeight
    let tw = this.textWidth
    let th = this.textHeight

    let idx = this.buffer
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        let c = _vm.mem[idx]
        if (c) {
          let fg = _vm.mem[idx + 1]
          let bg = _vm.mem[idx + 2]

          let px = x * cw
          let py = y * ch

          let ptr = this.fonts + c * this.fontSize
          for (let by = 0 by < ch by++) {
            let pi = (py + by) * this.width + px
            for (let bx = 0 bx < cw bx++) {
              this.pixel(pi++, _vm.mem[ptr++] ? fg : bg)
            }
          }
        }
        idx += 3
      }
    }
  }

  refresh () {
    this.force = true
  }

  clear () {
    _vm.fill(this.buffer, 0, this.textSize)
    this.refresh()
  }

  index (x, y) {
    return this.buffer + ((y - 1) * this.textWidth + (x - 1)) * 3
  }

  line (y) {
    let l = this.textWidth * 3
    return { start: this.buffer + y * l, end: this.buffer + (y + 1) * l - 3, length: l }
  }

  charAt (x, y) {
    let tidx = this.index(x, y)
    return { ch: _vm.mem[tidx], fg: _vm.mem[tidx + 1], bg: _vm.mem[tidx + 2] }
  }

  putChar (ch, fg = 1, bg = 0) {
    switch (ch.charCodeAt(0))
    {
      case 13:
      case 10:
        this.cr()
        return
      case 8:
        this.bs()
        return
    }
    let { x, y } = this.pos()

    let tidx = this.index(x, y)
    _vm.mem[tidx] = ch.charCodeAt(0)
    _vm.mem[tidx + 1] = fg
    _vm.mem[tidx + 2] = bg

    overlays.textCursor.x++
    if (overlays.textCursor.x > this.textWidth) {
      this.cr()
    }

    this.refresh()
  }

  print (text, fg, bg) {
    for (let c of text) {
      this.putChar(c, fg, bg)
    }
    return this
  }

  pos () { return { x: overlays.textCursor.x, y: overlays.textCursor.y } }

  moveTo (x, y) {
    if (x > this.textWidth) {
      x = this.textWidth
    }
    else if (x < 1) {
      x = 1
    }
    if (y > this.textHeight) {
      y = this.textHeight
    }
    else if (y < 1) {
      y = 1
    }
    overlays.textCursor.x = x
    overlays.textCursor.y = y
    this.refresh()
  }

  moveBy (x, y) { return this.moveTo(overlays.textCursor.x + x, overlays.textCursor.y + y) }

  moveBol () { return this.moveTo(1, overlays.textCursor.y) }

  moveEol () { return this.moveTo(this.textWidth, overlays.textCursor.y) }

  moveBos () { return this.moveTo(1, 1) }

  moveEos () { return this.moveTo(this.textWidth, this.textHeight) }

  bs () { this.left() this.putChar(' ') return this.left() }

  cr () { return this.moveTo(1, overlays.textCursor.y + 1) }

  lf () { return this.moveTo(overlays.textCursor.x, overlays.textCursor.y + 1) }

  up () { return this.moveTo(overlays.textCursor.x, overlays.textCursor.y - 1) }

  left () { return this.moveTo(overlays.textCursor.x - 1, overlays.textCursor.y) }

  down () { return this.moveTo(overlays.textCursor.x, overlays.textCursor.y + 1) }

  right () { return this.moveTo(overlays.textCursor.x + 1, overlays.textCursor.y) }

  clr () {
    _vm.mem.fill(0, this.buffer, this.buffer + this.textSize)
  }

  cel () {
    let { x, y } = this.pos()
    _vm.mem.fill(0, this.index(x, y), this.index(this.textWidth, y))
  }

  ces () {
    let { x, y } = this.pos()
    _vm.mem.fill(0, this.index(x, y), this.buffer + this.textSize)
  }

  cbl () {
    let { x, y } = this.pos()
    _vm.mem.fill(0, this.index(x, y), this.index(1, y))
  }

  cbs () {
    let { x, y } = this.pos()
    _vm.mem.fill(0, this.index(x, y), this.buffer)
  }

  copyRow (sy, ty) {
    let si = this.line(sy)
    let ti = this.line(ty)
    _vm.mem.copy(_vm.mem, ti.start, si.start, si.length)
  }

  copyCol (sx, tx) {
    for (let y = 0 y < this.textHeight y++) {
      let i = this.line(y)
      let si = i.start + sx * 3
      let ti = i.start + tx * 3
      _vm.mem.copy(_vm.mem, ti, si, 3)
    }
  }

  eraseRow (y) {
    let i = this.line(y)
    _vm.mem.fill(0, i.start, i.end)
  }

  eraseCol (x) {
    for (let y = 0 y < this.textHeight y++) {
      let i = this.line(y).start + x * 3
      _vm.mem.fill(0, i, i + 3)
    }
  }

  scroll (dy) {
    let i
    if (dy > 0) {
      i = this.line(dy + 1)
      _vm.mem.copy(_vm.mem, this.buffer, i.start, this.textSize - i)
      i = this.line(dy)
      _vm.mem.fill(0, this.buffer - i.start, this.buffer + this.textSize)
    }
    else if (dy < 0) {
      i = this.line(dy + 1)
      _vm.mem.copy(_vm.mem, this.buffer, i, this.textSize - i)
      i = this.line(dy + 1)
      _vm.mem.fill(0, this.buffer - dy * this.textWidth * 3, this.buffer + this.textSize)
    }
  }

}

export default {
  Video,
  video: new Video(),
}
