import WarpSpeed from "./warpspeed"

let warpspeed
let lastTime = null

const tick = time => {
  warpspeed.draw(lastTime === null ? 1 : time - lastTime)
  lastTime = time
  requestAnimationFrame(tick)
}

onmessage = ({ data: { canvas, config } }) => {
  if (canvas !== undefined) {
    lastTime = null
    warpspeed = new WarpSpeed(canvas)
  }

  if (config !== undefined) {
    warpspeed.update(config)
    if (lastTime === null) {
      requestAnimationFrame(tick)
    }
  }
}
