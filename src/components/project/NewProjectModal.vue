<script>
import { mapActions, mapState } from 'pinia'

import { createSafeCssName } from '../../utils/cssSafe'
import { useEditorStore } from '../../stores/editorStore'
import { useProjectStore } from '../../stores/projectStore'
import { alertService } from '../../services/alertService'

export default {
  name: 'NewProjectModal',
  emits: ['close'],
  data() {
    return {
      form: {
        name: 'Untitled Frame',
        cssPrefix: 'untitled_frame',
        preset: 'product-card',
        width: 320,
        height: 460,
        minWidth: 180,
        minHeight: 48,
      },
    }
  },
  computed: {
    ...mapState(useEditorStore, ['framePresets']),
  },
  methods: {
    ...mapActions(useEditorStore, ['setTargetFrameSize']),
    ...mapActions(useProjectStore, ['createProject']),
    syncPrefix() {
      this.form.cssPrefix = createSafeCssName(this.form.name)
    },
    applyPreset() {
      const preset = this.framePresets.find((item) => item.id === this.form.preset)
      if (!preset) return
      this.form.width = preset.width
      this.form.height = preset.height
      this.form.minWidth = preset.minWidth
      this.form.minHeight = preset.minHeight
    },
    create() {
      this.createProject({
        name: this.form.name,
        cssPrefix: this.form.cssPrefix,
      })
      this.setTargetFrameSize({
        width: this.form.width,
        height: this.form.height,
        minWidth: this.form.minWidth,
        minHeight: this.form.minHeight,
        preset: this.form.preset,
      })
      alertService.toast('Project created')
      this.$emit('close')
    },
  },
}
</script>

<template>
  <div class="cf-preview-modal-backdrop" @click="$emit('close')">
    <section class="cf-preview-modal cf-project-modal" aria-label="New project" @click.stop>
      <header class="cf-preview-modal-header">
        <div>
          <p class="cf-panel-kicker">New Project</p>
          <h3>Create ClipFrame</h3>
        </div>
        <button class="cf-icon-btn" type="button" @click="$emit('close')">X</button>
      </header>
      <div class="cf-modal-content">
        <label class="cf-field-stack">
          <span>Project Name</span>
          <input v-model="form.name" @input="syncPrefix" />
        </label>
        <label class="cf-field-stack">
          <span>CSS Prefix</span>
          <input v-model="form.cssPrefix" />
        </label>
        <label class="cf-field-stack">
          <span>Frame Preset</span>
          <select v-model="form.preset" @change="applyPreset">
            <option v-for="preset in framePresets" :key="preset.id" :value="preset.id">
              {{ preset.label }}
            </option>
          </select>
        </label>
        <div class="grid grid-cols-2 gap-2">
          <label class="cf-field-stack"
            ><span>Width</span><input v-model.number="form.width" type="number"
          /></label>
          <label class="cf-field-stack"
            ><span>Height</span><input v-model.number="form.height" type="number"
          /></label>
          <label class="cf-field-stack"
            ><span>Min Width</span><input v-model.number="form.minWidth" type="number"
          /></label>
          <label class="cf-field-stack"
            ><span>Min Height</span><input v-model.number="form.minHeight" type="number"
          /></label>
        </div>
        <button class="cf-action-button w-full" type="button" @click="create">
          Create Project
        </button>
      </div>
    </section>
  </div>
</template>
