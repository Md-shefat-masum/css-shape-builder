<script>
import { CLIP_MODES } from '../../constants/clipPresets'
import { polygonPointsToCss, smartCornerClip } from '../../utils/clipPath'

export default {
  name: 'PreviewLayerRenderer',
  props: {
    layerId: {
      type: String,
      required: true,
    },
    layersById: {
      type: Object,
      required: true,
    },
    isRoot: {
      type: Boolean,
      default: false,
    },
    hideRootBackgroundImage: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    layer() {
      return this.layersById[this.layerId] || null
    },
    childIds() {
      return this.layer?.children || []
    },
    tagName() {
      return this.isRoot ? 'div' : this.layer?.tagName || 'span'
    },
    layerClasses() {
      if (!this.layer) return []

      return [this.layer.cssClass, this.isRoot ? 'clipframe_root' : 'cf-preview-layer']
    },
    layerStyle() {
      const layer = this.layer
      if (!layer) return {}

      const style = {
        position: this.isRoot ? 'relative' : 'absolute',
        background: this.getLayerBackground(layer),
        color: layer.style.color,
        opacity: layer.style.opacity,
        zIndex: layer.style.zIndex,
        overflow: layer.layout?.overflow || (this.isRoot ? 'hidden' : 'visible'),
        clipPath: this.getClipPath(layer),
        pointerEvents: 'none',
        transform: this.buildTransform(layer.style.transform),
        boxShadow: this.getShadow(layer.style.shadow),
        borderWidth: `${layer.style.borderWidth || 0}px`,
        borderColor: layer.style.borderColor || 'transparent',
        borderStyle: layer.style.borderStyle || 'solid',
        borderRadius: `${layer.style.borderRadius || 0}px`,
      }

      if (this.isRoot) {
        return {
          ...style,
          width: '100%',
          height: '100%',
        }
      }

      return {
        ...style,
        left: `${layer.position.x}${layer.position.unit}`,
        top: `${layer.position.y}${layer.position.unit}`,
        width: `${layer.position.width}${layer.position.unit}`,
        height: `${layer.position.height}${layer.position.unit}`,
      }
    },
    contentStyle() {
      const padding = this.layer?.content?.padding
      if (!padding) return {}

      return {
        padding: `${padding.top}${padding.unit} ${padding.right}${padding.unit} ${padding.bottom}${padding.unit} ${padding.left}${padding.unit}`,
      }
    },
    insetBorderStyle() {
      const insetBorder = this.layer?.insetBorder
      if (!insetBorder?.enabled) return {}

      const inset = insetBorder.inset
      const insetValue = inset.linked
        ? `${inset.top}${inset.unit}`
        : `${inset.top}${inset.unit} ${inset.right}${inset.unit} ${inset.bottom}${inset.unit} ${inset.left}${inset.unit}`

      return {
        position: 'absolute',
        inset: insetValue,
        background: insetBorder.innerColor,
        clipPath: insetBorder.syncClipPath ? 'inherit' : 'none',
        pointerEvents: 'none',
      }
    },
    insetBorderClass() {
      return this.layer ? `${this.layer.cssClass}_inner` : ''
    },
  },
  methods: {
    buildTransform(transform = {}) {
      return `translate(${transform.translateX || 0}px, ${transform.translateY || 0}px) scale(${transform.scale ?? 1}) rotate(${transform.rotate || 0}deg)`
    },
    getShadow(shadow = {}) {
      if (!shadow.enabled) return undefined

      return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
    },
    getClipPath(layer) {
      if (!layer.clip?.enabled) return undefined

      if (layer.clip.mode === CLIP_MODES.SMART_CORNER) {
        return smartCornerClip(layer.clip.cornerSize || 12)
      }

      if (layer.clip.mode === CLIP_MODES.FREE_POLYGON) {
        return polygonPointsToCss(layer.clip.polygonPoints) || undefined
      }

      return layer.clip.cssValue || undefined
    },
    shouldHideLayerBackgroundImage(layer) {
      return this.isRoot && this.hideRootBackgroundImage && layer.style.background?.includes('url(')
    },
    getLayerBackground(layer) {
      return this.shouldHideLayerBackgroundImage(layer) ? 'transparent' : layer.style.background
    },
  },
}
</script>

<template>
  <component
    :is="tagName"
    v-if="layer && (isRoot || layer.visible)"
    :class="layerClasses"
    :style="layerStyle"
  >
    <span v-if="layer.insetBorder?.enabled" :class="insetBorderClass" :style="insetBorderStyle"></span>

    <PreviewLayerRenderer
      v-for="childId in childIds"
      :key="childId"
      :layer-id="childId"
      :layers-by-id="layersById"
      :hide-root-background-image="hideRootBackgroundImage"
    />

    <div
      v-if="isRoot && layer.content?.enabled"
      class="cf-preview-layer-content"
      :class="layer.content.className"
      :style="contentStyle"
    >
      {{ layer.content.text }}
    </div>
  </component>
</template>
