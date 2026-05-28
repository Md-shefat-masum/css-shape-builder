<script>
import { Maximize2, Move3D, Ruler } from 'lucide-vue-next'
import { mapActions, mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useLayerStore } from '../../stores/layerStore'
import { useProjectStore } from '../../stores/projectStore'
import CanvasViewport from './CanvasViewport.vue'

export default {
  name: 'CanvasWorkspace',
  components: {
    CanvasViewport,
    Maximize2,
    Move3D,
    Ruler,
  },
  computed: {
    ...mapState(useEditorStore, ['currentTool', 'frame', 'selectedClipPoint', 'ui']),
    ...mapState(useEditorStore, {
      viewport: 'legacyViewport',
    }),
    ...mapState(useLayerStore, ['getLayerBreadcrumb', 'selectedLayer']),
    selectedClipPointData() {
      if (!this.selectedClipPoint.layerId || !this.selectedClipPoint.pointId) return null

      const layer = useLayerStore().getLayerById(this.selectedClipPoint.layerId)
      if (!layer) return null

      return (
        layer.clip.polygonPoints.find((point) => point.id === this.selectedClipPoint.pointId) ||
        null
      )
    },
    shouldShowClipPointEditor() {
      return this.currentTool === 'clipEdit' && this.selectedClipPointData
    },
    selectedLabel() {
      return this.getLayerBreadcrumb(this.selectedLayer.id)
        .map((item) => `${item.technicalName} ${item.displayName}`)
        .join(' > ')
    },
  },
  methods: {
    ...mapActions(useEditorStore, ['selectClipPoint']),
    ...mapActions(useLayerStore, ['updateClipPoint']),
    setSelectedClipPointValue(axis, event) {
      if (!this.selectedClipPointData) return

      const value = Number(event.target.value)
      this.selectClipPoint(this.selectedClipPoint.layerId, this.selectedClipPoint.pointId)
      this.updateClipPoint(this.selectedClipPoint.layerId, this.selectedClipPoint.pointId, {
        [axis]: value,
      })
    },
    commitSelectedClipPointChange() {
      if (!this.selectedClipPointData) return

      useHistoryStore().addHistory({
        type: 'POINT_CHANGED',
        label: 'Point Changed',
        layerId: this.selectedClipPoint.layerId,
      })
      useProjectStore().saveCurrentProjectDebounced()
    },
  },
}
</script>

<template>
  <section class="cf-canvas-panel">
    <div class="cf-canvas-topbar">
      <div class="flex items-center gap-2">
        <span class="cf-status-pill">
          <Ruler :size="14" />
          {{ frame.width }} x {{ frame.height }}
        </span>
        <span class="cf-status-pill">{{ frame.preset }}</span>
        <span class="cf-status-pill">{{ frame.clipMode }}</span>
        <span v-if="shouldShowClipPointEditor" class="cf-status-pill cf-clip-point-editor">
          Point
          <label>
            X
            <input
              type="number"
              step="0.01"
              :value="selectedClipPointData.x"
              @input="setSelectedClipPointValue('x', $event)"
              @change="commitSelectedClipPointChange"
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="0.01"
              :value="selectedClipPointData.y"
              @input="setSelectedClipPointValue('y', $event)"
              @change="commitSelectedClipPointChange"
            />
          </label>
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="cf-status-pill">
          <Move3D :size="14" />
          Mode: {{ viewport.mode }}
        </span>
        <span class="cf-status-pill">
          <Maximize2 :size="14" />
          {{ viewport.zoom }}%
        </span>
      </div>
    </div>

    <CanvasViewport />

    <footer class="cf-canvas-status">
      <span>Tool: {{ viewport.mode }}</span>
      <span class="truncate">Selected: {{ selectedLabel }}</span>
      <span>X: {{ ui.mouse.percentX.toFixed(2) }}%</span>
      <span>Y: {{ ui.mouse.percentY.toFixed(2) }}%</span>
      <span>Zoom: {{ viewport.zoom }}%</span>
      <span>Frame: {{ frame.width }} x {{ frame.height }}</span>
      <span>Snap: {{ viewport.snap ? 'On' : 'Off' }}</span>
      <span>Generated CSS scale: 1:1</span>
    </footer>
  </section>
</template>
