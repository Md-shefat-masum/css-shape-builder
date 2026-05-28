<script>
import { mapActions, mapState } from 'pinia'

import { useExportStore } from '../../stores/exportStore'
import { useProjectStore } from '../../stores/projectStore'
import { alertService } from '../../services/alertService'

export default {
  name: 'ImportExportModal',
  emits: ['close'],
  data() {
    return {
      jsonInput: '',
    }
  },
  computed: {
    ...mapState(useExportStore, ['activeCssOutput', 'activeHtmlOutput']),
  },
  methods: {
    ...mapActions(useExportStore, [
      'copyCss',
      'copyHtml',
      'downloadCssFile',
      'downloadHtmlFile',
      'downloadProjectJson',
    ]),
    ...mapActions(useProjectStore, ['importProject']),
    async importJson() {
      try {
        const data = JSON.parse(this.jsonInput)
        if (!data.schemaVersion || !data.meta || !data.layers || !data.layers.layersById?.root) {
          throw new Error('Invalid ClipFrame project JSON')
        }
        this.importProject(data)
        alertService.toast('Project imported')
        this.$emit('close')
      } catch (error) {
        alertService.error(error.message)
      }
    },
    async copyCssOutput() {
      await this.copyCss()
      alertService.toast('CSS copied')
    },
    async copyHtmlOutput() {
      await this.copyHtml()
      alertService.toast('HTML copied')
    },
  },
}
</script>

<template>
  <div class="cf-preview-modal-backdrop" @click="$emit('close')">
    <section class="cf-preview-modal cf-project-modal" aria-label="Import export" @click.stop>
      <header class="cf-preview-modal-header">
        <div>
          <p class="cf-panel-kicker">Import / Export</p>
          <h3>Project Assets</h3>
        </div>
        <button class="cf-icon-btn" type="button" @click="$emit('close')">X</button>
      </header>
      <div class="cf-modal-content">
        <div class="grid grid-cols-2 gap-2">
          <button class="cf-small-control" type="button" @click="downloadProjectJson">
            Export JSON
          </button>
          <button class="cf-small-control" type="button" @click="downloadCssFile">
            Download CSS
          </button>
          <button class="cf-small-control" type="button" @click="downloadHtmlFile">
            Download HTML
          </button>
          <button class="cf-small-control" type="button" @click="copyCssOutput">Copy CSS</button>
          <button class="cf-small-control" type="button" @click="copyHtmlOutput">Copy HTML</button>
        </div>
        <label class="cf-field-stack">
          <span>Import Project JSON</span>
          <textarea v-model="jsonInput" class="cf-textarea" rows="8"></textarea>
        </label>
        <button class="cf-action-button w-full" type="button" @click="importJson">
          Import JSON
        </button>
      </div>
    </section>
  </div>
</template>
