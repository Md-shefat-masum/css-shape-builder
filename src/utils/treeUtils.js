export function collectDescendantIds(layerId, layersById) {
  const layer = layersById[layerId]
  if (!layer) return []

  return layer.children.flatMap((childId) => [
    childId,
    ...collectDescendantIds(childId, layersById),
  ])
}

export function buildLayerTree(layerId, layersById) {
  const layer = layersById[layerId]
  if (!layer) return null

  return {
    ...layer,
    childrenData: layer.children
      .map((childId) => buildLayerTree(childId, layersById))
      .filter(Boolean),
  }
}
