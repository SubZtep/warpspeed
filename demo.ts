const sceneEl = document.querySelector("a-scene")
const cameraEl = document.querySelector("a-camera")
const boxEl = document.querySelector("#box")
const errorEl = document.querySelector(".error")

const changeData = (comp: string) => (prop: string) => (val: any) => void boxEl.setAttribute(comp, { [prop]: val })

let timeout: NodeJS.Timeout
const showError = () => {
  errorEl.classList.remove("hidden")
  clearTimeout(timeout)
  timeout = setTimeout(() => errorEl.classList.add("hidden"), 3000)
}

const testWorker = (uw: boolean) => {
  if (uw && !boxEl.is("worker")) {
    boxEl.setAttribute("warpspeed", { useWorker: false })
    showError()
  }
}

const warpspeed = {
  width: 1024,
  height: 256,
  speed: 1,
  density: 5,
  useCircles: true,
  depthAlpha: true,
  warpEffect: true,
  warpEffectLength: 5,
  starScale: 3,
  backgroundColor: "#100a1a",
  starColor: "#ffffff",
  useWorker: true,
}
boxEl.setAttribute("warpspeed", warpspeed)

let f: dat.GUI
let changeComp: (prop: string) => (val: any) => void
let changeProp: (val: any) => void
const gui = new dat.GUI()

f = gui.addFolder("Demo")
f.add({ Stat_FPS_Only: true }, "Stat_FPS_Only").onChange(
  fpsOnly => (document.body.className = fpsOnly ? "miniStat" : "")
)
f.addColor({ background: "#000000" }, "background").onChange(color => sceneEl.setAttribute("background", { color }))
f.open()

f = gui.addFolder("Warpspeed")
changeComp = changeData("warpspeed")
Object.keys(warpspeed).forEach(prop => {
  changeProp = changeComp(prop)
  if (prop.toLowerCase().indexOf("color") === -1) {
    const ctrl = f.add(boxEl.components.warpspeed.data, prop).onChange(changeProp).listen()

    switch (prop) {
      case "width":
      case "height":
        ctrl.options([2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096])
        break
      case "useWorker":
        ctrl.onFinishChange(testWorker)
        break
    }
  } else {
    f.addColor(boxEl.components.warpspeed.data, prop).onChange(changeProp).listen()
  }
})
f.open()

f = gui.addFolder("Position")
Array.of("x", "y", "z").forEach(prop => void f.add(boxEl.object3D.position, prop).step(0.01).listen())
f.open()

f = gui.addFolder("Rotation")
Array.of("x", "y", "z").forEach(
  prop =>
    void f
      .add(boxEl.object3D.rotation, prop)
      .min(0)
      .max(2 * Math.PI)
      .step(0.01)
      .listen()
)
f.open()

f = gui.addFolder("Dimensions")
changeComp = changeData("geometry")
Array.of("width", "height", "depth").forEach(prop => {
  changeProp = changeComp(prop)
  f.add(boxEl.getAttribute("geometry"), prop).min(0.01).step(0.01).onChange(changeProp).listen()
})
f.open()

testWorker(warpspeed.useWorker)

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

const camera = cameraEl.getObject3D("camera")
// const distance =
//   cameraEl.getAttribute("position").z - boxEl.getAttribute("position").z - boxEl.getAttribute("geometry").depth / 2
// boxEl.setAttribute("geometry", {
//   width: visibleWidthAtZDepth(distance, camera),
//   height: visibleHeightAtZDepth(distance, camera),
// })
