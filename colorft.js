const defaultRGB = {
  r: 255,
  g: 255,
  b: 255,
}

// detect

const isHex = color => color.charAt(0) === "#" && color.length === 7
const isRGBA = color => color.startsWith("rgba")

// convert

// "rgba(44,44,44,1)"

const hex2rgb = color => ({
  r: parseInt(color.substr(1, 2), 16),
  g: parseInt(color.substr(3, 2), 16),
  b: parseInt(color.substr(5, 2), 16),
})

const rgba2rgb = color => {
  const [, r, g, b, a] = /^\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/.exec(color)
  return {
    r,
    g,
    b,
  }
}

export const toRGB = color => {
  if (isHex(color)) {
    return hex2rgb(color)
  }
  if (isRGBA(color)) {
    return rgba2rgb(color)
  }

  return defaultRGB
}
