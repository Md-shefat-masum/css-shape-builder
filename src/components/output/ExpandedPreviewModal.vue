<script>
import { X } from 'lucide-vue-next'

import PreviewLayerRenderer from './PreviewLayerRenderer.vue'

export default {
  name: 'ExpandedPreviewModal',
  components: {
    PreviewLayerRenderer,
    X,
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
    hideRootBackgroundImage: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  data() {
    return {
      modalBodyWidth: 900,
      modalBodyHeight: 640,
      resizeObserver: null,
    }
  },
  computed: {
    scale() {
      if (!this.targetWidth || !this.targetHeight) return 1

      return Math.min(
        this.modalBodyWidth / this.targetWidth,
        this.modalBodyHeight / this.targetHeight,
        1,
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
      if (!this.$refs.modalBody) return

      this.resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (!entry) return

        this.modalBodyWidth = entry.contentRect.width
        this.modalBodyHeight = entry.contentRect.height
      })

      this.resizeObserver.observe(this.$refs.modalBody)
    },
  },
}
</script>

<template>
  <div class="cf-preview-modal-backdrop" role="presentation" @click="$emit('close')">
    <section class="cf-preview-modal" role="dialog" aria-modal="true" @click.stop>
      <header class="cf-preview-modal-header">
        <div>
          <p class="cf-panel-kicker">Expanded Preview</p>
          <h3>Scaled Output</h3>
        </div>

        <div class="cf-preview-actions">
          <span class="cf-preview-size">{{ targetWidth }} &times; {{ targetHeight }}</span>
          <span class="cf-preview-scale">{{ scalePercent }}%</span>
          <button
            class="cf-icon-btn"
            type="button"
            aria-label="Close preview"
            @click="$emit('close')"
          >
            <X :size="16" />
          </button>
        </div>
      </header>

      <div ref="modalBody" class="cf-preview-modal-body">
        <div class="cf-preview-stage" :style="stageStyle">
          <div class="cf-preview-real-size" :style="realSizeStyle">
            <PreviewLayerRenderer
              v-if="hasPreviewLayerTree"
              :layer-id="rootLayerId"
              :layers-by-id="layersById"
              :hide-root-background-image="hideRootBackgroundImage"
              is-root
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
