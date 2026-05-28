function indent(level) {
  return '  '.repeat(level)
}

function generateInsetInnerHtml(layer, level) {
  if (!layer.insetBorder?.enabled) return ''

  return `${indent(level)}<span class="${layer.cssClass}_inner"></span>`
}

export function generateChildrenHtml(layer, layersById, level = 1) {
  return layer.children.map((childId) => generateLayerHtml(childId, layersById, level)).join('\n')
}

export function generateLayerHtml(layerId, layersById, level = 0) {
  const layer = layersById[layerId]
  if (!layer) return ''

  const tagName = layer.tagName || 'span'
  const children = generateChildrenHtml(layer, layersById, level + 1)
  const innerBorder = generateInsetInnerHtml(layer, level + 1)
  const rootContent =
    layer.type === 'frame' && layer.content?.enabled
      ? `${indent(level + 1)}<div class="${layer.content.className}">\n${indent(level + 2)}${layer.content.text}\n${indent(level + 1)}</div>`
      : ''
  const childContent = [innerBorder, children, rootContent].filter(Boolean).join('\n')

  if (!childContent && tagName === 'span') {
    return `${indent(level)}<span class="${layer.cssClass}"></span>`
  }

  return [
    `${indent(level)}<${tagName} class="${layer.cssClass}">`,
    childContent,
    `${indent(level)}</${tagName}>`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function generateProjectHtml(projectData) {
  return generateLayerHtml(projectData.layers.rootLayerId, projectData.layers.layersById)
}
