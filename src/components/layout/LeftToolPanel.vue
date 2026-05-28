<script>
import {
  Crosshair,
  Eye,
  Focus,
  Hand,
  Image as ImageIcon,
  MousePointer2,
  Move,
  PenTool,
  Plus,
  Trash2,
} from 'lucide-vue-next'
import { mapActions, mapState } from 'pinia'

import { alertService } from '../../services/alertService'
import { useEditorStore } from '../../stores/editorStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useLayerStore } from '../../stores/layerStore'
import { useProjectStore } from '../../stores/projectStore'

export default {
  name: 'LeftToolPanel',
  components: {
    Crosshair,
    Eye,
    Focus,
    Hand,
    ImageIcon,
    MousePointer2,
    Move,
    PenTool,
    Plus,
    Trash2,
  },
  data() {
    return {
      toolIcons: {
        select: 'MousePointer2',
        pan: 'Hand',
        clipDraw: 'PenTool',
        clipEdit: 'Crosshair',
        elementAdd: 'Plus',
        preview: 'Eye',
      },
    }
  },
  computed: {
    ...mapState(useEditorStore, ['frame', 'framePresets', 'targetFrame', 'tools']),
    ...mapState(useEditorStore, {
      viewport: 'legacyViewport',
    }),
    ...mapState(useLayerStore, ['rootLayer', 'selectedLayer']),
  },
  methods: {
    ...mapActions(useEditorStore, [
      'applyFramePreset',
      'fitToScreen',
      'setBackgroundOpacity',
      'setMode',
      'toggleGrid',
      'toggleSnap',
      'zoomIn',
      'zoomOut',
    ]),
    ...mapActions(useLayerStore, ['enableClip', 'setClipMode', 'updateLayerStyle']),
    activateClipDraw() {
      this.enableClip(this.selectedLayer.id)
      this.setClipMode(this.selectedLayer.id, 'freePolygon')
      this.setMode('clipDraw')
    },
    updateBackgroundOpacity(event) {
      this.setBackgroundOpacity(Number(event.target.value) / 100)
    },
    openReferenceImagePicker() {
      this.$refs.referenceImageInput.click()
    },
    handleReferenceImageSelected(event) {
      const file = event.target.files?.[0]
      event.target.value = ''

      if (!file) return
      if (!file.type.startsWith('image/')) {
        alertService.error('Please select an image file.')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result

        this.updateLayerStyle(this.rootLayer.id, {
          background: `url("${dataUrl}") center / contain no-repeat`,
        })
        useHistoryStore().addHistory({
          type: 'BACKGROUND_IMAGE_SET',
          label: 'Background Image Set',
          description: 'Set selected image as root frame background',
          layerId: this.rootLayer.id,
          icon: 'image',
          severity: 'info',
        })
        useProjectStore().saveCurrentProjectDebounced()
        alertService.toast('Root background image set')
      }
      reader.onerror = () => {
        alertService.error('Could not read the selected image.')
      }
      reader.readAsDataURL(file)
    },
  },
}
</script>

<template>
  <aside class="cf-left-panel">
    <section class="cf-panel-section">
      <p class="cf-section-label">Tool Mode</p>
      <div class="space-y-2">
        <button
          v-for="tool in tools"
          :key="tool.id"
          class="cf-tool-button"
          :class="{ 'cf-tool-button-active': viewport.mode === tool.id }"
          type="button"
          @click="setMode(tool.id)"
        >
          <component :is="toolIcons[tool.id]" :size="16" />
          <span class="min-w-0 flex-1 truncate text-left">{{ tool.label }}</span>
          <kbd>{{ tool.shortcut }}</kbd>
        </button>
      </div>
    </section>

    <section class="cf-panel-section">
      <p class="cf-section-label">Clip Controls</p>
      <div class="grid grid-cols-2 gap-2">
        <button class="cf-small-control" type="button" @click="setMode('clipEdit')">
          <PenTool :size="14" />
          Edit
        </button>
        <button class="cf-small-control" type="button" @click="activateClipDraw">
          <Trash2 :size="14" />
          Draw
        </button>
        <button class="cf-small-control" type="button" @click="setMode('elementAdd')">
          <Plus :size="14" />
          Element
        </button>
        <button class="cf-small-control" type="button" @click="setMode('select')">
          <MousePointer2 :size="14" />
          Select
        </button>
      </div>
    </section>

    <section class="cf-panel-section">
      <p class="cf-section-label">Canvas View</p>
      <div class="space-y-2">
        <label class="cf-toggle-row">
          <span>Show Grid</span>
          <input type="checkbox" :checked="viewport.grid" @change="toggleGrid" />
        </label>
        <label class="cf-toggle-row">
          <span>Snap to Grid</span>
          <input type="checkbox" :checked="viewport.snap" @change="toggleSnap" />
        </label>
        <label class="cf-field-stack">
          <span>Frame Preset</span>
          <select :value="targetFrame.preset" @change="applyFramePreset($event.target.value)">
            <option v-for="preset in framePresets" :key="preset.id" :value="preset.id">
              {{ preset.label }}
            </option>
          </select>
        </label>
        <label class="cf-field-stack">
          <span>Background Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            :value="frame.backgroundOpacity"
            @input="updateBackgroundOpacity"
          />
        </label>
      </div>
    </section>

    <section class="cf-panel-section">
      <p class="cf-section-label">Workspace</p>
      <div class="grid grid-cols-2 gap-2">
        <button class="cf-small-control" type="button" @click="zoomOut">
          <Move :size="14" />
          Zoom -
        </button>
        <button class="cf-small-control" type="button" @click="zoomIn">
          <Move :size="14" />
          Zoom +
        </button>
        <button class="cf-small-control col-span-2" type="button" @click="fitToScreen()">
          <Focus :size="14" />
          Fit
        </button>
        <button class="cf-small-control col-span-2" type="button" @click="openReferenceImagePicker">
          <ImageIcon :size="14" />
          Reference Image
        </button>
        <input
          ref="referenceImageInput"
          class="hidden"
          type="file"
          accept="image/*"
          @change="handleReferenceImageSelected"
        />
      </div>
    </section>
  </aside>
</template>
