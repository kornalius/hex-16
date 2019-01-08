
const _STOPPED = 0
const _RUNNING = 1
const _PAUSED = 2

class Interrupts {

  constructor () {
    this.list = {}
  }

  find (name) { return this.list[name] }

  create (name, fn, ms = 500) {
    if (!this.find(name)) {
      this.list[name] = { name, status: _RUNNING, ms, fn, last: 0 }
    }
  }

  resume (name) {
    if (this.find(name)) {
      this.list[name].status = _RUNNING
      this.list[name].last = performance.now()
    }
  }

  pause (name) {
    if (this.find(name)) {
      this.list[name].status = _PAUSED
    }
  }

  stop (name) {
    if (this.find(name)) {
      delete this.list[name]
    }
    else {
      for (let k in this.list) {
        this.stop_int(k)
      }
      this.list = {}
    }
  }

  process () {
    let t = performance.now()
    for (let k in this.list) {
      let i = this.list[k]
      if (i.status === _RUNNING) {
        let delay = t - i.last
        if (delay >= i.ms) {
          i.fn.apply(this, [delay - i.ms])
          i.last = t
        }
      }
    }
  }

}

export default {
  Interrupts,
  interrupts: new Interrupts(),
}
