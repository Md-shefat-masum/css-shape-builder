import { defineStore } from 'pinia'

import { EDITOR_TOOL_OPTIONS, EDITOR_TOOLS } from '../constants/editorTools'
import { FRAME_PRESETS, ZOOM_LEVELS } from '../constants/framePresets'
import { clamp } from '../utils/geometry'
import { useProjectStore } from './projectStore'

const productCardPreset = FRAME_PRESETS.find((preset) => preset.id === 'product-card')

export const useEditorStore = defineStore('editorStore', {
  state: () => ({
    currentTool: EDITOR_TOOLS.SELECT,
    selectedElementId: 'root',
    selectedClipPoint: {
      layerId: null,
      pointId: null,
    },
    viewport: {
      device: 'Desktop',
      zoom: 1,
      panX: 0,
      panY: 0,
    },
    canvas: {
      showGrid: true,
      snapToGrid: true,
      gridSize: 10,
      backgroundOpacity: 0.84,
      backgroundImage: null,
    },
    targetFrame: {
      width: productCardPreset.width,
      height: productCardPreset.height,
      minWidth: 180,
      minHeight: 48,
      preset: productCardPreset.id,
      presetLabel: productCardPreset.label,
    },
    ui: {
      rightPanelTab: 'Style',
      bottomPanelTab: 'CSS Output',
      inspectorSection: 'style',
      previewMode: false,
      isDragging: false,
      isResizing: false,
      isPanning: false,
      fitRequestId: 0,
      mouse: {
        x: 0,
        y: 0,
        percentX: 0,
        percentY: 0,
      },
    },
  }),
  getters: {
    project() {
      const projectStore = useProjectStore()

      return {
        id: projectStore.currentProjectMeta.id,
        name: projectStore.currentProjectMeta.name,
        productName: 'ClipFrame CSS Builder',
        tagline: 'Visual CSS clip-path frame builder',
      }
    },
    tools() {
      return EDITOR_TOOL_OPTIONS
    },
    zoomLevels() {
      return ZOOM_LEVELS
    },
    framePresets() {
      return FRAME_PRESETS
    },
    frame(state) {
      return {
        ...state.targetFrame,
        preset: state.targetFrame.presetLabel,
        clipMode: 'Smart Corner',
        cornerSize: 12,
        backgroundOpacity: Math.round(state.canvas.backgroundOpacity * 100),
      }
    },
    activeRightTab(state) {
      return state.ui.rightPanelTab
    },
    activeBottomTab(state) {
      return state.ui.bottomPanelTab
    },
    legacyViewport(state) {
      return {
        ...state.viewport,
        zoom: Math.round(state.viewport.zoom * 100),
        grid: state.canvas.showGrid,
        snap: state.canvas.snapToGrid,
        mode: state.currentTool,
      }
    },
  },
  actions: {
    setTool(toolName) {
      this.currentTool = toolName
    },

    setMode(mode) {
      this.setTool(mode)
    },

    selectElement(elementId) {
      this.selectedElementId = elementId
      this.clearSelectedClipPoint()
    },

    clearSelection() {
      this.selectedElementId = 'root'
      this.clearSelectedClipPoint()
    },

    selectClipPoint(layerId, pointId) {
      this.selectedClipPoint = {
        layerId,
        pointId,
      }
    },

    clearSelectedClipPoint() {
      this.selectedClipPoint = {
        layerId: null,
        pointId: null,
      }
    },

    setZoom(value) {
      this.viewport.zoom = clamp(Number(value), ZOOM_LEVELS[0], ZOOM_LEVELS[ZOOM_LEVELS.length - 1])
    },

    zoomIn() {
      const nextZoom =
        ZOOM_LEVELS.find((level) => level > this.viewport.zoom + 0.001) ||
        ZOOM_LEVELS[ZOOM_LEVELS.length - 1]

      this.setZoom(nextZoom)
    },

    zoomOut() {
      const previousZoom =
        [...ZOOM_LEVELS].reverse().find((level) => level < this.viewport.zoom - 0.001) ||
        ZOOM_LEVELS[0]

      this.setZoom(previousZoom)
    },

    fitToScreen(payload = null) {
      if (!payload) {
        this.ui.fitRequestId += 1
        return
      }

      const scaleX = payload.containerWidth / this.targetFrame.width
      const scaleY = payload.containerHeight / this.targetFrame.height
      const zoom = clamp(
        Math.min(scaleX, scaleY) * 0.85,
        ZOOM_LEVELS[0],
        ZOOM_LEVELS[ZOOM_LEVELS.length - 1],
      )

      this.setZoom(Number(zoom.toFixed(2)))
      this.setPan(40, 40)
    },

    setPan(x, y) {
      this.viewport.panX = x
      this.viewport.panY = y
    },

    resetPan() {
      this.viewport.panX = 0
      this.viewport.panY = 0
    },

    toggleGrid() {
      this.canvas.showGrid = !this.canvas.showGrid
    },

    toggleSnap() {
      this.canvas.snapToGrid = !this.canvas.snapToGrid
    },

    setBackgroundImage(imageDataUrl) {
      this.canvas.backgroundImage = imageDataUrl
    },

    setBackgroundOpacity(value) {
      this.canvas.backgroundOpacity = value
    },

    setTargetFrameSize(payload = {}) {
      this.targetFrame = {
        ...this.targetFrame,
        ...payload,
      }
    },

    applyFramePreset(presetId) {
      const preset = FRAME_PRESETS.find((item) => item.id === presetId)
      if (!preset) return

      this.setTargetFrameSize({
        width: preset.width,
        height: preset.height,
        minWidth: preset.minWidth,
        minHeight: preset.minHeight,
        preset: preset.id,
        presetLabel: preset.label,
      })

      this.fitToScreen()
    },

    setRightPanelTab(tab) {
      this.ui.rightPanelTab = tab
    },

    setBottomPanelTab(tab) {
      this.ui.bottomPanelTab = tab
    },

    startDragging() {
      this.ui.isDragging = true
    },

    stopDragging() {
      this.ui.isDragging = false
    },

    startResizing() {
      this.ui.isResizing = true
    },

    stopResizing() {
      this.ui.isResizing = false
    },

    setMouseStatus(payload = {}) {
      this.ui.mouse = {
        ...this.ui.mouse,
        ...payload,
      }
    },
  },
})
