// firefox: about:config gfx.offscreencanvas.enabled
// chrome: chrome://flags/#new-canvas-2d-api

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
    },
    depthAplha: {
      type: "boolean",
      default: true,
    },
    warpEffect: {
      type: "boolean",
      default: true,
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
      default: "#100a1a",
    },
    starColor: {
      type: "color",
      default: "#ffffff",
    },
    useWorker: {
      type: "boolean",
      default: true
    }
  },

  init() {
    // this.canvas = document.createElement("canvas")
    this.canvas = document.getElementById("c")
    this.canvas.width = this.data.resolution
    this.canvas.height = this.data.resolution


    // const ctx = this.canvas.getContext("2d")
    this.stars = []

    const canvasMap = new THREE.Texture(this.canvas)
    this.material = new THREE.MeshPhongMaterial()
    this.material.map = canvasMap
    this.el.getObject3D("mesh").material = this.material
  },

  update(oldData) {
    if (oldData.resolution !== this.data.resolution) {
      this.canvas.width = this.data.resolution
      this.canvas.height = this.data.resolution
    }
    if (oldData.resolution !== this.data.resolution || oldData.starScale !== this.data.starScale) {
      this.size = this.data.resolution / (10 / this.data.starScale)
      this.maxLineWidth = this.size / 30
    }
    if (
      oldData.speed !== this.data.speed ||
      oldData.targetSpeed !== this.data.targetSpeed ||
      oldData.speedAdjFactor !== this.data.speedAdjFactor
    ) {
      this.speed = this.data.speed
    }
    if (oldData.density !== this.data.density) {
      const len = Math.ceil(this.data.density * 1000)
      const diff = len - this.stars.length
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          this.stars.push(new Star((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, 1000 * Math.random()))
        }
      } else {
        this.stars.length = len
      }
    }
    if (oldData.starColor !== this.data.starColor) {
      const c = this.data.starColor
      if (c.charAt(0) === "#" && c.length === 7) {
        this.starR = parseInt(c.substr(1, 2), 16)
        this.starG = parseInt(c.substr(3, 2), 16)
        this.starB = parseInt(c.substr(5, 2), 16)
      } else {
        this.starR = 255
        this.starG = 255
        this.starB = 255
      }
    }

    if (oldData.useWorker !== this.data.useWorker) {
      const offscreen = this.canvas.transferControlToOffscreen()
      const worker = new Worker("worker.js")
      worker.postMessage({
        data: this.data,
        canvas: offscreen
      }, [offscreen])
      // const canvasData = this.canvas.getContext("2d").
      console.log(offscreen)
    }
  },

  tick(_time, timeDelta) {
    if (this.data.useWorker) return
    this.move(timeDelta)

    const canvas = this.canvas
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = this.data.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const rgb = `rgb(${this.starR},${this.starG},${this.starB})`
    const rgba = `rgba(${this.starR},${this.starG},${this.starB},`

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

    this.material.map.needsUpdate = true
  },

  move(timeDelta) {
    const speedMulF = timeDelta / 16.5
    const speedAdjF = Math.pow(this.data.speedAdjFactor, 1 / speedMulF)

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
