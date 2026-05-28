import { SMART_CORNER_CLIP } from '../constants/clipPresets'

export function smartCornerClip(cornerSize = SMART_CORNER_CLIP.cornerSize) {
  const size = typeof cornerSize === 'number' ? `${cornerSize}px` : cornerSize

  return `polygon(${size} 0px, 100% 0px, 100% calc(100% - ${size}), calc(100% - ${size}) 100%, 0px 100%, 0px ${size})`
}

export function polygonPointsToCss(points = []) {
  if (!points.length) return ''

  const pointValues = points.map(
    (point) => `${point.x}${point.unit || '%'} ${point.y}${point.unit || '%'}`,
  )

  return `polygon(${pointValues.join(', ')})`
}
