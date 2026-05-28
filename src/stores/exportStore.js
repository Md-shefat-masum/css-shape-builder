import { defineStore } from 'pinia'

import { clipboardService } from '../services/clipboardService'
import { downloadCss, downloadHtml, downloadJson } from '../services/exportService'
import { generateProjectCss } from '../services/cssGenerator'
import { generateProjectHtml } from '../services/htmlGenerator'
import { useEditorStore } from './editorStore'
import { useLayerStore } from './layerStore'
import { useProjectStore } from './projectStore'

export const useExportStore = defineStore('exportStore', {
  state: () => ({
    cssOutput: '',
    htmlOutput: '',
    cssEditMode: 'generated',
    customCss: '',
    customHtml: '',
    lastGeneratedAt: null,
  }),
  getters: {
    activeCssOutput(state) {
      return state.cssEditMode === 'custom' ? state.customCss : state.cssOutput
    },

    activeHtmlOutput(state) {
      return state.customHtml || state.htmlOutput
    },
  },
  actions: {
    regenerateOutputs() {
      const editorStore = useEditorStore()
      const layerStore = useLayerStore()
      const projectStore = useProjectStore()

      const projectData = {
        meta: projectStore.currentProjectMeta,
        editor: {
          targetFrame: editorStore.targetFrame,
        },
        layers: {
          rootLayerId: layerStore.rootLayerId,
          layersById: layerStore.layersById,
        },
      }

      this.cssOutput = generateProjectCss(projectData)
      this.htmlOutput = generateProjectHtml(projectData)
      this.lastGeneratedAt = new Date().toISOString()
    },

    setCustomCss(css) {
      this.customCss = css
      this.cssEditMode = 'custom'
    },

    resetCssToGenerated() {
      this.cssEditMode = 'generated'
      this.customCss = ''
    },

    setCustomHtml(html) {
      this.customHtml = html
    },

    resetHtmlToGenerated() {
      this.customHtml = ''
    },

    async copyCss() {
      await clipboardService.copyText(this.activeCssOutput)
    },

    async copyHtml() {
      await clipboardService.copyText(this.activeHtmlOutput)
    },

    downloadCssFile() {
      downloadCss('clipframe.css', this.activeCssOutput)
    },

    downloadHtmlFile() {
      downloadHtml('clipframe.html', this.activeHtmlOutput)
    },

    downloadProjectJson() {
      const projectStore = useProjectStore()
      const editorStore = useEditorStore()
      const layerStore = useLayerStore()

      downloadJson('clipframe-project.json', {
        schemaVersion: 1,
        meta: projectStore.currentProjectMeta,
        editor: editorStore.$state,
        layers: {
          rootLayerId: layerStore.rootLayerId,
          layersById: layerStore.layersById,
        },
        output: {
          cssEditMode: this.cssEditMode,
          customCss: this.customCss,
          customHtml: this.customHtml,
        },
      })
    },
  },
})
