import WarpSpeed from "./warpspeed"
import WarpWorker from "web-worker:./worker"

AFRAME.registerComponent("warpspeed", {
  schema: {
    width: {
      type: "int",
      default: 512,
    },
    height: {
      type: "int",
      default: 512,
    },
    speed: {
      type: "number",
      default: 0.7,
    },
    density: {
      type: "number",
      // default: 0.7, // min: >0
      default: 25.7, // min: >0
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
    const reloadTexture =
      oldData.useWorker !== this.data.useWorker ||
      oldData.width !== this.data.width ||
      oldData.height !== this.data.height

    if (reloadTexture) {
      if (oldData.useWorker !== undefined) {
        this.destroyCanvasMap()
      }
      this.createCanvasMap()
      this.initWarpspeed()
    }

    if (this.workerInUse()) {
      this.worker.postMessage({ config: this.data, pause: !this.isPlaying })
    } else {
      this.warpspeed.update(this.data)
    }
  },

  initWarpspeed() {
    this.el.removeState("worker")
    if (this.data.useWorker) {
      try {
        const offscreen = this.canvas.transferControlToOffscreen()
        this.worker = new WarpWorker()
        this.worker.postMessage({ canvas: offscreen }, [offscreen])
        this.el.addState("worker")
        return
      } catch (e) {
        console.error(e)
      }
    }
    this.warpspeed = new WarpSpeed(this.canvas)
  },

  createCanvasMap() {
    this.canvas = document.createElement("canvas")
    this.canvas.width = this.data.width
    this.canvas.height = this.data.height
    this.canvasMap = new THREE.Texture(this.canvas)
    this.el.getObject3D("mesh").material.map = this.canvasMap
  },

  destroyCanvasMap() {
    if (this.workerInUse()) {
      this.worker.terminate()
      delete this.worker
    } else {
      delete this.warpspeed
    }
    this.canvasMap.dispose()
    delete this.canvas
  },

  play() {
    if (this.workerInUse()) {
      this.worker.postMessage({ pause: false })
    }
  },

  pause() {
    if (this.workerInUse()) {
      this.worker.postMessage({ pause: true })
    }
  },

  workerInUse() {
    return this.el.is("worker")
  },

  tick(_time, timeDelta) {
    if (!this.workerInUse()) {
      this.warpspeed.draw(timeDelta)
    }
    this.canvasMap.needsUpdate = true
  },
})
