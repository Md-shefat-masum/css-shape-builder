import { defineStore } from 'pinia'

import { CLIP_MODES, SMART_CORNER_CLIP } from '../constants/clipPresets'
import { DEFAULT_INSET_BORDER } from '../constants/defaultStyles'
import {
  createDefaultElementLayer,
  createDefaultProject,
  createDefaultRootLayer,
} from '../services/projectFactory'
import {
  createDisplayNameFromTechnicalName,
  generateTechnicalName,
  regenerateChildNamesRecursively,
  technicalNameToCssClass,
} from '../services/namingService'
import { deepClone } from '../utils/deepClone'
import { buildLayerTree, collectDescendantIds } from '../utils/treeUtils'
import { useEditorStore } from './editorStore'
import { useProjectStore } from './projectStore'

const defaultProject = createDefaultProject({
  id: 'project_clipframe_demo',
  name: 'Untitled ClipFrame',
  slug: 'untitled-clipframe',
})

function currentCssPrefix() {
  const projectStore = useProjectStore()

  return projectStore.currentProjectMeta.cssPrefix || defaultProject.meta.cssPrefix
}

function nextLayerId() {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export const useLayerStore = defineStore('layerStore', {
  state: () => ({
    rootLayerId: 'root',
    layersById: {
      ...deepClone(defaultProject.layers.layersById),
    },
  }),
  getters: {
    rootLayer(state) {
      return state.layersById[state.rootLayerId]
    },

    allLayers(state) {
      return Object.values(state.layersById)
    },

    getLayerById: (state) => {
      return (id) => state.layersById[id] || null
    },

    selectedLayer() {
      const editor = useEditorStore()

      return this.getLayerById(editor.selectedElementId) || this.rootLayer
    },

    layerTree(state) {
      return buildLayerTree(state.rootLayerId, state.layersById)
    },

    rootChildrenTree() {
      return this.layerTree?.childrenData || []
    },

    clipPoints() {
      return this.rootLayer.clip.polygonPoints.length
        ? this.rootLayer.clip.polygonPoints
        : SMART_CORNER_CLIP.points
    },

    getLayerBreadcrumb: (state) => {
      return (layerId) => {
        const path = []
        let current = state.layersById[layerId]

        while (current) {
          path.unshift({
            id: current.id,
            technicalName: current.technicalName,
            displayName: current.displayName,
          })

          current = state.layersById[current.parentId]
        }

        return path
      }
    },
  },
  actions: {
    createRootLayer(cssPrefix = currentCssPrefix()) {
      this.layersById.root = createDefaultRootLayer(cssPrefix)
    },

    addElement(parentId = 'root', payload = {}) {
      if (typeof parentId === 'object') {
        return this.addChildElement(parentId.parentId || 'root', parentId)
      }

      return this.addChildElement(parentId, payload)
    },

    addChildElement(parentId = 'root', payload = {}) {
      const parentLayer = this.layersById[parentId]
      if (!parentLayer || parentLayer.locked) return null

      const siblingIndex = parentLayer.children.length + 1
      const technicalName =
        payload.technicalName || generateTechnicalName(parentLayer, siblingIndex)
      const cssPrefix = payload.cssPrefix || currentCssPrefix()
      const layer = createDefaultElementLayer({
        ...payload,
        id: payload.id || nextLayerId(),
        parentId,
        technicalName,
        displayName: payload.displayName || createDisplayNameFromTechnicalName(technicalName),
        cssClass: payload.cssClass || technicalNameToCssClass(cssPrefix, technicalName),
        cssPrefix,
      })

      this.layersById[layer.id] = layer
      parentLayer.children.push(layer.id)

      return layer
    },

    updateLayer(layerId, patch) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      this.layersById[layerId] = {
        ...layer,
        ...patch,
      }
    },

    updateLayerStyle(layerId, stylePatch) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.style = {
        ...layer.style,
        ...stylePatch,
        transform: {
          ...layer.style.transform,
          ...stylePatch.transform,
        },
        shadow: {
          ...layer.style.shadow,
          ...stylePatch.shadow,
        },
      }
    },

    updateLayerPosition(layerId, positionPatch) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.position = {
        ...layer.position,
        ...positionPatch,
      }
    },

    renameLayer(layerId, displayName) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.displayName = displayName
    },

    deleteLayer(layerId) {
      const layer = this.layersById[layerId]
      if (!layer || layer.id === 'root' || layer.locked) return

      const idsToDelete = [layerId, ...collectDescendantIds(layerId, this.layersById)]
      const parent = this.layersById[layer.parentId]

      if (parent) {
        parent.children = parent.children.filter((id) => id !== layerId)
      }

      idsToDelete.forEach((id) => {
        delete this.layersById[id]
      })

      const editorStore = useEditorStore()
      if (idsToDelete.includes(editorStore.selectedElementId)) {
        editorStore.selectElement('root')
      }
    },

    duplicateLayer(layerId) {
      const sourceLayer = this.layersById[layerId]
      if (!sourceLayer || sourceLayer.id === 'root') return null

      const parentLayer = this.layersById[sourceLayer.parentId]
      if (!parentLayer || parentLayer.locked) return null

      const duplicateBranch = (sourceId, parentId) => {
        const source = this.layersById[sourceId]
        const parent = this.layersById[parentId]
        const siblingIndex = parent.children.length + 1
        const technicalName = generateTechnicalName(parent, siblingIndex)
        const duplicate = createDefaultElementLayer({
          ...deepClone(source),
          id: nextLayerId(),
          parentId,
          children: [],
          technicalName,
          displayName:
            sourceId === layerId
              ? `${source.displayName} Copy`
              : createDisplayNameFromTechnicalName(technicalName),
          cssPrefix: currentCssPrefix(),
          cssClass: technicalNameToCssClass(currentCssPrefix(), technicalName),
        })

        this.layersById[duplicate.id] = duplicate
        parent.children.push(duplicate.id)

        source.children.forEach((childId) => {
          duplicateBranch(childId, duplicate.id)
        })

        return duplicate
      }

      return duplicateBranch(layerId, sourceLayer.parentId)
    },

    toggleLayerVisibility(layerId) {
      const layer = this.layersById[layerId]
      if (!layer) return

      layer.visible = !layer.visible
    },

    toggleLayerLock(layerId) {
      const layer = this.layersById[layerId]
      if (!layer || layer.id === 'root') return

      layer.locked = !layer.locked
    },

    toggleLayerExpanded(layerId) {
      const layer = this.layersById[layerId]
      if (!layer) return

      layer.expanded = !layer.expanded
    },

    moveLayer(layerId, newParentId, newIndex = 0) {
      const layer = this.layersById[layerId]
      const newParent = this.layersById[newParentId]
      if (!layer || !newParent || layer.locked || layer.id === 'root') return

      const oldParent = this.layersById[layer.parentId]
      if (oldParent) {
        oldParent.children = oldParent.children.filter((id) => id !== layerId)
      }

      layer.parentId = newParentId
      newParent.children.splice(newIndex, 0, layerId)

      if (oldParent) {
        regenerateChildNamesRecursively(oldParent.id, this.layersById, currentCssPrefix())
      }
      regenerateChildNamesRecursively(newParentId, this.layersById, currentCssPrefix())
    },

    enableClip(layerId) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.clip.enabled = true
      if (layer.clip.mode === CLIP_MODES.NONE) {
        layer.clip.mode = CLIP_MODES.FREE_POLYGON
      }
    },

    disableClip(layerId) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.clip.enabled = false
      layer.clip.mode = CLIP_MODES.NONE
    },

    setClipMode(layerId, mode) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.clip.mode = mode
      layer.clip.enabled = mode !== CLIP_MODES.NONE

      if (mode === CLIP_MODES.SMART_CORNER) {
        layer.clip.preset = SMART_CORNER_CLIP.id
        layer.clip.cornerSize = layer.clip.cornerSize || SMART_CORNER_CLIP.cornerSize
        layer.clip.cssValue = SMART_CORNER_CLIP.cssValue
      }
    },

    addClipPoint(layerId, point) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.clip.enabled = true
      layer.clip.mode = CLIP_MODES.FREE_POLYGON
      layer.clip.polygonPoints.push(point)
    },

    updateClipPoint(layerId, pointId, patch) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.clip.polygonPoints = layer.clip.polygonPoints.map((point) =>
        point.id === pointId ? { ...point, ...patch } : point,
      )
    },

    removeClipPoint(layerId, pointId) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.clip.polygonPoints = layer.clip.polygonPoints.filter((point) => point.id !== pointId)
    },

    enableInsetBorder(layerId) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      const innerLayerId = `${layer.id}_inner`
      layer.insetBorder = {
        ...deepClone(DEFAULT_INSET_BORDER),
        ...layer.insetBorder,
        inset: {
          ...deepClone(DEFAULT_INSET_BORDER.inset),
          ...layer.insetBorder?.inset,
        },
        enabled: true,
      }
      layer.insetBorder.innerLayerId = innerLayerId
    },

    updateInsetBorder(layerId, patch) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      const currentInsetBorder = {
        ...deepClone(DEFAULT_INSET_BORDER),
        ...layer.insetBorder,
        inset: {
          ...deepClone(DEFAULT_INSET_BORDER.inset),
          ...layer.insetBorder?.inset,
        },
      }

      layer.insetBorder = {
        ...currentInsetBorder,
        ...patch,
        inset: {
          ...currentInsetBorder.inset,
          ...patch.inset,
        },
      }
    },

    disableInsetBorder(layerId) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.insetBorder = {
        ...deepClone(DEFAULT_INSET_BORDER),
        ...layer.insetBorder,
        enabled: false,
        innerLayerId: null,
      }
    },

    updateHoverState(layerId, patch) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.states.hover = {
        ...layer.states.hover,
        ...patch,
        styles: {
          ...layer.states.hover.styles,
          ...patch.styles,
        },
        transition: {
          ...layer.states.hover.transition,
          ...patch.transition,
        },
      }
    },

    updateTransition(layerId, patch) {
      const layer = this.layersById[layerId]
      if (!layer || layer.locked) return

      layer.states.hover.transition = {
        ...layer.states.hover.transition,
        ...patch,
      }
    },

    resetRootClip() {
      this.rootLayer.clip.polygonPoints = []
      this.rootLayer.clip.cssValue = SMART_CORNER_CLIP.cssValue
      this.rootLayer.clip.mode = CLIP_MODES.SMART_CORNER
      this.rootLayer.clip.enabled = true
    },
  },
})
