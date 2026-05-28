<script>
import {
  Download,
  Grid3X3,
  Monitor,
  Redo2,
  Save,
  Settings,
  Smartphone,
  Tablet,
  Undo2,
  Upload,
} from 'lucide-vue-next'
import { mapActions, mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'
import { useProjectStore } from '../../stores/projectStore'
import ImportExportModal from '../project/ImportExportModal.vue'
import NewProjectModal from '../project/NewProjectModal.vue'
import ProjectListModal from '../project/ProjectListModal.vue'
import { alertService } from '../../services/alertService'

export default {
  name: 'TopToolbar',
  components: {
    Download,
    Grid3X3,
    ImportExportModal,
    Monitor,
    NewProjectModal,
    ProjectListModal,
    Redo2,
    Save,
    Settings,
    Smartphone,
    Tablet,
    Undo2,
    Upload,
  },
  data() {
    return {
      activeModal: null,
    }
  },
  computed: {
    ...mapState(useEditorStore, ['project', 'tools']),
    ...mapState(useEditorStore, {
      viewport: 'legacyViewport',
    }),
  },
  methods: {
    ...mapActions(useEditorStore, [
      'fitToScreen',
      'setMode',
      'toggleGrid',
      'toggleSnap',
      'zoomIn',
      'zoomOut',
    ]),
    ...mapActions(useProjectStore, ['renameProject', 'saveCurrentProjectDebounced']),
    async saveProject() {
      this.saveCurrentProjectDebounced()
      alertService.toast('Project saved')
    },
    renameCurrentProject(event) {
      this.renameProject(this.project.id, event.target.value)
    },
  },
}
</script>

<template>
  <header class="cf-top-toolbar">
    <section class="flex min-w-0 items-center gap-3">
      <div class="cf-logo-mark">CF</div>
      <div class="min-w-0">
        <p class="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-300">
          ClipFrame <span class="cf-version-badge">v0.1</span>
        </p>
        <input
          class="cf-project-input"
          :value="project.name"
          aria-label="Project name"
          @change="renameCurrentProject"
        />
      </div>
    </section>

    <section class="cf-toolbar-group hidden 2xl:flex">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="cf-tool-btn"
        :class="{ 'is-active': viewport.mode === tool.id }"
        type="button"
        @click="setMode(tool.id)"
      >
        {{ tool.label }}
      </button>
    </section>

    <section class="cf-toolbar-group hidden xl:flex">
      <button
        class="cf-icon-button cf-icon-button-active"
        type="button"
        aria-label="Desktop preview"
      >
        <Monitor :size="16" />
      </button>
      <button class="cf-icon-button" type="button" aria-label="Tablet preview">
        <Tablet :size="16" />
      </button>
      <button class="cf-icon-button" type="button" aria-label="Mobile preview">
        <Smartphone :size="16" />
      </button>
    </section>

    <section class="cf-toolbar-group">
      <button class="cf-text-button" type="button" @click="fitToScreen()">Fit</button>
      <button class="cf-text-button" type="button" aria-label="Zoom out" @click="zoomOut">-</button>
      <button class="cf-text-button" type="button">{{ viewport.zoom }}%</button>
      <button class="cf-text-button" type="button" aria-label="Zoom in" @click="zoomIn">+</button>
      <button
        class="cf-icon-button"
        :class="{ 'cf-icon-button-active': viewport.grid }"
        type="button"
        aria-label="Grid toggle"
        @click="toggleGrid"
      >
        <Grid3X3 :size="16" />
      </button>
      <button
        class="cf-text-button"
        :class="{ 'cf-icon-button-active': viewport.snap }"
        type="button"
        @click="toggleSnap"
      >
        Snap
      </button>
    </section>

    <section class="cf-toolbar-group ml-auto">
      <button class="cf-icon-button" type="button" aria-label="Undo">
        <Undo2 :size="16" />
      </button>
      <button class="cf-icon-button" type="button" aria-label="Redo">
        <Redo2 :size="16" />
      </button>
    </section>

    <section class="cf-toolbar-group">
      <button class="cf-action-button" type="button" @click="saveProject">
        <Save :size="15" />
        Save
      </button>
      <button class="cf-action-button" type="button" @click="activeModal = 'export'">
        <Download :size="15" />
        Export
      </button>
      <button
        class="cf-icon-button hidden sm:inline-flex"
        type="button"
        aria-label="Import"
        @click="activeModal = 'projects'"
      >
        <Upload :size="16" />
      </button>
      <button
        class="cf-icon-button"
        type="button"
        aria-label="Settings"
        @click="activeModal = 'new'"
      >
        <Settings :size="16" />
      </button>
    </section>

    <ProjectListModal v-if="activeModal === 'projects'" @close="activeModal = null" />
    <NewProjectModal v-if="activeModal === 'new'" @close="activeModal = null" />
    <ImportExportModal v-if="activeModal === 'export'" @close="activeModal = null" />
  </header>
</template>
