const sceneEl = document.querySelector("a-scene")
const cameraEl = document.querySelector("a-camera")
const boxEl = document.querySelector("#box")
const errorEl = document.querySelector(".error")
let timeout: NodeJS.Timeout

const showError = () => {
  errorEl.classList.remove("hidden")
  clearTimeout(timeout)
  timeout = setTimeout(() => errorEl.classList.add("hidden"), 3000)
}

const changeData = (comp: string) => (prop: string) => (val: any) => void boxEl.setAttribute(comp, { [prop]: val })

const testWorker = (uw: boolean) => {
  if (uw && !boxEl.is("worker")) {
    boxEl.setAttribute("warpspeed", { useWorker: false })
    showError()
  }
}

const warpspeed = {
  width: 1024,
  height: 512,
  speed: 0.1,
  density: 5,
  useCircles: true,
  depthAlpha: true,
  warpEffect: true,
  warpEffectLength: 1,
  starScale: 2,
  backgroundColor: "#100a1a", //1d1135
  starColor: "#ffffff",
  useWorker: false,
}
boxEl.setAttribute("warpspeed", warpspeed)

let f: dat.GUI
let changeComp: (prop: string) => (val: any) => void
let changeProp: (val: any) => void
const gui = new dat.GUI()

f = gui.addFolder("Beyond WASD")
f.add({ Stat_FPS_Only: true }, "Stat_FPS_Only").onChange(
  fpsOnly => (document.body.className = fpsOnly ? "miniStat" : "")
)
f.addColor({ background: "#000000" }, "background").onChange(color => sceneEl.setAttribute("background", { color }))
// f.open()

f = gui.addFolder("Warpspeed")
changeComp = changeData("warpspeed")
Object.keys(warpspeed).forEach(prop => {
  changeProp = changeComp(prop)
  if (prop.toLowerCase().indexOf("color") === -1) {
    let ctrl: dat.GUIController

    switch (prop) {
      case "width":
      case "height":
        ctrl = f.add(boxEl.components.warpspeed.data, prop, [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096])
        break
      case "speed":
      case "warpEffectLength":
        ctrl = f.add(boxEl.components.warpspeed.data, prop, 0, 50, 0.01)
        break
      case "density":
      case "starScale":
        ctrl = f.add(boxEl.components.warpspeed.data, prop, 0.01, 50, 0.01)
        break
      case "useWorker":
        ctrl = f.add(boxEl.components.warpspeed.data, prop)
        ctrl.onFinishChange(testWorker)
        break
      default:
        ctrl = f.add(boxEl.components.warpspeed.data, prop)
    }

    ctrl.onChange(changeProp).listen()
  } else {
    f.addColor(boxEl.components.warpspeed.data, prop).onChange(changeProp).listen()
  }
})
f.open()

f = gui.addFolder("Position")
Array.of("x", "y", "z").forEach(prop => void f.add(boxEl.object3D.position, prop).min(-10).max(10).step(0.01).listen())
// f.open()

f = gui.addFolder("Rotation")
Array.of("x", "y", "z").forEach(
  prop =>
    void f
      .add(boxEl.object3D.rotation, prop)
      .min(-2 * Math.PI)
      .max(2 * Math.PI)
      .step(0.01)
      .listen()
)
f.open()

f = gui.addFolder("Dimensions")
changeComp = changeData("geometry")
Array.of("width", "height", "depth").forEach(prop => {
  changeProp = changeComp(prop)
  f.add(boxEl.getAttribute("geometry"), prop).min(0.01).max(10).step(0.01).onChange(changeProp).listen()
})
f.open()

if (AFRAME.utils.device.isMobile()) {
  gui.close()
  cameraEl.setAttribute("look-controls", { enabled: false }) // should be gyroscope only
}

// / / // //
// / INTRO
// //  //

const visibleHeightAtZDepth = (depth: number, camera: THREE.PerspectiveCamera) => {
  const cameraOffset = camera.position.z
  if (depth < cameraOffset) {
    depth -= cameraOffset
  } else {
    depth += cameraOffset
  }
  const vFOV = (camera.fov * Math.PI) / 180
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
}

const visibleWidthAtZDepth = (depth: number, camera: THREE.PerspectiveCamera) => {
  const height = visibleHeightAtZDepth(depth, camera)
  return height * camera.aspect
}

const attrify = (obj: object) =>
  Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")

const starEl = document.querySelector("#star")
const camera = cameraEl.getObject3D("camera") as THREE.PerspectiveCamera
const distance =
  cameraEl.getAttribute("position").z - boxEl.getAttribute("position").z - boxEl.getAttribute("geometry").depth / 2

const setAttr = (prop: "w" | "h") => {
  const screen = prop === "w" ? visibleWidthAtZDepth(distance, camera) : visibleHeightAtZDepth(distance, camera)
  Array.of(`animation__widescreen${prop}`, `animation__o${prop}`).forEach((attrName, index) => {
    const attr = starEl.getAttribute(attrName)
    attr[index === 0 ? "to" : "from"] = screen
    starEl.setAttribute(attrName, attrify(attr))
  })
}

setAttr("w")
setAttr("h")

sceneEl.addEventListener(
  "animationtimelinecomplete",
  () =>
    void setTimeout(() => {
      boxEl.setAttribute("warpspeed", { width: 512, useWorker: true })
      testWorker(true)
    }, 1000)
)
