<script>
import { mapActions, mapState } from 'pinia'

import { useProjectStore } from '../../stores/projectStore'
import { alertService } from '../../services/alertService'

export default {
  name: 'ProjectListModal',
  emits: ['close'],
  computed: {
    ...mapState(useProjectStore, ['projectsIndex']),
  },
  methods: {
    ...mapActions(useProjectStore, ['deleteProject', 'duplicateProject', 'openProject']),
    open(id) {
      this.openProject(id)
      this.$emit('close')
    },
    duplicate(id) {
      this.duplicateProject(id)
      alertService.toast('Project duplicated')
    },
    async remove(id) {
      const confirmed = await alertService.confirm({
        title: 'Delete project?',
        text: 'This action cannot be undone.',
        confirmButtonText: 'Delete',
      })
      if (!confirmed) return
      this.deleteProject(id)
    },
  },
}
</script>

<template>
  <div class="cf-preview-modal-backdrop" @click="$emit('close')">
    <section class="cf-preview-modal cf-project-modal" aria-label="Project list" @click.stop>
      <header class="cf-preview-modal-header">
        <div>
          <p class="cf-panel-kicker">Saved Projects</p>
          <h3>Open Local Project</h3>
        </div>
        <button class="cf-icon-btn" type="button" @click="$emit('close')">X</button>
      </header>
      <div class="cf-modal-content">
        <article v-for="project in projectsIndex" :key="project.id" class="cf-project-row">
          <div>
            <strong>{{ project.name }}</strong>
            <small>Updated: {{ project.updatedAt }}</small>
            <code>{{ project.cssPrefix }}</code>
          </div>
          <div class="cf-preview-actions">
            <button class="cf-mini-action" type="button" @click="open(project.id)">Open</button>
            <button class="cf-mini-action" type="button" @click="duplicate(project.id)">
              Duplicate
            </button>
            <button class="cf-mini-action" type="button" @click="remove(project.id)">Delete</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
