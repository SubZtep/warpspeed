import WarpSpeed from "./warpspeed"
import WarpWorker from "web-worker:./worker"

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
    density: {
      type: "number",
      default: 0.7, // min: >0
    },
    useCircles: {
      type: "boolean",
      default: true,
    },
    depthAlpha: {
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
      default: false,
    },
  },

  update(oldData) {
    if (oldData.useWorker !== this.data.useWorker) {
      if (oldData.useWorker !== undefined) {
        if (oldData.useWorker) {
          this.worker.terminate()
          delete this.worker
        } else {
          delete this.warpspeed
        }
        this.canvasMap.dispose()
        delete this.canvas
      }

      this.canvas = document.createElement("canvas")
      this.canvas.width = this.data.resolution
      this.canvas.height = this.data.resolution

      this.canvasMap = new THREE.Texture(this.canvas)
      this.el.getObject3D("mesh").material.map = this.canvasMap

      if (this.data.useWorker) {
        const offscreen = this.canvas.transferControlToOffscreen()
        this.worker = new WarpWorker()
        this.worker.postMessage({ canvas: offscreen }, [offscreen])
      } else {
        this.warpspeed = new WarpSpeed(this.canvas)
      }
    }

    if (this.data.useWorker) {
      this.worker.postMessage({ config: this.data, pause: !this.isPlaying })
    } else {
      this.warpspeed.update(this.data)
    }
  },

  play() {
    if (this.data.useWorker) {
      this.worker.postMessage({ pause: false })
    }
  },

  pause() {
    if (this.data.useWorker) {
      this.worker.postMessage({ pause: true })
    }
  },

  tick(_time, timeDelta) {
    if (!this.data.useWorker) {
      this.warpspeed.draw(timeDelta)
    }
    this.canvasMap.needsUpdate = true
  },
})
