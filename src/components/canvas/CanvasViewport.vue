<script>
import { mapActions, mapState } from 'pinia'

import { EDITOR_TOOLS } from '../../constants/editorTools'
import { createId } from '../../services/idService'
import { useEditorStore } from '../../stores/editorStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useLayerStore } from '../../stores/layerStore'
import { useProjectStore } from '../../stores/projectStore'
import { deepClone } from '../../utils/deepClone'
import {
  clamp,
  getLocalPoint,
  getUnscaledElementSize,
  pixelToPercent,
  snapPercentPoint,
  snapPixel,
} from '../../utils/geometry'
import FrameRenderer from './FrameRenderer.vue'
import GridOverlay from './GridOverlay.vue'
import RulerOverlay from './RulerOverlay.vue'

export default {
  name: 'CanvasViewport',
  components: {
    FrameRenderer,
    GridOverlay,
    RulerOverlay,
  },
  data() {
    return {
      panStart: null,
      moveStart: null,
      resizeStart: null,
      dragClipPoint: null,
      latestDragEvent: null,
      dragFrame: null,
      lastWheelZoomAt: 0,
      temporaryToolBase: null,
      temporaryToolStack: [],
    }
  },
  computed: {
    ...mapState(useEditorStore, [
      'canvas',
      'currentTool',
      'selectedElementId',
      'targetFrame',
      'ui',
      'viewport',
    ]),
    ...mapState(useLayerStore, ['layersById', 'selectedLayer']),
    stageTransformStyle() {
      return {
        transform: `translate(${this.viewport.panX}px, ${this.viewport.panY}px) scale(${this.viewport.zoom})`,
        transformOrigin: '0 0',
      }
    },
    canvasStageClasses() {
      return {
        'is-pan-tool': this.currentTool === EDITOR_TOOLS.PAN,
        'is-panning': this.ui.isPanning,
      }
    },
    transformClasses() {
      return {
        'is-interacting': this.ui.isPanning || this.ui.isDragging || this.ui.isResizing,
      }
    },
    shouldShowGrid() {
      return this.canvas.showGrid && this.currentTool !== EDITOR_TOOLS.PREVIEW
    },
  },
  watch: {
    'ui.fitRequestId'() {
      this.fitToScreen()
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('keyup', this.handleKeyup)
    window.addEventListener('blur', this.resetTemporaryTools)
    this.addCanvasWheelListener()
    this.$nextTick(() => this.fitToScreen())
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('keyup', this.handleKeyup)
    window.removeEventListener('blur', this.resetTemporaryTools)
    this.removeCanvasWheelListener()
    this.removeDragListeners()
    this.removePanListeners()
  },
  methods: {
    ...mapActions(useEditorStore, [
      'selectElement',
      'selectClipPoint',
      'setMouseStatus',
      'setPan',
      'setTool',
      'setZoom',
      'startDragging',
      'startResizing',
      'stopDragging',
      'stopResizing',
      'zoomIn',
      'zoomOut',
    ]),
    handleCanvasMouseDown(event) {
      if (this.currentTool === EDITOR_TOOLS.PREVIEW) return

      if (this.currentTool === EDITOR_TOOLS.SELECT) {
        this.selectElement('root')
        return
      }

      if (this.currentTool === EDITOR_TOOLS.PAN) {
        this.startPanning(event)
        return
      }

      if (this.currentTool === EDITOR_TOOLS.ELEMENT_ADD) {
        this.addElementAtPointer(event)
        return
      }

      if (this.currentTool === EDITOR_TOOLS.CLIP_DRAW) {
        this.addClipPointAtPointer(event)
      }
    },
    handleElementMouseDown(event, layerId) {
      if (this.currentTool !== EDITOR_TOOLS.SELECT) return

      event.stopPropagation()
      const layerStore = useLayerStore()
      const layer = layerStore.getLayerById(layerId)
      if (!layer) return

      this.selectElement(layerId)
      if (layer.locked) return

      this.startMoveElement(event, layerId)
    },
    startPanning(event) {
      this.panStart = {
        mouseX: event.clientX,
        mouseY: event.clientY,
        panX: this.viewport.panX,
        panY: this.viewport.panY,
      }
      useEditorStore().ui.isPanning = true

      window.addEventListener('mousemove', this.handlePanning)
      window.addEventListener('mouseup', this.stopPanning)
    },
    handlePanning(event) {
      if (!this.panStart) return

      const dx = event.clientX - this.panStart.mouseX
      const dy = event.clientY - this.panStart.mouseY

      this.setPan(this.panStart.panX + dx, this.panStart.panY + dy)
    },
    stopPanning() {
      useEditorStore().ui.isPanning = false
      this.panStart = null
      this.removePanListeners()
    },
    addElementAtPointer(event) {
      const layerStore = useLayerStore()
      const historyStore = useHistoryStore()
      const projectStore = useProjectStore()
      const selectedLayer = layerStore.getLayerById(this.selectedElementId) || layerStore.rootLayer
      const parentId =
        selectedLayer.type === 'frame' || selectedLayer.type === 'element'
          ? selectedLayer.id
          : 'root'
      const parentElement = this.getLayerElement(parentId)
      if (!parentElement) return

      const parentSize = this.getLayerRenderedSize(parentId)
      let point = pixelToPercent(
        ...Object.values(getLocalPoint(event, parentElement, this.viewport.zoom)),
        parentSize.width,
        parentSize.height,
      )

      if (this.canvas.snapToGrid) {
        point = snapPercentPoint(point, this.canvas.gridSize, parentSize)
      }

      const newLayer = layerStore.addElement(parentId, {
        x: clamp(point.x, 0, 100),
        y: clamp(point.y, 0, 100),
        width: 20,
        height: 5,
      })

      if (!newLayer) return

      this.selectElement(newLayer.id)
      historyStore.addHistory({
        type: 'ELEMENT_ADDED',
        label: 'Element Added',
        layerId: newLayer.id,
      })
      projectStore.saveCurrentProjectDebounced()
    },
    addClipPointAtPointer(event) {
      const layerStore = useLayerStore()
      const historyStore = useHistoryStore()
      const projectStore = useProjectStore()
      const selectedLayer = layerStore.selectedLayer

      if (!selectedLayer || !selectedLayer.clip.enabled || selectedLayer.locked) return

      const layerElement = this.getLayerElement(selectedLayer.id)
      if (!layerElement) return

      const size = this.getLayerRenderedSize(selectedLayer.id)
      const localPoint = getLocalPoint(event, layerElement, this.viewport.zoom)
      let point = pixelToPercent(localPoint.x, localPoint.y, size.width, size.height)

      if (this.canvas.snapToGrid) {
        point = snapPercentPoint(point, this.canvas.gridSize, size)
      }

      layerStore.addClipPoint(selectedLayer.id, {
        id: createId('pt'),
        x: clamp(point.x, 0, 100),
        y: clamp(point.y, 0, 100),
        unit: '%',
      })
      const createdPoint = selectedLayer.clip.polygonPoints.at(-1)
      if (createdPoint) {
        this.selectClipPoint(selectedLayer.id, createdPoint.id)
      }
      historyStore.addHistory({
        type: 'POINT_ADDED',
        label: 'Point Added',
        layerId: selectedLayer.id,
      })
      projectStore.saveCurrentProjectDebounced()
    },
    startMoveElement(event, layerId) {
      const layerStore = useLayerStore()
      const historyStore = useHistoryStore()
      const layer = layerStore.getLayerById(layerId)
      if (!layer || layer.locked || layer.id === 'root') return

      this.moveStart = {
        layerId,
        mouseX: event.clientX,
        mouseY: event.clientY,
        originalX: layer.position.x,
        originalY: layer.position.y,
      }
      historyStore.pushUndoSnapshot({ layersById: deepClone(layerStore.layersById) })
      this.startDragging()
      window.addEventListener('mousemove', this.handleMoveElement)
      window.addEventListener('mouseup', this.stopMoveElement)
    },
    handleMoveElement(event) {
      this.latestDragEvent = event
      this.scheduleDragUpdate(() => this.applyMoveElement(this.latestDragEvent))
    },
    applyMoveElement(event) {
      if (!this.moveStart || !event) return

      const layerStore = useLayerStore()
      const layer = layerStore.getLayerById(this.moveStart.layerId)
      if (!layer) return

      const parentSize = this.getLayerRenderedSize(layer.parentId)
      const dxPx = (event.clientX - this.moveStart.mouseX) / this.viewport.zoom
      const dyPx = (event.clientY - this.moveStart.mouseY) / this.viewport.zoom
      if (layer.position.unit === 'px') {
        let nextX = this.moveStart.originalX + dxPx
        let nextY = this.moveStart.originalY + dyPx

        if (this.canvas.snapToGrid) {
          nextX = snapPixel(nextX, this.canvas.gridSize)
          nextY = snapPixel(nextY, this.canvas.gridSize)
        }

        layerStore.updateLayerPosition(layer.id, {
          x: Number(clamp(nextX, 0, parentSize.width).toFixed(2)),
          y: Number(clamp(nextY, 0, parentSize.height).toFixed(2)),
        })
        return
      }

      const dxPercent = (dxPx / parentSize.width) * 100
      const dyPercent = (dyPx / parentSize.height) * 100
      let nextPoint = {
        x: this.moveStart.originalX + dxPercent,
        y: this.moveStart.originalY + dyPercent,
      }

      if (this.canvas.snapToGrid) {
        nextPoint = snapPercentPoint(nextPoint, this.canvas.gridSize, parentSize)
      }

      layerStore.updateLayerPosition(layer.id, {
        x: Number(clamp(nextPoint.x, 0, 100).toFixed(2)),
        y: Number(clamp(nextPoint.y, 0, 100).toFixed(2)),
      })
    },
    stopMoveElement() {
      if (!this.moveStart) return

      useHistoryStore().addHistory({
        type: 'ELEMENT_MOVED',
        label: 'Element Moved',
        layerId: this.moveStart.layerId,
      })
      useProjectStore().saveCurrentProjectDebounced()
      this.moveStart = null
      this.stopDragging()
      this.removeDragListeners()
    },
    startResizeElement(event, layerId, handle) {
      if (this.currentTool !== EDITOR_TOOLS.SELECT) return

      const layerStore = useLayerStore()
      const layer = layerStore.getLayerById(layerId)
      if (!layer || layer.locked || layer.id === 'root') return

      this.resizeStart = {
        layerId,
        handle,
        mouseX: event.clientX,
        mouseY: event.clientY,
        originalPosition: { ...layer.position },
      }
      useHistoryStore().pushUndoSnapshot({ layersById: deepClone(layerStore.layersById) })
      this.startResizing()
      window.addEventListener('mousemove', this.handleResizeElement)
      window.addEventListener('mouseup', this.stopResizeElement)
    },
    handleResizeElement(event) {
      this.latestDragEvent = event
      this.scheduleDragUpdate(() => this.applyResizeElement(this.latestDragEvent))
    },
    applyResizeElement(event) {
      if (!this.resizeStart || !event) return

      const layerStore = useLayerStore()
      const layer = layerStore.getLayerById(this.resizeStart.layerId)
      if (!layer) return

      const parentSize = this.getLayerRenderedSize(layer.parentId)
      const dxPx = (event.clientX - this.resizeStart.mouseX) / this.viewport.zoom
      const dyPx = (event.clientY - this.resizeStart.mouseY) / this.viewport.zoom
      if (layer.position.unit === 'px') {
        let nextWidth = this.resizeStart.originalPosition.width + dxPx
        let nextHeight = this.resizeStart.originalPosition.height + dyPx

        if (this.canvas.snapToGrid) {
          nextWidth = snapPixel(nextWidth, this.canvas.gridSize)
          nextHeight = snapPixel(nextHeight, this.canvas.gridSize)
        }

        layerStore.updateLayerPosition(layer.id, {
          width: Number(clamp(nextWidth, 1, parentSize.width).toFixed(2)),
          height: Number(clamp(nextHeight, 1, parentSize.height).toFixed(2)),
        })
        return
      }

      const dxPercent = (dxPx / parentSize.width) * 100
      const dyPercent = (dyPx / parentSize.height) * 100
      let nextSize = {
        x: this.resizeStart.originalPosition.width + dxPercent,
        y: this.resizeStart.originalPosition.height + dyPercent,
      }

      if (this.canvas.snapToGrid) {
        nextSize = snapPercentPoint(nextSize, this.canvas.gridSize, parentSize)
      }

      layerStore.updateLayerPosition(layer.id, {
        width: Number(clamp(nextSize.x, 1, 100).toFixed(2)),
        height: Number(clamp(nextSize.y, 1, 100).toFixed(2)),
      })
    },
    stopResizeElement() {
      if (!this.resizeStart) return

      useHistoryStore().addHistory({
        type: 'ELEMENT_RESIZED',
        label: 'Element Resized',
        layerId: this.resizeStart.layerId,
      })
      useProjectStore().saveCurrentProjectDebounced()
      this.resizeStart = null
      this.stopResizing()
      this.removeDragListeners()
    },
    startDragClipPoint(event, layerId, pointId) {
      if (this.currentTool !== EDITOR_TOOLS.CLIP_EDIT) return

      const layerStore = useLayerStore()
      const layer = layerStore.getLayerById(layerId)
      if (!layer || layer.locked) return

      this.selectClipPoint(layerId, pointId)
      this.dragClipPoint = { layerId, pointId }
      useHistoryStore().pushUndoSnapshot({ layersById: deepClone(layerStore.layersById) })
      this.startDragging()
      window.addEventListener('mousemove', this.handleDragClipPoint)
      window.addEventListener('mouseup', this.stopDragClipPoint)
    },
    handleDragClipPoint(event) {
      this.latestDragEvent = event
      this.scheduleDragUpdate(() => this.applyDragClipPoint(this.latestDragEvent))
    },
    applyDragClipPoint(event) {
      if (!this.dragClipPoint || !event) return

      const layerStore = useLayerStore()
      const layer = layerStore.getLayerById(this.dragClipPoint.layerId)
      const layerElement = this.getLayerElement(this.dragClipPoint.layerId)
      if (!layer || !layerElement) return

      const size = this.getLayerRenderedSize(layer.id)
      const localPoint = getLocalPoint(event, layerElement, this.viewport.zoom)
      let point = pixelToPercent(localPoint.x, localPoint.y, size.width, size.height)

      point.x = clamp(point.x, 0, 100)
      point.y = clamp(point.y, 0, 100)

      if (this.canvas.snapToGrid) {
        point = snapPercentPoint(point, this.canvas.gridSize, size)
      }

      layerStore.updateClipPoint(layer.id, this.dragClipPoint.pointId, {
        x: Number(point.x.toFixed(2)),
        y: Number(point.y.toFixed(2)),
      })
    },
    stopDragClipPoint() {
      if (!this.dragClipPoint) return

      useHistoryStore().addHistory({
        type: 'POINT_MOVED',
        label: 'Point Moved',
        layerId: this.dragClipPoint.layerId,
      })
      useProjectStore().saveCurrentProjectDebounced()
      this.dragClipPoint = null
      this.stopDragging()
      this.removeDragListeners()
    },
    handlePointerMove(event) {
      const frameElement = this.getLayerElement('root')
      if (!frameElement) return

      const localPoint = getLocalPoint(event, frameElement, this.viewport.zoom)
      const percentPoint = pixelToPercent(
        localPoint.x,
        localPoint.y,
        this.targetFrame.width,
        this.targetFrame.height,
      )

      this.setMouseStatus({
        x: Number(localPoint.x.toFixed(0)),
        y: Number(localPoint.y.toFixed(0)),
        percentX: clamp(percentPoint.x, 0, 100),
        percentY: clamp(percentPoint.y, 0, 100),
      })
    },
    handleWheel(event) {
      if (!event.metaKey && !event.ctrlKey) return

      if (event.cancelable) {
        event.preventDefault()
      }
      event.stopPropagation()
      const now = performance.now()
      if (now - this.lastWheelZoomAt < 90) return

      this.lastWheelZoomAt = now
      if (event.deltaY < 0) {
        this.zoomIn()
        return
      }

      if (event.deltaY > 0) {
        this.zoomOut()
      }
    },
    fitToScreen() {
      const container = this.$refs.viewportContainer
      if (!container) return

      useEditorStore().fitToScreen({
        containerWidth: container.clientWidth,
        containerHeight: container.clientHeight,
      })
    },
    getLayerElement(layerId) {
      return this.$el.querySelector(`[data-layer-id="${layerId}"]`)
    },
    getLayerRenderedSize(layerId) {
      const element = this.getLayerElement(layerId)
      if (!element) {
        return {
          width: this.targetFrame.width,
          height: this.targetFrame.height,
        }
      }

      return getUnscaledElementSize(element, this.viewport.zoom)
    },
    scheduleDragUpdate(callback) {
      if (this.dragFrame) return

      this.dragFrame = requestAnimationFrame(() => {
        callback()
        this.dragFrame = null
      })
    },
    removeDragListeners() {
      window.removeEventListener('mousemove', this.handleMoveElement)
      window.removeEventListener('mouseup', this.stopMoveElement)
      window.removeEventListener('mousemove', this.handleResizeElement)
      window.removeEventListener('mouseup', this.stopResizeElement)
      window.removeEventListener('mousemove', this.handleDragClipPoint)
      window.removeEventListener('mouseup', this.stopDragClipPoint)
    },
    removePanListeners() {
      window.removeEventListener('mousemove', this.handlePanning)
      window.removeEventListener('mouseup', this.stopPanning)
    },
    addCanvasWheelListener() {
      this.$refs.viewportContainer?.addEventListener('wheel', this.handleWheel, {
        capture: true,
        passive: false,
      })
    },
    removeCanvasWheelListener() {
      this.$refs.viewportContainer?.removeEventListener('wheel', this.handleWheel, true)
    },
    isEditableTarget(target) {
      return target?.matches?.('input, textarea, select, [contenteditable="true"]')
    },
    activateTemporaryTool(id, tool) {
      if (this.temporaryToolStack.some((item) => item.id === id)) return

      if (this.temporaryToolStack.length === 0) {
        this.temporaryToolBase = this.currentTool
      }
      this.temporaryToolStack.push({ id, tool })
      this.setTool(tool)
    },
    deactivateTemporaryTool(id) {
      const nextStack = this.temporaryToolStack.filter((item) => item.id !== id)
      if (nextStack.length === this.temporaryToolStack.length) return

      this.temporaryToolStack = nextStack
      if (this.temporaryToolStack.length > 0) {
        this.setTool(this.temporaryToolStack[this.temporaryToolStack.length - 1].tool)
        return
      }

      this.setTool(this.temporaryToolBase || EDITOR_TOOLS.SELECT)
      this.temporaryToolBase = null
    },
    resetTemporaryTools() {
      if (this.temporaryToolStack.length === 0) return

      this.setTool(this.temporaryToolBase || EDITOR_TOOLS.SELECT)
      this.temporaryToolBase = null
      this.temporaryToolStack = []
    },
    handleKeydown(event) {
      const key = event.key.toLowerCase()
      if (this.isEditableTarget(event.target)) return

      if (event.code === 'Space') {
        event.preventDefault()
        this.activateTemporaryTool('space-pan', EDITOR_TOOLS.PAN)
        return
      }

      if (key === 'control' || key === 'meta') {
        this.activateTemporaryTool('modifier-select', EDITOR_TOOLS.SELECT)
        return
      }

      if (key === 'v') this.setTool(EDITOR_TOOLS.SELECT)
      if (key === 'h') this.setTool(EDITOR_TOOLS.PAN)
      if (key === 'a') this.setTool(EDITOR_TOOLS.ELEMENT_ADD)
      if (key === 'p') this.setTool(EDITOR_TOOLS.CLIP_DRAW)
      if (key === 'e') this.setTool(EDITOR_TOOLS.CLIP_EDIT)
      if (key === 'escape') this.setTool(EDITOR_TOOLS.SELECT)
      if (key === 'delete' || key === 'backspace') {
        useLayerStore().deleteLayer(this.selectedElementId)
      }
      if ((event.metaKey || event.ctrlKey) && key === 's') {
        event.preventDefault()
        useProjectStore().saveCurrentProjectDebounced()
      }
    },
    handleKeyup(event) {
      const key = event.key.toLowerCase()

      if (event.code === 'Space') {
        event.preventDefault()
        this.deactivateTemporaryTool('space-pan')
        return
      }

      if (key === 'control' || key === 'meta') {
        this.deactivateTemporaryTool('modifier-select')
      }
    },
  },
}
</script>

<template>
  <div
    ref="viewportContainer"
    class="cf-canvas-stage"
    :class="canvasStageClasses"
    @mousedown="handleCanvasMouseDown"
    @mousemove="handlePointerMove"
  >
    <GridOverlay v-if="shouldShowGrid" :grid-size="canvas.gridSize" />
    <RulerOverlay v-if="currentTool !== 'preview'" />

    <div class="cf-canvas-transform" :class="transformClasses" :style="stageTransformStyle">
      <div class="cf-frame-shadow">
        <FrameRenderer
          @element-mouse-down="handleElementMouseDown"
          @resize-start="startResizeElement"
          @clip-point-mouse-down="startDragClipPoint"
        />
      </div>
    </div>
  </div>
</template>
