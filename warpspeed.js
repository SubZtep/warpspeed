export class Star {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
    this.size = 0.5 + Math.random()
  }
}

export default class WarpSpeed {

  config = {}
  stars = []

  starR = 255
  starG = 255
  starB = 255

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
  }

  update(config) {
    //LiliCode: n vvvvvvvvvvvvvvvvvvj n n n n
    for (const [key, value] of Object.entries(config)) {
      // console.log(key)
      if (this.config[key] !== value) {
        switch (key) {
          // case "backgroundColor":
          //   this.ctx.fillStyle = this.config.backgroundColor
          //   // this.ctx.fillRect(0, 0, width, height)
          //   this.ctx.fillRect(0, 0, 512, 512)
          // break
          case "speed":
          case "targetSpeed":
          case "speedAdjFactor":
            this.speed = key === "speed" ? value : this.config.speed || 0.7
            break
          case "resolution":
            if (this.config.starScale !== undefined) {
              this.size = value / (10 / this.config.starScale)
              this.maxLineWidth = this.size / 30
            }
            break
          case "starScale":
            if (this.config.resolution !== undefined) {
              this.size = this.config.resolution / (10 / value)
              this.maxLineWidth = this.size / 30
            }
            break
          case "density":
            const len = Math.ceil(value * 1000)
            const diff = len - this.stars.length
            if (diff > 0) {
              for (let i = 0; i < diff; i++) {
                this.stars.push(
                  new Star((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, 1000 * Math.random())
                )
              }
            } else {
              this.stars.length = len
            }
            break
          case "starColor":
            if (value.charAt(0) === "#" && value.length === 7) {
              this.starR = parseInt(value.substr(1, 2), 16)
              this.starG = parseInt(value.substr(3, 2), 16)
              this.starB = parseInt(value.substr(5, 2), 16)
            } else {
              continue
            }
            break
        }
        this.config[key] = value
      }
    }
  }

  draw(timeDelta) {
    this.move(timeDelta)

    const width = this.config.resolution
    const height = this.config.resolution
    this.size = Math.max(width, height) / (10 / this.config.starScale)

    const ctx = this.ctx
    ctx.fillStyle = this.config.backgroundColor
    ctx.fillRect(0, 0, width, height)

    for (const s of this.stars) {
      const xOnDisplay = s.x / s.z
      const yOnDisplay = s.y / s.z

      if (!this.config.warpEffect && (xOnDisplay < -0.5 || xOnDisplay > 0.5 || yOnDisplay < -0.5 || yOnDisplay > 0.5))
        continue

      const size = (s.size * this.size) / s.z
      if (size < 0.3) continue //don't draw very small dots

      if (this.config.depthAlpha) {
        const alpha = (1000 - s.z) / 1000
        ctx.fillStyle = `rgba(${this.starR},${this.starG},${this.starB},${alpha.toString()})`
      } else {
        ctx.fillStyle = `rgb(${this.starR},${this.starG},${this.starB})` //rgb
      }

      if (this.config.warpEffect) {
        ctx.beginPath()
        const x2OnDisplay = s.x / (s.z + this.config.warpEffectLength * this.speed)
        const y2OnDisplay = s.y / (s.z + this.config.warpEffectLength * this.speed)

        if (x2OnDisplay < -0.5 || x2OnDisplay > 0.5 || y2OnDisplay < -0.5 || y2OnDisplay > 0.5) continue

        ctx.moveTo(width * (xOnDisplay + 0.5) - size / 2, height * (yOnDisplay + 0.5) - size / 2)
        ctx.lineTo(width * (x2OnDisplay + 0.5) - size / 2, height * (y2OnDisplay + 0.5) - size / 2)
        ctx.lineWidth = size > this.maxLineWidth ? this.maxLineWidth : size
        ctx.lineCap = this.config.useCircles ? "round" : "butt"
        ctx.strokeStyle = ctx.fillStyle
        ctx.stroke()
      } else if (this.config.useCircles) {
        ctx.beginPath()
        ctx.arc(width * (xOnDisplay + 0.5) - size / 2, height * (yOnDisplay + 0.5) - size / 2, size / 2, 0, 2 * Math.PI)
        ctx.fill()
      } else {
        ctx.fillRect(width * (xOnDisplay + 0.5) - size / 2, height * (yOnDisplay + 0.5) - size / 2, size, size)
      }
    }
  }

  move(timeDelta) {
    const speedMulF = timeDelta / 16.5
    const speedAdjF = Math.pow(this.config.speedAdjFactor, 1 / speedMulF)
    this.speed = this.config.targetSpeed * speedAdjF + this.speed * (1 - speedAdjF)
    if (this.speed < 0) this.speed = 0
    const speed = this.speed * speedMulF

    for (const s of this.stars) {
      s.z -= speed
      while (s.z < 1) {
        s.z += 1000
        s.x = (Math.random() - 0.5) * s.z
        s.y = (Math.random() - 0.5) * s.z
      }
    }
  }
}
