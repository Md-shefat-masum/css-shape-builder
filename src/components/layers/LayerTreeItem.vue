<script>
import { ChevronDown, Eye, EyeOff, Lock, MoreHorizontal, Unlock } from 'lucide-vue-next'
import { mapActions, mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useLayerStore } from '../../stores/layerStore'
import { useProjectStore } from '../../stores/projectStore'
import { alertService } from '../../services/alertService'

export default {
  name: 'LayerTreeItem',
  components: {
    ChevronDown,
    Eye,
    EyeOff,
    Lock,
    MoreHorizontal,
    Unlock,
  },
  props: {
    layer: {
      type: Object,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  emits: ['select-layer'],
  computed: {
    ...mapState(useEditorStore, ['selectedElementId']),
    childLayers() {
      return this.layer.childrenData || []
    },
    hasChildren() {
      return this.childLayers.length > 0
    },
    indentStyle() {
      return {
        paddingLeft: `${this.depth * 14 + 8}px`,
      }
    },
    isSelected() {
      return this.selectedElementId === this.layer.id
    },
  },
  methods: {
    ...mapActions(useEditorStore, ['selectElement']),
    ...mapActions(useLayerStore, [
      'addElement',
      'deleteLayer',
      'duplicateLayer',
      'renameLayer',
      'toggleLayerExpanded',
      'toggleLayerLock',
      'toggleLayerVisibility',
    ]),
    commit(label, type) {
      useHistoryStore().addHistory({ label, type, layerId: this.layer.id })
      useProjectStore().saveCurrentProjectDebounced()
    },
    selectLayer() {
      this.selectElement(this.layer.id)
      this.$emit('select-layer', this.layer.id)
    },
    toggleExpanded() {
      this.toggleLayerExpanded(this.layer.id)
    },
    toggleVisible() {
      this.toggleLayerVisibility(this.layer.id)
      this.commit('Layer Visibility Changed', 'LAYER_VISIBILITY_CHANGED')
    },
    toggleLocked() {
      this.toggleLayerLock(this.layer.id)
      this.commit('Layer Lock Changed', 'LAYER_LOCK_CHANGED')
    },
    addChild() {
      const layer = this.addElement(this.layer.id)
      this.selectElement(layer.id)
      this.commit('Child Element Added', 'ELEMENT_ADDED')
    },
    duplicate() {
      const duplicate = this.duplicateLayer(this.layer.id)
      if (!duplicate) return
      this.selectElement(duplicate.id)
      this.commit('Layer Duplicated', 'LAYER_DUPLICATED')
    },
    async remove() {
      if (this.layer.id === 'root') return

      const confirmed = await alertService.confirm({
        title: 'Delete layer?',
        text: 'Children will be deleted too.',
        confirmButtonText: 'Delete',
      })
      if (!confirmed) return

      this.deleteLayer(this.layer.id)
      this.commit('Layer Deleted', 'LAYER_DELETED')
    },
    rename() {
      const nextName = window.prompt('Layer display name', this.layer.displayName)
      if (!nextName) return

      this.renameLayer(this.layer.id, nextName)
      this.commit('Layer Renamed', 'LAYER_RENAMED')
    },
  },
}
</script>

<template>
  <li>
    <div
      class="cf-layer-row"
      :class="{ 'cf-layer-row-active': isSelected }"
      :style="indentStyle"
      @click="selectLayer"
    >
      <button class="cf-layer-icon-btn" type="button" @click.stop="toggleExpanded">
        <ChevronDown v-if="hasChildren && layer.expanded" :size="13" />
        <span v-else-if="hasChildren">▸</span>
        <span v-else class="w-[13px]"></span>
      </button>
      <button class="cf-layer-icon-btn" type="button" @click.stop="toggleVisible">
        <component :is="layer.visible ? 'Eye' : 'EyeOff'" :size="13" />
      </button>
      <button
        class="cf-layer-icon-btn"
        type="button"
        :disabled="layer.id === 'root'"
        @click.stop="toggleLocked"
      >
        <component :is="layer.locked ? 'Lock' : 'Unlock'" :size="13" />
      </button>
      <div class="min-w-0 flex-1">
        <p class="truncate text-xs font-medium text-slate-100">
          <code class="cf-layer-code">{{ layer.technicalName }}</code>
          {{ layer.displayName }}
        </p>
        <p class="truncate text-[10px] text-slate-500">{{ layer.cssClass }}</p>
      </div>
      <div class="cf-layer-actions">
        <button type="button" title="Add child" @click.stop="addChild">+</button>
        <button
          type="button"
          title="Duplicate"
          :disabled="layer.id === 'root'"
          @click.stop="duplicate"
        >
          D
        </button>
        <button type="button" title="Rename" @click.stop="rename">R</button>
        <button type="button" title="Delete" :disabled="layer.id === 'root'" @click.stop="remove">
          <MoreHorizontal :size="13" />
        </button>
      </div>
    </div>

    <ul v-if="hasChildren && layer.expanded" class="mt-1 space-y-1">
      <LayerTreeItem
        v-for="child in childLayers"
        :key="child.id"
        :layer="child"
        :depth="depth + 1"
        @select-layer="$emit('select-layer', $event)"
      />
    </ul>
  </li>
</template>
