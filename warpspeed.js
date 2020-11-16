class Star {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
    this.size = 0.5 + Math.random()
  }
}

const randPos = () => (Math.random() - 0.5) * 1000

const hex2rgb = webColor =>
  webColor.charAt(0) === "#" && webColor.length === 7
    ? {
        r: parseInt(webColor.substr(1, 2), 16),
        g: parseInt(webColor.substr(3, 2), 16),
        b: parseInt(webColor.substr(5, 2), 16),
      }
    : {
        r: 255,
        g: 255,
        b: 255,
      }

export default class WarpSpeed {
  config = {}
  stars = []

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
  }

  update(config) {
    //LiliCode: n vvvvvvvvvvvvvvvvvvj n n n n
    for (const [key, value] of Object.entries(config)) {
      if (this.config[key] !== value) {
        switch (key) {
          case "speed":
          case "targetSpeed":
          case "speedAdjFactor":
            this.speed = config.speed || this.config.speed
            break
          case "resolution":
            if (config.starScale || this.config.starScale) {
              this.size = value / (10 / (config.starScale || this.config.starScale))
              this.maxLineWidth = this.size / 30
            }
            break
          case "starScale":
            if (config.resolution || this.config.resolution) {
              this.size = (config.resolution || this.config.resolution) / (10 / value)
              this.maxLineWidth = this.size / 30
            }
            break
          case "density":
            const starCount = Math.ceil(value * 1000)
            const diff = starCount - this.stars.length
            if (diff > 0) {
              for (let i = 0; i < diff; i++) {
                const star = new Star(randPos(), randPos(), 1000 * Math.random())
                this.stars.push(star)
              }
            } else {
              this.stars.length = starCount
            }
            break
          case "starColor":
            const color = hex2rgb(value)
            this.starR = color.r
            this.starG = color.g
            this.starB = color.b
            break
        }
        this.config[key] = value
      }
    }
  }

  draw(timeDelta) {
    // console.log(timeDelta)
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
        ctx.fillStyle = `rgba(${this.starR}, ${this.starG}, ${this.starB}, ${alpha.toString()})`
      } else {
        ctx.fillStyle = this.config.starColor
      }

      if (this.config.warpEffect) {
        ctx.beginPath()
        const x2OnDisplay = s.x / (s.z + this.config.warpEffectLength * this.speed)
        const y2OnDisplay = s.y / (s.z + this.config.warpEffectLength * this.speed)

        if (x2OnDisplay < -0.5 || x2OnDisplay > 0.5 || y2OnDisplay < -0.5 || y2OnDisplay > 0.5) continue

        ctx.moveTo(width * (xOnDisplay + 0.5) - size / 2, height * (yOnDisplay + 0.5) - size / 2)
        ctx.lineTo(width * (x2OnDisplay + 0.5) - size / 2, height * (y2OnDisplay + 0.5) - size / 2)
        ctx.lineWidth = Math.min(size, this.maxLineWidth)
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
    const speedMulF = timeDelta / 10 // / 16.5
    const speedAdjF = Math.pow(this.config.speedAdjFactor, 1 / speedMulF)
    this.speed = this.config.targetSpeed * speedAdjF + this.speed * (1 - speedAdjF)
    if (this.speed < 0) this.speed = 0
    const speed = this.speed * speedMulF

    for (const star of this.stars) {
      star.z -= speed
      while (star.z < 1) {
        star.z += 1000
        star.x = (Math.random() - 0.5) * star.z
        star.y = (Math.random() - 0.5) * star.z
      }
    }
  }
}
