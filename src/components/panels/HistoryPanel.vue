<script>
import { mapActions, mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'
import { useHistoryStore } from '../../stores/historyStore'

export default {
  name: 'HistoryPanel',
  computed: {
    ...mapState(useHistoryStore, ['historyItems']),
  },
  methods: {
    ...mapActions(useEditorStore, ['selectElement']),
    ...mapActions(useHistoryStore, ['clearHistory']),
    formatTime(timestamp) {
      return new Intl.DateTimeFormat('en', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(timestamp))
    },
    selectHistoryLayer(item) {
      if (item.layerId) {
        this.selectElement(item.layerId)
      }
    },
  },
}
</script>

<template>
  <section class="cf-inspector-body">
    <div class="cf-panel-section">
      <div class="cf-section-header">
        <p class="cf-section-label">History ({{ historyItems.length }})</p>
        <button class="cf-mini-action" type="button" @click="clearHistory">Clear History</button>
      </div>
      <ol class="space-y-2">
        <li
          v-for="item in historyItems"
          :key="item.id"
          class="cf-history-row"
          :class="`is-${item.severity}`"
          @click="selectHistoryLayer(item)"
        >
          <span></span>
          <div class="min-w-0 flex-1">
            <strong>{{ item.label }}</strong>
            <small>{{ item.description || item.type }}</small>
          </div>
          <time>{{ formatTime(item.timestamp) }}</time>
        </li>
      </ol>
    </div>
  </section>
</template>
