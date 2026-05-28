<script>
import { mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'
import { useLayerStore } from '../../stores/layerStore'
import { polygonPointsToCss } from '../../utils/clipPath'
import ClipPointHandle from './ClipPointHandle.vue'
import ResizeHandle from './ResizeHandle.vue'

export default {
  name: 'ElementRenderer',
  components: {
    ClipPointHandle,
    ResizeHandle,
  },
  props: {
    layerId: {
      type: String,
      required: true,
    },
  },
  emits: ['element-mouse-down', 'resize-start', 'clip-point-mouse-down'],
  computed: {
    ...mapState(useEditorStore, ['currentTool', 'selectedElementId']),
    ...mapState(useLayerStore, ['layersById']),
    layer() {
      return this.layersById[this.layerId]
    },
    isSelected() {
      return this.layer && this.selectedElementId === this.layerId
    },
    areEditorHandlesVisible() {
      return this.currentTool !== 'preview'
    },
    shouldShowClipPoints() {
      return (
        this.areEditorHandlesVisible &&
        this.isSelected &&
        this.currentTool === 'clipEdit' &&
        this.layer &&
        this.layer.clip.enabled &&
        this.layer.clip.polygonPoints.length > 0
      )
    },
    shouldShowResizeHandle() {
      return (
        this.areEditorHandlesVisible &&
        this.isSelected &&
        this.currentTool === 'select' &&
        this.layer &&
        !this.layer.locked
      )
    },
    editorElementStyle() {
      const layer = this.layer
      if (!layer) return {}

      return {
        position: 'absolute',
        left: `${layer.position.x}${layer.position.unit}`,
        top: `${layer.position.y}${layer.position.unit}`,
        width: `${layer.position.width}${layer.position.unit}`,
        height: `${layer.position.height}${layer.position.unit}`,
        background: layer.style.background,
        color: layer.style.color,
        opacity: layer.style.opacity,
        zIndex: layer.style.zIndex,
        clipPath: this.computedClipPath,
        overflow: layer.layout.overflow,
        pointerEvents: this.currentTool === 'preview' ? 'none' : 'auto',
        transform: this.buildTransform(layer.style.transform),
      }
    },
    computedClipPath() {
      if (!this.layer) return undefined
      if (!this.layer.clip.enabled) return undefined
      if (this.layer.clip.mode === 'freePolygon') {
        return polygonPointsToCss(this.layer.clip.polygonPoints) || undefined
      }

      return this.layer.clip.cssValue || undefined
    },
  },
  methods: {
    buildTransform(transform = {}) {
      return `translate(${transform.translateX || 0}px, ${transform.translateY || 0}px) scale(${transform.scale ?? 1}) rotate(${transform.rotate || 0}deg)`
    },
    handleMouseDown(event) {
      if (this.currentTool !== 'select') return

      this.$emit('element-mouse-down', event, this.layerId)
    },
    emitResizeStart(event, handle) {
      this.$emit('resize-start', event, this.layerId, handle)
    },
    emitClipPointMouseDown(event, layerId, pointId) {
      this.$emit('clip-point-mouse-down', event, layerId, pointId)
    },
  },
}
</script>

<template>
  <span
    v-if="layer && layer.visible"
    :class="[
      'cf-editor-element',
      {
        'is-selected': isSelected && areEditorHandlesVisible,
        'is-locked': layer.locked,
      },
    ]"
    :data-layer-id="layer.id"
    data-editor-element="true"
    :style="editorElementStyle"
    @mousedown="handleMouseDown"
  >
    <ElementRenderer
      v-for="childId in layer.children"
      :key="childId"
      :layer-id="childId"
      @element-mouse-down="(...args) => $emit('element-mouse-down', ...args)"
      @resize-start="(...args) => $emit('resize-start', ...args)"
      @clip-point-mouse-down="(...args) => $emit('clip-point-mouse-down', ...args)"
    />

    <ClipPointHandle
      v-for="point in layer.clip.polygonPoints"
      v-show="shouldShowClipPoints"
      :key="point.id"
      :point="point"
      :layer-id="layer.id"
      @clip-point-mouse-down="emitClipPointMouseDown"
    />

    <ResizeHandle v-if="shouldShowResizeHandle" placement="se" @resize-start="emitResizeStart" />
  </span>
</template>
