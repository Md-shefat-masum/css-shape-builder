<script>
import { Code2, FileCode2, Settings2 } from 'lucide-vue-next'
import { mapActions, mapState } from 'pinia'

import CssOutput from '../output/CssOutput.vue'
import HtmlOutput from '../output/HtmlOutput.vue'
import LivePreview from '../output/LivePreview.vue'
import { useEditorStore } from '../../stores/editorStore'
import { useExportStore } from '../../stores/exportStore'
import { useLayerStore } from '../../stores/layerStore'
import { alertService } from '../../services/alertService'

export default {
  name: 'BottomOutputPanel',
  components: {
    Code2,
    CssOutput,
    FileCode2,
    HtmlOutput,
    LivePreview,
    Settings2,
  },
  data() {
    return {
      tabs: [
        { id: 'CSS Output', icon: 'Code2' },
        { id: 'HTML Output', icon: 'FileCode2' },
        { id: 'Settings', icon: 'Settings2' },
      ],
    }
  },
  computed: {
    ...mapState(useEditorStore, ['activeBottomTab', 'frame']),
    ...mapState(useExportStore, ['activeCssOutput', 'activeHtmlOutput']),
    ...mapState(useLayerStore, ['layersById', 'rootLayerId']),
  },
  created() {
    this.regenerateOutputs()
  },
  methods: {
    ...mapActions(useEditorStore, ['setBottomPanelTab']),
    ...mapActions(useExportStore, [
      'copyCss',
      'copyHtml',
      'downloadCssFile',
      'downloadHtmlFile',
      'regenerateOutputs',
      'resetCssToGenerated',
      'resetHtmlToGenerated',
      'setCustomCss',
      'setCustomHtml',
    ]),
    async copyCssOutput() {
      await this.copyCss()
      alertService.toast('CSS copied')
    },
    async copyHtmlOutput() {
      await this.copyHtml()
      alertService.toast('HTML copied')
    },
    editCssOutput() {
      const nextCss = window.prompt('Custom CSS override', this.activeCssOutput)
      if (nextCss === null) return
      this.setCustomCss(nextCss)
    },
    editHtmlOutput() {
      const nextHtml = window.prompt('Custom HTML override', this.activeHtmlOutput)
      if (nextHtml === null) return
      this.setCustomHtml(nextHtml)
    },
    resetCssOutput() {
      this.resetCssToGenerated()
      this.regenerateOutputs()
    },
    resetHtmlOutput() {
      this.resetHtmlToGenerated()
      this.regenerateOutputs()
    },
  },
}
</script>

<template>
  <section class="cf-bottom-panel">
    <div class="cf-bottom-output">
      <nav class="cf-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="cf-tab-button"
          :class="{ 'cf-tab-button-active': activeBottomTab === tab.id }"
          type="button"
          @click="setBottomPanelTab(tab.id)"
        >
          <component :is="tab.icon" :size="14" />
          {{ tab.id }}
        </button>
      </nav>

      <CssOutput
        v-if="activeBottomTab === 'CSS Output'"
        :css="activeCssOutput"
        @copy="copyCssOutput"
        @download="downloadCssFile"
        @edit="editCssOutput"
        @format="regenerateOutputs"
        @reset="resetCssOutput"
      />
      <HtmlOutput
        v-else-if="activeBottomTab === 'HTML Output'"
        :html="activeHtmlOutput"
        @copy="copyHtmlOutput"
        @download="downloadHtmlFile"
        @edit="editHtmlOutput"
        @format="regenerateOutputs"
        @reset="resetHtmlOutput"
      />
      <div v-else class="cf-export-settings">
        <label class="cf-toggle-row">
          <span>Vanilla HTML only</span>
          <input type="checkbox" checked />
        </label>
        <label class="cf-toggle-row">
          <span>Vanilla CSS only</span>
          <input type="checkbox" checked />
        </label>
        <label class="cf-toggle-row">
          <span>Include project JSON</span>
          <input type="checkbox" checked />
        </label>
      </div>
    </div>

    <LivePreview
      :target-width="frame.width"
      :target-height="frame.height"
      :root-layer-id="rootLayerId"
      :layers-by-id="layersById"
    />
  </section>
</template>
