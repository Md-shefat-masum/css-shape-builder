<script>
import { Maximize2 } from 'lucide-vue-next'
import { mapState } from 'pinia'

import ExpandedPreviewModal from './ExpandedPreviewModal.vue'
import PreviewLayerRenderer from './PreviewLayerRenderer.vue'
import { useEditorStore } from '../../stores/editorStore'

export default {
  name: 'LivePreview',
  components: {
    ExpandedPreviewModal,
    Maximize2,
    PreviewLayerRenderer,
  },
  props: {
    targetWidth: {
      type: Number,
      default: 320,
    },
    targetHeight: {
      type: Number,
      default: 460,
    },
    rootLayerId: {
      type: String,
      default: 'root',
    },
    layersById: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      previewWidth: 200,
      previewHeight: 200,
      resizeObserver: null,
      isExpandedPreviewOpen: false,
    }
  },
  computed: {
    ...mapState(useEditorStore, ['currentTool']),
    scale() {
      if (!this.targetWidth || !this.targetHeight) return 1

      return Math.min(
        this.previewWidth / this.targetWidth,
        this.previewHeight / this.targetHeight,
        1
      )
    },
    scalePercent() {
      return Math.round(this.scale * 100)
    },
    scaledWidth() {
      return this.targetWidth * this.scale
    },
    scaledHeight() {
      return this.targetHeight * this.scale
    },
    stageStyle() {
      return {
        width: `${this.scaledWidth}px`,
        height: `${this.scaledHeight}px`,
      }
    },
    realSizeStyle() {
      return {
        width: `${this.targetWidth}px`,
        height: `${this.targetHeight}px`,
        transform: `scale(${this.scale})`,
        transformOrigin: 'top left',
      }
    },
    hasPreviewLayerTree() {
      return Boolean(this.layersById[this.rootLayerId])
    },
    shouldHideRootBackgroundImage() {
      return this.currentTool === 'preview'
    },
  },
  mounted() {
    this.setupResizeObserver()
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
  methods: {
    setupResizeObserver() {
      if (!this.$refs.previewBox) return

      this.resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (!entry) return

        this.previewWidth = entry.contentRect.width
        this.previewHeight = entry.contentRect.height
      })

      this.resizeObserver.observe(this.$refs.previewBox)
    },
    openExpandedPreview() {
      this.isExpandedPreviewOpen = true
    },
    closeExpandedPreview() {
      this.isExpandedPreviewOpen = false
    },
  },
}
</script>

<template>
  <section class="cf-live-preview">
    <div class="cf-panel-header">
      <div>
        <p class="cf-panel-kicker">Live Preview</p>
        <h3>Scaled Output</h3>
      </div>

      <div class="cf-preview-actions">
        <span class="cf-preview-size">{{ targetWidth }} &times; {{ targetHeight }}</span>
        <span class="cf-preview-scale">{{ scalePercent }}%</span>
        <button
          class="cf-icon-btn"
          type="button"
          aria-label="Expand preview"
          @click="openExpandedPreview"
        >
          <Maximize2 :size="15" />
        </button>
      </div>
    </div>

    <div ref="previewBox" class="cf-preview-box">
      <div class="cf-preview-stage" :style="stageStyle">
        <div class="cf-preview-real-size" :style="realSizeStyle">
          <PreviewLayerRenderer
            v-if="hasPreviewLayerTree"
            :layer-id="rootLayerId"
            :layers-by-id="layersById"
            :hide-root-background-image="shouldHideRootBackgroundImage"
            is-root
          />
        </div>
      </div>
    </div>

    <ExpandedPreviewModal
      v-if="isExpandedPreviewOpen"
      :target-width="targetWidth"
      :target-height="targetHeight"
      :root-layer-id="rootLayerId"
      :layers-by-id="layersById"
      :hide-root-background-image="shouldHideRootBackgroundImage"
      @close="closeExpandedPreview"
    />
  </section>
</template>
