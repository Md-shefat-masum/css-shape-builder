import { CLIP_MODES } from '../constants/clipPresets'
import { polygonPointsToCss, smartCornerClip } from '../utils/clipPath'

function unitValue(value, unit = '%') {
  return `${value}${unit}`
}

function transformValue(transform = {}) {
  const translateX = transform.translateX || 0
  const translateY = transform.translateY || 0
  const scale = transform.scale ?? 1
  const rotate = transform.rotate || 0

  return `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`
}

function shadowValue(shadow = {}) {
  if (!shadow.enabled) return ''

  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
}

export function generateTransitionCss(transition = {}) {
  if (!transition.enabled) return ''

  if (transition.perProperty?.length) {
    return transition.perProperty
      .map(
        (item) =>
          `${item.property} ${item.duration || 250}ms ${item.easing || 'ease'} ${item.delay || 0}ms`,
      )
      .join(', ')
  }

  return `${transition.property || 'all'} ${transition.duration || 250}ms ${transition.easing || 'ease'} ${transition.delay || 0}ms`
}

export function generateClipPathCss(layer) {
  if (!layer.clip?.enabled) return ''

  if (layer.clip.mode === CLIP_MODES.SMART_CORNER) {
    return `  --cf-cut: ${layer.clip.cornerSize || 12}px;\n  clip-path: ${smartCornerClip('var(--cf-cut, 12px)')};`
  }

  if (layer.clip.mode === CLIP_MODES.FREE_POLYGON) {
    return `  clip-path: ${polygonPointsToCss(layer.clip.polygonPoints)};`
  }

  if (layer.clip.mode === CLIP_MODES.CUSTOM_CSS && layer.clip.cssValue) {
    return `  clip-path: ${layer.clip.cssValue};`
  }

  return layer.clip.cssValue ? `  clip-path: ${layer.clip.cssValue};` : ''
}

export function generateInsetBorderCss(layer) {
  if (!layer.insetBorder?.enabled) return ''

  const innerClass = `${layer.cssClass}_inner`
  const inset = layer.insetBorder.inset
  const insetValue = inset.linked
    ? unitValue(inset.top, inset.unit)
    : `${unitValue(inset.top, inset.unit)} ${unitValue(inset.right, inset.unit)} ${unitValue(inset.bottom, inset.unit)} ${unitValue(inset.left, inset.unit)}`

  return `.${innerClass} {
  position: absolute;
  inset: ${insetValue};
  background: ${layer.insetBorder.innerColor};
  clip-path: ${layer.insetBorder.syncClipPath ? 'inherit' : 'none'};
}`
}

export function generateHoverCss(layer, projectData) {
  const hover = layer.states?.hover
  if (!hover?.enabled) return ''

  const rootLayer = projectData.layers.layersById[projectData.layers.rootLayerId]
  const triggerClassByType = {
    self: layer.cssClass,
    parent: projectData.layers.layersById[layer.parentId]?.cssClass || layer.cssClass,
    root: rootLayer.cssClass,
    customSelector: hover.customSelector,
  }
  const triggerClass = triggerClassByType[hover.trigger] || layer.cssClass
  const selector =
    hover.target === 'self'
      ? `.${triggerClass}:hover${hover.trigger === 'self' ? '' : ` .${layer.cssClass}`}`
      : `.${triggerClass}:hover .${layer.cssClass}`
  const styles = hover.styles || {}
  const declarations = []

  if (styles.background) declarations.push(`  background: ${styles.background};`)
  if (styles.opacity !== undefined) declarations.push(`  opacity: ${styles.opacity};`)
  if (styles.transform) declarations.push(`  transform: ${transformValue(styles.transform)};`)
  if (styles.shadow?.enabled) declarations.push(`  box-shadow: ${shadowValue(styles.shadow)};`)

  if (!declarations.length) return ''

  return `${selector} {
${declarations.join('\n')}
}`
}

export function generateLayerCss(layer, projectData) {
  const isRoot = layer.id === projectData.layers.rootLayerId
  const transition = generateTransitionCss(layer.states?.hover?.transition)
  const boxShadow = shadowValue(layer.style.shadow)
  const positionLines = isRoot
    ? [
        '  position: relative;',
        `  width: ${projectData.editor.targetFrame.width}px;`,
        `  min-width: ${projectData.editor.targetFrame.minWidth}px;`,
        `  min-height: ${projectData.editor.targetFrame.minHeight}px;`,
        `  overflow: ${layer.layout?.overflow || 'hidden'};`,
      ]
    : [
        '  position: absolute;',
        `  left: ${unitValue(layer.position.x, layer.position.unit)};`,
        `  top: ${unitValue(layer.position.y, layer.position.unit)};`,
        `  width: ${unitValue(layer.position.width, layer.position.unit)};`,
        `  height: ${unitValue(layer.position.height, layer.position.unit)};`,
        `  overflow: ${layer.layout?.overflow || 'visible'};`,
      ]
  const declarations = [
    `.${layer.cssClass} {`,
    ...positionLines,
    `  background: ${layer.style.background};`,
    `  color: ${layer.style.color};`,
    `  opacity: ${layer.visible ? layer.style.opacity : 0};`,
    `  pointer-events: ${layer.layout?.pointerEvents || 'none'};`,
    `  z-index: ${layer.style.zIndex};`,
    `  transform: ${transformValue(layer.style.transform)};`,
    transition ? `  transition: ${transition};` : '',
    boxShadow ? `  box-shadow: ${boxShadow};` : '',
    layer.visible ? '' : '  display: none;',
    generateClipPathCss(layer),
    '}',
    generateInsetBorderCss(layer),
    generateHoverCss(layer, projectData),
  ].filter(Boolean)

  return declarations.join('\n')
}

export function generateProjectCss(projectData) {
  const layers = Object.values(projectData.layers.layersById)
  const content = projectData.layers.layersById[projectData.layers.rootLayerId].content
  const contentCss =
    content?.enabled &&
    `.${content.className} {
  position: relative;
  z-index: 10;
  padding: ${unitValue(content.padding.top, content.padding.unit)} ${unitValue(content.padding.right, content.padding.unit)} ${unitValue(content.padding.bottom, content.padding.unit)} ${unitValue(content.padding.left, content.padding.unit)};
}`

  return [...layers.map((layer) => generateLayerCss(layer, projectData)), contentCss]
    .filter(Boolean)
    .join('\n\n')
}
