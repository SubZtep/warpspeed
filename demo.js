const boxEl = document.querySelector("#box"); // console.log(boxEl.getObject3D("mesh").geometry)

console.log(boxEl.getAttribute("position")); // const sceneEl = document.querySelector("a-scene")
// const cameraEl = document.querySelector("a-camera")
// const boxEl = document.querySelector("#box")
// let geometryFolder = null
// const geometryController = {}
// let workerController
// const resolutions = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]
// const warpspeed = {
//   width: 1024,
//   height: 256,
//   speed: 0,
//   density: 5,
//   useCircles: true,
//   depthAlpha: true,
//   warpEffect: true,
//   warpEffectLength: 5,
//   starScale: 3,
//   // backgroundColor: "#100a1a",
//   backgroundColor: "#ff0000",
//   starColor: "#ffffff",
//   useWorker: false,
// }
// const geometry = {
//   primitive: "box",
//   box: {
//     // width: 0.1,
//     // height: 0.2,
//     width: 1,
//     height: 1,
//     depth: 1,
//   },
//   plane: {
//     width: 1,
//     height: 1,
//   },
//   sphere: {
//     radius: 1,
//   },
//   cone: {
//     height: 1,
//     radiusTop: 0.8,
//     radiusBottom: 1,
//   },
//   ring: {
//     radiusInner: 0.8,
//     radiusOuter: 1.2,
//   },
// }
// const rotation = {
//   x: 0,
//   y: 0,
//   z: 0,
// }
// const obj2attr = obj =>
//   Object.entries(obj)
//     .map(([key, value]) => `${key}: ${value}`)
//     .join(";")
// const setGeometry = () =>
//   boxEl.setAttribute("geometry", `primitive: ${geometry.primitive};` + obj2attr(geometry[geometry.primitive]))
// const changePrimitive = primitive => {
//   if (geometryFolder !== null) {
//     entityFolder.removeFolder(geometryFolder)
//   }
//   Object.keys(geometryController).forEach(key => delete geometryController[key])
//   geometry.primitive = primitive
//   geometryFolder = entityFolder.addFolder("Geometry")
//   geometryFolder.open()
//   for (let key in geometry[primitive]) {
//     geometryController[key] = geometryFolder.add(geometry[primitive], key, 0.1, 10.0, 0.1).onChange(setGeometry)
//   }
//   setGeometry()
// }
// const setWarpseed = () => {
//   boxEl.setAttribute("warpspeed", obj2attr(warpspeed))
//   if (warpspeed.useWorker && !boxEl.is("worker")) {
//     workerController.setValue(false)
//     showError()
//   }
// }
// const setRotation = () => boxEl.setAttribute("rotation", `${rotation.x} ${rotation.y} ${rotation.z}`)

const setStats = fpsOnly => document.body.className = fpsOnly ? "miniStat" : "";

const gui = new dat.GUI(); // // gui.close()

gui.add({
  Stat_FPS_Only: true
}, "Stat_FPS_Only").onChange(setStats); // gui.add({ pause: false }, "pause").onChange(isPause => el[isPause ? "pause" : "play"]())
// workerController = gui.add(warpspeed, "useWorker").onChange(setWarpseed)
// gui
//   .addColor({ background: "#000000" }, "background")
//   .onChange(color => sceneEl.setAttribute("background", `color: ${color}`))
// const warpspeedFolder = gui.addFolder("WarpSpeed")
// warpspeedFolder.add(warpspeed, "width", resolutions).onChange(setWarpseed)
// warpspeedFolder.add(warpspeed, "height", resolutions).onChange(setWarpseed)
// warpspeedFolder.add(warpspeed, "speed", 0, 10, 0.1).onChange(setWarpseed)
// warpspeedFolder.add(warpspeed, "density", 0.1, 100.0, 0.1).onChange(setWarpseed)
// warpspeedFolder.add(warpspeed, "useCircles").onChange(setWarpseed)
// warpspeedFolder.add(warpspeed, "depthAlpha").onChange(setWarpseed)
// warpspeedFolder.add(warpspeed, "warpEffect").onChange(setWarpseed)
// warpspeedFolder.add(warpspeed, "warpEffectLength", 0, 100, 1).onChange(setWarpseed)
// warpspeedFolder.add(warpspeed, "starScale", 1, 100, 1).onChange(setWarpseed)
// warpspeedFolder.addColor(warpspeed, "backgroundColor").onChange(setWarpseed)
// warpspeedFolder.addColor(warpspeed, "starColor").onChange(setWarpseed)
// const entityFolder = gui.addFolder("Entity")
// entityFolder.open()
// entityFolder.add(geometry, "primitive", ["box", "plane", "sphere", "cone", "ring"]).onChange(changePrimitive)
// const rotationFolder = entityFolder.addFolder("Rotation")
// rotationFolder.add(rotation, "x", 0, 360).onChange(setRotation)
// rotationFolder.add(rotation, "y", 0, 360).onChange(setRotation)
// rotationFolder.add(rotation, "z", 0, 360).onChange(setRotation)
// changePrimitive("box")
// setWarpseed()
// // workerController.setValue(true)
// // / / // //
// // / INTRO
// // //  //
// const visibleHeightAtZDepth = (depth, camera) => {
//   const cameraOffset = camera.position.z
//   if (depth < cameraOffset) {
//     depth -= cameraOffset
//   } else {
//     depth += cameraOffset
//   }
//   const vFOV = (camera.fov * Math.PI) / 180
//   return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
// }
// const visibleWidthAtZDepth = (depth, camera) => {
//   const height = visibleHeightAtZDepth(depth, camera)
//   return height * camera.aspect
// }
// const camera = cameraEl.getObject3D("camera")
// // const distance = cameraEl.getAttribute("position").z - boxEl.getAttribute("position").z - boxEl.getAttribute("geometry").depth / 2
// const distance = 1
// console.log([distance, visibleWidthAtZDepth(distance, camera), visibleHeightAtZDepth(distance, camera)])
// geometryController.width = visibleWidthAtZDepth(distance, camera)
