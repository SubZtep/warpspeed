class Star {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
    this.size = 0.5 + Math.random()
  }
}


class WarpSpeed {
  SPEED = 0.7
  TARGET_SPEED = this.SPEED
  SPEED_ADJ_FACTOR = 0.03 // min: 0, max: 1
  DENSITY = 0.7 // min: >0
  USE_CIRCLES = true
  DEPTH_ALPHA = true
  WARP_EFFECT = true
  WARP_EFFECT_LENGTH = 5 // min: 0
  STAR_SCALE = 3 // min: >0
  BACKGROUND_COLOR = "hsl(263,45%,7%)"
  STAR_COLOR = "#FFFFFF"

  _targetId
  _STAR_R = 255
  _STAR_G = 255
  _STAR_B = 255
  _prevW = -1
  _prevH = -1 //width and height will be set at first draw call
  _stars = []
  _lastMoveTS
  _drawRequest = null
  _LAST_RENDER_T = 0
  _PAUSED = false

  constructor(canvas, config) {
    this.canvas = canvas
    // canvas.width = 1
    // canvas.height = 1
    // const ctx = canvas.getContext("2d")
    // ctx.fillStyle = this.BACKGROUND_COLOR
    // ctx.fillRect(0, 0, 1, 1)
    // ctx.fillStyle = this.STAR_COLOR
    // ctx.fillRect(0, 0, 1, 1)
    // const color = ctx.getImageData(0, 0, 1, 1).data
    // this._STAR_R = color[0]
    // this._STAR_G = color[1]
    // this._STAR_B = color[2]
    for (let i = 0; i < this.DENSITY * 1000; i++) {
      this._stars.push(new Star((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, 1000 * Math.random()))
    }
    this._lastMoveTS = Date.now()
    this.draw()
  }

  draw() {
    const TIME = Date.now()
    this.move()
    const canvas = this.canvas

    const width = 512 //this.data.resolution
    const height = 512 //this.data.resolution

    if (!this.PAUSED) {
      // if (this._prevW != canvas.clientWidth || this._prevH != canvas.clientHeight) {
      //   canvas.width = (canvas.clientWidth < 10 ? 10 : canvas.clientWidth)
      //   canvas.height = (canvas.clientHeight < 10 ? 10 : canvas.clientHeight)
      // }

      this.size =
        Math.max(width, height) /
        (10 / (this.STAR_SCALE <= 0 ? 0 : this.STAR_SCALE))

      console.log("DRAW", {width, height})

      if (this.WARP_EFFECT) this.maxLineWidth = this.size / 30

      const ctx = canvas.getContext("2d")

      // ctx.fillStyle = "#"+Math.floor(Math.random() * 0x1000000).toString(16) //"#FF0000"
      // ctx.fillRect(0, 0, 10, 5)
      // requestAnimationFrame(this.draw.bind(this))
      // return

      ctx.fillStyle = this.BACKGROUND_COLOR
      ctx.fillRect(0, 0, width, height)

      const rgb = `rgb(${this._STAR_R},${this._STAR_G},${this._STAR_B})`
      const rgba = `rgba(${this._STAR_R},${this._STAR_G},${this._STAR_B},`

      for (const s of this._stars) {
        const xOnDisplay = s.x / s.z
        const yOnDisplay = s.y / s.z

        if (!this.WARP_EFFECT && (xOnDisplay < -0.5 || xOnDisplay > 0.5 || yOnDisplay < -0.5 || yOnDisplay > 0.5))
          continue

        const size = (s.size * this.size) / s.z
        if (size < 0.3) continue //don't draw very small dots

        if (this.DEPTH_ALPHA) {
          const alpha = (1000 - s.z) / 1000
          ctx.fillStyle = rgba + (alpha > 1 ? 1 : alpha) + ")"
        } else {
          ctx.fillStyle = rgb
        }

        if (this.WARP_EFFECT) {
          ctx.beginPath()
          const x2OnDisplay = s.x / (s.z + this.WARP_EFFECT_LENGTH * this.SPEED)
          const y2OnDisplay = s.y / (s.z + this.WARP_EFFECT_LENGTH * this.SPEED)

          if (x2OnDisplay < -0.5 || x2OnDisplay > 0.5 || y2OnDisplay < -0.5 || y2OnDisplay > 0.5) continue

          ctx.moveTo(width * (xOnDisplay + 0.5) - size / 2, height * (yOnDisplay + 0.5) - size / 2)
          ctx.lineTo(width * (x2OnDisplay + 0.5) - size / 2, height * (y2OnDisplay + 0.5) - size / 2)
          ctx.lineWidth = size > this.maxLineWidth ? this.maxLineWidth : size
          if (this.USE_CIRCLES) {
            ctx.lineCap = "round"
          } else {
            ctx.lineCap = "butt"
          }
          ctx.strokeStyle = ctx.fillStyle
          ctx.stroke()
        } else if (this.USE_CIRCLES) {
          ctx.beginPath()
          ctx.arc(
            width * (xOnDisplay + 0.5) - size / 2,
            height * (yOnDisplay + 0.5) - size / 2,
            size / 2,
            0,
            2 * Math.PI
          )
          ctx.fill()
        } else {
          ctx.fillRect(
            width * (xOnDisplay + 0.5) - size / 2,
            height * (yOnDisplay + 0.5) - size / 2,
            size,
            size
          )
        }
      }
      this._prevW = width
      this._prevH = height


    }
    if (this._drawRequest != -1) this._drawRequest = requestAnimationFrame(this.draw.bind(this))
    this._LAST_RENDER_T = Date.now() - TIME
  }

  move() {
    const t = Date.now()
    const speedMulF = (t - this._lastMoveTS) / (1000 / 60)
    this._lastMoveTS = t

    if (this._PAUSED) return

    const speedAdjF = Math.pow(
      this.SPEED_ADJ_FACTOR < 0 ? 0 : this.SPEED_ADJ_FACTOR > 1 ? 1 : this.SPEED_ADJ_FACTOR,
      1 / speedMulF
    )
    this.SPEED = this.TARGET_SPEED * speedAdjF + this.SPEED * (1 - speedAdjF)
    if (this.SPEED < 0) this.SPEED = 0
    const speed = this.SPEED * speedMulF

    for (const s of this._stars) {
      s.z -= speed
      while (s.z < 1) {
        s.z += 1000
        s.x = (Math.random() - 0.5) * s.z
        s.y = (Math.random() - 0.5) * s.z
      }
    }
  }
}

let warpspeed = null
let offscreen = null

onmessage = ev => {
  // ev.data
  // if (warpspeed === null) {
  //   // offscreen = new OffscreenCanvas(warpspeed.data.resolution, warpspeed.data.resolution)
  //   // warpspeed = new Warpspeed(ev.data.data, this.data.canvas)
  // }

  let x = new WarpSpeed(ev.data.canvas)

  // warpspeed.tick()
  // const offscreen = new OffscreenCanvas(512, 512)
  // offscreen.

  // postMessage({
  //   data: offscreen.
  // })
}
