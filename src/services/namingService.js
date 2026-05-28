import { createSafeCssName } from '../utils/cssSafe'

export function generateTechnicalName(parentLayer, siblingIndex) {
  const index = String(siblingIndex).padStart(2, '0')

  if (!parentLayer || parentLayer.id === 'root' || parentLayer.technicalName === 'FRAME') {
    return `E${index}`
  }

  return `${parentLayer.technicalName}-C${index}`
}

export function technicalNameToCssClass(prefix = 'clipframe', technicalName = 'FRAME') {
  const safePrefix = createSafeCssName(prefix)

  if (technicalName === 'FRAME') {
    return safePrefix
  }

  return createSafeCssName(`${safePrefix}_${technicalName.replaceAll('-', '_')}`)
}

export function createDisplayNameFromTechnicalName(technicalName) {
  if (technicalName === 'FRAME') return 'Root Frame'

  const parts = technicalName.split('-')

  return parts
    .map((part, index) => {
      const number = part.replace(/^[EC]/, '')

      return index === 0 ? `Element ${number}` : `Child ${number}`
    })
    .join(' / ')
}

export function regenerateChildNamesRecursively(layerId, layersById, cssPrefix) {
  const layer = layersById[layerId]
  if (!layer) return

  layer.cssClass = technicalNameToCssClass(cssPrefix, layer.technicalName)

  layer.children.forEach((childId, index) => {
    const child = layersById[childId]
    if (!child) return

    child.technicalName = generateTechnicalName(layer, index + 1)
    child.cssClass = technicalNameToCssClass(cssPrefix, child.technicalName)

    if (!child.displayName) {
      child.displayName = createDisplayNameFromTechnicalName(child.technicalName)
    }

    regenerateChildNamesRecursively(childId, layersById, cssPrefix)
  })
}
