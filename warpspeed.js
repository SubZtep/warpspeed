class Star {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
    this.size = 0.5 + Math.random()
  }
}

AFRAME.registerComponent("warpspeed", {
  schema: {
    resolution: {
      type: "number",
      default: 512,
    },
    speed: {
      type: "number",
      default: 0.7,
    },
    targetSpeed: {
      type: "number",
      default: 0.7, // value of data.speed
    },
    speedAdjFactor: {
      type: "number",
      default: 0.03, // min: 0, max: 1
    },
    density: {
      type: "number",
      default: 0.7, // min: >0
    },
    useCircles: {
      type: "boolean",
      default: true,
      // default: false,
    },
    depthAplha: {
      type: "boolean",
      default: true,
      // default: false,
    },
    warpEffect: {
      type: "boolean",
      default: true,
      // default: false,
    },
    warpEffectLength: {
      type: "number",
      default: 5, // min: 0
    },
    starScale: {
      type: "number",
      default: 3, // min: >0
    },
    backgroundColor: {
      type: "color",
      default: "hsl(263,45%,7%)",
    },
    starColor: {
      type: "color",
      default: "#ffffff",
    },
  },

  prevW: -1,
  prevH: -1,

  init() {
    this.speed = this.data.speed
    // new WarpSpeed("my-canvas")
    const canvas = document.getElementById("my-canvas")
    // canvas.width = this.data.resolution
    // canvas.height = this.data.resolution

    const ctx = canvas.getContext("2d")
    ctx.fillStyle = this.data.backgroundColor
    ctx.fillRect(0, 0, 1, 1)
    ctx.fillStyle = this.data.starColor
    ctx.fillRect(0, 0, 1, 1)
    const color = ctx.getImageData(0, 0, 1, 1).data
    this.starR = color[0]
    this.starG = color[1]
    this.starB = color[2]
    this.stars = []
    for (let i = 0; i < this.data.density * 1000; i++) {
      this.stars.push(new Star((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, 1000 * Math.random()))
    }
    this.lastMoveTS = window.performance.now()
    // this.draw()

    const canvasMap = new THREE.Texture(canvas)
    this.material = new THREE.MeshPhongMaterial();
    this.material.map = canvasMap
    this.el.getObject3D("mesh").material = this.material
  },

  tick(time, timeDelta) {
    const TIME = window.performance.now()
    this.move()
    const canvas = document.getElementById("my-canvas")

    // console.log(this.starR)
    // console.log({ time, timeDelta })

    // if (!this.PAUSED) {
    // console.log(canvas.width)

    // if (this.prevW != canvas.clientWidth || this.prevH != canvas.clientHeight) {
    //   canvas.width = (canvas.clientWidth < 10 ? 10 : canvas.clientWidth)
    //   canvas.height = (canvas.clientHeight < 10 ? 10 : canvas.clientHeight)
    // }

    this.size =
      (canvas.height < canvas.width ? canvas.height : canvas.width) /
      (10 / (this.data.starScale <= 0 ? 0 : this.data.starScale))


    if (this.data.warpEffect) this.maxLineWidth = this.size / 30
    // console.log(this.maxLineWidth)

    const ctx = canvas.getContext("2d")
    ctx.fillStyle = this.data.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const rgb = `rgb(${this.starR},${this.starG},${this.starB})`
    const rgba = `rgba(${this.starR},${this.starG},${this.starB},`

    // console.log(this.stars)

    for (const s of this.stars) {
      const xOnDisplay = s.x / s.z
      const yOnDisplay = s.y / s.z

      if (!this.data.warpEffect && (xOnDisplay < -0.5 || xOnDisplay > 0.5 || yOnDisplay < -0.5 || yOnDisplay > 0.5))
        continue

      const size = (s.size * this.size) / s.z
      if (size < 0.3) continue //don't draw very small dots

      if (this.data.depthAplha) {
        const alpha = (1000 - s.z) / 1000
        ctx.fillStyle = rgba + (alpha > 1 ? 1 : alpha) + ")"
      } else {
        ctx.fillStyle = rgb
      }

      if (this.data.warpEffect) {
        ctx.beginPath()
        const x2OnDisplay = s.x / (s.z + this.data.warpEffectLength * this.speed)
        const y2OnDisplay = s.y / (s.z + this.data.warpEffectLength * this.speed)

        if (x2OnDisplay < -0.5 || x2OnDisplay > 0.5 || y2OnDisplay < -0.5 || y2OnDisplay > 0.5) continue

        ctx.moveTo(canvas.width * (xOnDisplay + 0.5) - size / 2, canvas.height * (yOnDisplay + 0.5) - size / 2)
        ctx.lineTo(canvas.width * (x2OnDisplay + 0.5) - size / 2, canvas.height * (y2OnDisplay + 0.5) - size / 2)
        ctx.lineWidth = size > this.maxLineWidth ? this.maxLineWidth : size
        if (this.data.useCircles) {
          ctx.lineCap = "round"
        } else {
          ctx.lineCap = "butt"
        }
        ctx.strokeStyle = ctx.fillStyle
        ctx.stroke()
      } else if (this.data.useCircles) {
        ctx.beginPath()
        ctx.arc(
          canvas.width * (xOnDisplay + 0.5) - size / 2,
          canvas.height * (yOnDisplay + 0.5) - size / 2,
          size / 2,
          0,
          2 * Math.PI
        )
        ctx.fill()
      } else {
        ctx.fillRect(
          canvas.width * (xOnDisplay + 0.5) - size / 2,
          canvas.height * (yOnDisplay + 0.5) - size / 2,
          size,
          size
        )
      }
    }
    this.prevW = canvas.clientWidth
    this.prevH = canvas.clientHeight
    // }
    // if (this._drawRequest != -1) this._drawRequest = requestAnimationFrame(this.draw.bind(this))
    this.lastRenderT = window.performance.now() - TIME

    this.material.map.needsUpdate = true
  },

  move() {
    const t = window.performance.now()
    const speedMulF = (t - this.lastMoveTS) / (1000 / 60)
    this.lastMoveTS = t

    // if (this._PAUSED) return

    const speedAdjF = Math.pow(
      this.data.speedAdjFactor < 0 ? 0 : this.data.speedAdjFactor > 1 ? 1 : this.data.speedAdjFactor,
      1 / speedMulF
    )
    this.speed = this.data.targetSpeed * speedAdjF + this.speed * (1 - speedAdjF)
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
  },
})
