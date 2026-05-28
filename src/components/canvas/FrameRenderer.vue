<script>
import { mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'
import { useLayerStore } from '../../stores/layerStore'
import { polygonPointsToCss } from '../../utils/clipPath'
import ClipPointHandle from './ClipPointHandle.vue'
import ElementRenderer from './ElementRenderer.vue'

export default {
  name: 'FrameRenderer',
  components: {
    ClipPointHandle,
    ElementRenderer,
  },
  emits: ['element-mouse-down', 'resize-start', 'clip-point-mouse-down'],
  computed: {
    ...mapState(useEditorStore, ['currentTool', 'selectedElementId', 'targetFrame', 'canvas']),
    ...mapState(useLayerStore, ['rootLayer']),
    isSelected() {
      return this.selectedElementId === this.rootLayer.id
    },
    areEditorHandlesVisible() {
      return this.currentTool !== 'preview'
    },
    shouldShowClipPoints() {
      return (
        this.areEditorHandlesVisible &&
        this.isSelected &&
        this.currentTool === 'clipEdit' &&
        this.rootLayer.clip.enabled &&
        this.rootLayer.clip.polygonPoints.length > 0
      )
    },
    shouldHideRootBackgroundImage() {
      return this.currentTool === 'preview' && this.rootLayer.style.background?.includes('url(')
    },
    renderedRootBackground() {
      return this.shouldHideRootBackgroundImage ? 'transparent' : this.rootLayer.style.background
    },
    frameStyle() {
      return {
        width: `${this.targetFrame.width}px`,
        height: `${this.targetFrame.height}px`,
        background: this.renderedRootBackground,
        color: this.rootLayer.style.color,
        opacity: this.rootLayer.style.opacity,
        clipPath: this.computedClipPath,
        overflow: this.rootLayer.layout.overflow,
      }
    },
    computedClipPath() {
      if (!this.rootLayer.clip.enabled) return undefined
      if (this.rootLayer.clip.mode === 'freePolygon') {
        return polygonPointsToCss(this.rootLayer.clip.polygonPoints) || undefined
      }

      return this.rootLayer.clip.cssValue || undefined
    },
    contentPaddingStyle() {
      const padding = this.rootLayer.content.padding

      return {
        padding: `${padding.top}${padding.unit} ${padding.right}${padding.unit} ${padding.bottom}${padding.unit} ${padding.left}${padding.unit}`,
      }
    },
  },
  methods: {
    emitElementMouseDown(event, layerId) {
      this.$emit('element-mouse-down', event, layerId)
    },
    emitResizeStart(event, layerId, handle) {
      this.$emit('resize-start', event, layerId, handle)
    },
    emitClipPointMouseDown(event, layerId, pointId) {
      this.$emit('clip-point-mouse-down', event, layerId, pointId)
    },
  },
}
</script>

<template>
  <article
    class="cf-design-frame cf-editor-root"
    :class="{ 'is-selected': isSelected && areEditorHandlesVisible }"
    :style="frameStyle"
    :data-layer-id="rootLayer.id"
  >
    <img
      v-if="canvas.backgroundImage"
      class="cf-reference-image"
      :src="canvas.backgroundImage"
      :style="{ opacity: canvas.backgroundOpacity }"
      alt=""
    />

    <ElementRenderer
      v-for="childId in rootLayer.children"
      :key="childId"
      :layer-id="childId"
      @element-mouse-down="emitElementMouseDown"
      @resize-start="emitResizeStart"
      @clip-point-mouse-down="emitClipPointMouseDown"
    />

    <div
      v-if="rootLayer.content.enabled"
      class="cf-editor-content"
      :class="rootLayer.content.className"
      :style="contentPaddingStyle"
    >
      <!-- <p class="text-[10px] uppercase tracking-[0.28em] text-cyan-200">Export Ready</p>
      <h1>ClipFrame Product Card</h1>
      <p>{{ rootLayer.content.text }}</p>
      <button type="button">Preview Button</button> -->
    </div>

    <ClipPointHandle
      v-for="point in rootLayer.clip.polygonPoints"
      v-show="shouldShowClipPoints"
      :key="point.id"
      :point="point"
      :layer-id="rootLayer.id"
      @clip-point-mouse-down="emitClipPointMouseDown"
    />
  </article>
</template>
