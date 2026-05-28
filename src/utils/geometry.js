export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function calculateFitScale(containerWidth, containerHeight, targetWidth, targetHeight) {
  if (!containerWidth || !containerHeight || !targetWidth || !targetHeight) return 1

  return Math.min(containerWidth / targetWidth, containerHeight / targetHeight, 1)
}

export function pxToPercent(value, total) {
  if (!total) return 0

  return (value / total) * 100
}

export function pixelToPercent(x, y, width, height) {
  if (!width || !height) {
    return { x: 0, y: 0 }
  }

  return {
    x: Number(((x / width) * 100).toFixed(2)),
    y: Number(((y / height) * 100).toFixed(2)),
  }
}

export function percentToPixel(x, y, width, height) {
  return {
    x: (x / 100) * width,
    y: (y / 100) * height,
  }
}

export function snapPixel(value, gridSize = 10) {
  if (!gridSize) return value

  return Math.round(value / gridSize) * gridSize
}

export function snapPercentPoint(point, gridSize, size) {
  const pixelPoint = percentToPixel(point.x, point.y, size.width, size.height)
  const snappedX = snapPixel(pixelPoint.x, gridSize)
  const snappedY = snapPixel(pixelPoint.y, gridSize)

  return pixelToPercent(snappedX, snappedY, size.width, size.height)
}

export function getLocalPoint(event, element, zoom = 1) {
  const rect = element.getBoundingClientRect()

  return {
    x: (event.clientX - rect.left) / zoom,
    y: (event.clientY - rect.top) / zoom,
  }
}

export function getUnscaledElementSize(element, zoom = 1) {
  const rect = element.getBoundingClientRect()

  return {
    width: rect.width / zoom,
    height: rect.height / zoom,
  }
}
