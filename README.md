# A-Frame WarpSpeed Texture

> Component that set real-time calculated animation on a canvas as texture to the existing material of an entity.

---

> ![textured cube](cube.gif)

---

The animation is from the existing [WarpSpeed.js](https://github.com/adolfintel/warpspeed) library with minimal modification. There are two was two run the calculation:
1. On the main thread.
2. In a web worker using the experimental [transferControlToOffscreen]> (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/transferControlToOffscreen) method.

**WarpSpeed** is a perfect to demonstrate how important is to not to block the main thread because it's highly tweakable until rich significant FPS drops and looks uber cool.

---

## ~~Usage~~

WIP, check example :trollface:

---

> > ## License
> :octocat:
> > Unlicensed, the _original texture version_ required [lgpl3+](https://github.com/adolfintel/warpspeed#license) which is not in GitHub templates.

---
