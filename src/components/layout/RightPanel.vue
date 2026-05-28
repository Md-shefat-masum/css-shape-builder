<script>
import { Box, Clock3, Layers, SlidersHorizontal } from 'lucide-vue-next'
import { mapActions, mapState } from 'pinia'

import ElementsPanel from '../panels/ElementsPanel.vue'
import HistoryPanel from '../panels/HistoryPanel.vue'
import InspectorPanel from '../panels/InspectorPanel.vue'
import LayersPanel from '../panels/LayersPanel.vue'
import StylePanel from '../panels/StylePanel.vue'
import { useEditorStore } from '../../stores/editorStore'

export default {
  name: 'RightPanel',
  components: {
    Box,
    Clock3,
    ElementsPanel,
    Layers,
    LayersPanel,
    HistoryPanel,
    InspectorPanel,
    SlidersHorizontal,
    StylePanel,
  },
  data() {
    return {
      tabs: [
        { id: 'Style', icon: 'SlidersHorizontal' },
        { id: 'Elements', icon: 'Box' },
        { id: 'Layers', icon: 'Layers' },
        { id: 'History', icon: 'Clock3' },
      ],
    }
  },
  computed: {
    ...mapState(useEditorStore, ['activeRightTab']),
  },
  methods: {
    ...mapActions(useEditorStore, ['setRightPanelTab']),
  },
}
</script>

<template>
  <aside class="cf-right-panel">
    <nav class="cf-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="cf-tab-button"
        :class="{ 'cf-tab-button-active': activeRightTab === tab.id }"
        type="button"
        @click="setRightPanelTab(tab.id)"
      >
        <component :is="tab.icon" :size="14" />
        {{ tab.id }}
      </button>
    </nav>

    <div class="cf-right-content">
      <StylePanel v-if="activeRightTab === 'Style'" />
      <ElementsPanel v-else-if="activeRightTab === 'Elements'" />
      <LayersPanel v-else-if="activeRightTab === 'Layers'" />
      <HistoryPanel v-else />
    </div>

    <div v-if="activeRightTab !== 'Style'" class="cf-right-inspector-dock">
      <InspectorPanel />
    </div>
  </aside>
</template>
