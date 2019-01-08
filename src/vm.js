const _STOPPED = 0;
const _RUNNING = 1;
const _PAUSED = 2;

class VM {

  constructor () {
    this.status = 0

    let that = this
    PIXI.ticker.shared.add((time) => {
      if (that.status === _RUNNING) {
        that.tick(time)
      }
    })

    this.start()
  }

  start () { this.status = _RUNNING }

  stop () { this.status = _STOPPED }

  pause () { this.status = _PAUSED }

  resume () { this.status = _RUNNING }

  tick (time) {
  }

}

export default {
  VM,
  vm: new VM(),
}
