<script>
import { Layers } from 'lucide-vue-next'
import { mapActions, mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'
import { useLayerStore } from '../../stores/layerStore'
import LayerTreeItem from './LayerTreeItem.vue'

export default {
  name: 'LayerTree',
  components: {
    LayerTreeItem,
    Layers,
  },
  computed: {
    ...mapState(useLayerStore, ['layerTree']),
  },
  methods: {
    ...mapActions(useEditorStore, ['selectElement']),
  },
}
</script>

<template>
  <ul class="space-y-1">
    <button class="cf-layer-row" type="button" @click="selectElement(layerTree.id)">
      <Layers :size="14" />
      <span class="min-w-0 flex-1 truncate text-xs font-semibold text-cyan-100">
        {{ layerTree.displayName }}
      </span>
    </button>
    <LayerTreeItem
      v-for="element in layerTree.childrenData"
      :key="element.id"
      :layer="element"
      @select-layer="selectElement"
    />
  </ul>
</template>
