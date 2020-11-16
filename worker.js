import WarpSpeed from "./warpspeed"

let warpspeed
let lastTime
let paused

const tick = time => {
  if (paused) return
  warpspeed.draw(lastTime === null ? 1 : time - lastTime)
  lastTime = time
  requestAnimationFrame(tick)
}

onmessage = ({ data: { canvas, config, pause } }) => {
  if (canvas !== undefined) {
    warpspeed = new WarpSpeed(canvas)
  }

  if (config !== undefined) {
    warpspeed.update(config)
  }

  if (pause !== undefined) {
    paused = pause
    if (!paused) {
      lastTime = null
      requestAnimationFrame(tick)
    }
  }
}
