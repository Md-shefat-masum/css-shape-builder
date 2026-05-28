<script>
import { Copy, Eye, EyeOff, Lock, Plus, Trash2, Unlock } from 'lucide-vue-next'
import { mapActions, mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useLayerStore } from '../../stores/layerStore'
import { useProjectStore } from '../../stores/projectStore'
import { alertService } from '../../services/alertService'

export default {
  name: 'ElementsPanel',
  components: {
    Copy,
    Eye,
    EyeOff,
    Lock,
    Plus,
    Trash2,
    Unlock,
  },
  data() {
    return {
      presets: [
        {
          id: 'horizontal-line',
          name: 'Horizontal Line',
          position: { x: 10, y: 10, width: 25, height: 1, unit: '%' },
          style: { background: '#22d3ee', opacity: 1 },
        },
        {
          id: 'vertical-line',
          name: 'Vertical Line',
          position: { x: 8, y: 14, width: 1, height: 32, unit: '%' },
          style: { background: '#8b5cf6', opacity: 1 },
        },
        {
          id: 'small-dot',
          name: 'Small Dot',
          position: { x: 80, y: 12, width: 3, height: 3, unit: '%' },
          style: { background: '#22d3ee', opacity: 1, borderRadius: 999 },
        },
        {
          id: 'corner-block',
          name: 'Corner Block',
          position: { x: 6, y: 5, width: 18, height: 5, unit: '%' },
          style: { background: '#22d3ee', opacity: 1 },
        },
        {
          id: 'hud-bar',
          name: 'HUD Bar',
          position: { x: 15, y: 88, width: 42, height: 4, unit: '%' },
          style: { background: 'linear-gradient(90deg, #8b5cf6, #22d3ee)', opacity: 1 },
        },
      ],
    }
  },
  computed: {
    ...mapState(useLayerStore, ['selectedLayer']),
    selectedParentId() {
      return this.selectedLayer?.type === 'element' || this.selectedLayer?.type === 'frame'
        ? this.selectedLayer.id
        : 'root'
    },
  },
  methods: {
    ...mapActions(useEditorStore, ['selectElement']),
    ...mapActions(useLayerStore, [
      'addElement',
      'deleteLayer',
      'duplicateLayer',
      'toggleLayerLock',
      'toggleLayerVisibility',
    ]),
    commit(label, type, layerId = this.selectedLayer?.id) {
      useHistoryStore().addHistory({ label, type, layerId })
      useProjectStore().saveCurrentProjectDebounced()
    },
    addRootElement() {
      const layer = this.addElement('root', { displayName: 'Root Element' })
      this.selectElement(layer.id)
      this.commit('Element Added', 'ELEMENT_ADDED', layer.id)
    },
    addChildElement() {
      const layer = this.addElement(this.selectedParentId, { displayName: 'Child Element' })
      this.selectElement(layer.id)
      this.commit('Child Element Added', 'ELEMENT_ADDED', layer.id)
    },
    addPreset(preset) {
      const layer = this.addElement(this.selectedParentId, {
        displayName: preset.name,
        position: preset.position,
        style: preset.style,
      })
      this.selectElement(layer.id)
      this.commit(`${preset.name} Added`, 'ELEMENT_ADDED', layer.id)
    },
    duplicateSelected() {
      const duplicate = this.duplicateLayer(this.selectedLayer.id)
      if (!duplicate) return
      this.selectElement(duplicate.id)
      this.commit('Element Duplicated', 'ELEMENT_DUPLICATED', duplicate.id)
    },
    async deleteSelected() {
      if (!this.selectedLayer || this.selectedLayer.id === 'root') return

      const confirmed = await alertService.confirm({
        title: 'Delete layer?',
        text: 'This will delete the selected layer and all children.',
        confirmButtonText: 'Delete',
      })
      if (!confirmed) return

      const layerId = this.selectedLayer.id
      this.deleteLayer(layerId)
      this.commit('Element Deleted', 'ELEMENT_DELETED', layerId)
    },
    toggleVisible() {
      this.toggleLayerVisibility(this.selectedLayer.id)
      this.commit('Layer Visibility Changed', 'LAYER_VISIBILITY_CHANGED')
    },
    toggleLocked() {
      this.toggleLayerLock(this.selectedLayer.id)
      this.commit('Layer Lock Changed', 'LAYER_LOCK_CHANGED')
    },
  },
}
</script>

<template>
  <section class="cf-inspector-body">
    <div class="cf-panel-section">
      <p class="cf-section-label">Selected Element</p>
      <div class="cf-selected-card">
        <strong>{{ selectedLayer.displayName }}</strong>
        <code>{{ selectedLayer.technicalName }} / {{ selectedLayer.cssClass }}</code>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button class="cf-small-control" type="button" @click="addRootElement">
          <Plus :size="14" />
          Add Root
        </button>
        <button class="cf-small-control" type="button" @click="addChildElement">
          <Plus :size="14" />
          Add Child
        </button>
        <button
          class="cf-small-control"
          type="button"
          :disabled="selectedLayer.id === 'root'"
          @click="duplicateSelected"
        >
          <Copy :size="14" />
          Duplicate
        </button>
        <button
          class="cf-small-control"
          type="button"
          :disabled="selectedLayer.id === 'root'"
          @click="deleteSelected"
        >
          <Trash2 :size="14" />
          Delete
        </button>
        <button class="cf-small-control" type="button" @click="toggleVisible">
          <component :is="selectedLayer.visible ? 'EyeOff' : 'Eye'" :size="14" />
          {{ selectedLayer.visible ? 'Hide' : 'Show' }}
        </button>
        <button
          class="cf-small-control"
          type="button"
          :disabled="selectedLayer.id === 'root'"
          @click="toggleLocked"
        >
          <component :is="selectedLayer.locked ? 'Unlock' : 'Lock'" :size="14" />
          {{ selectedLayer.locked ? 'Unlock' : 'Lock' }}
        </button>
      </div>
    </div>

    <div class="cf-panel-section">
      <p class="cf-section-label">Quick Presets</p>
      <div class="space-y-2">
        <button
          v-for="preset in presets"
          :key="preset.id"
          class="cf-preset-card"
          type="button"
          @click="addPreset(preset)"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>
  </section>
</template>
