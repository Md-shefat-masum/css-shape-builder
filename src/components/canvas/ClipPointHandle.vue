<script>
import { mapActions, mapState } from 'pinia'

import { useEditorStore } from '../../stores/editorStore'

export default {
  name: 'ClipPointHandle',
  props: {
    point: {
      type: Object,
      required: true,
    },
    layerId: {
      type: String,
      required: true,
    },
  },
  emits: ['clip-point-mouse-down'],
  computed: {
    ...mapState(useEditorStore, ['selectedClipPoint']),
    isSelected() {
      return (
        this.selectedClipPoint.layerId === this.layerId &&
        this.selectedClipPoint.pointId === this.point.id
      )
    },
    pointStyle() {
      return {
        left: this.point.unit === 'px' ? `${this.point.x}px` : `${this.point.x}%`,
        top: this.point.unit === 'px' ? `${this.point.y}px` : `${this.point.y}%`,
      }
    },
  },
  methods: {
    ...mapActions(useEditorStore, ['selectClipPoint']),
    handleMouseDown(event) {
      this.selectClipPoint(this.layerId, this.point.id)
      this.$emit('clip-point-mouse-down', event, this.layerId, this.point.id)
    },
  },
}
</script>

<template>
  <button
    class="cf-clip-handle cf-clip-point"
    :class="{ 'is-active': isSelected }"
    :style="pointStyle"
    type="button"
    :aria-label="`Clip point ${point.id}`"
    @mousedown.stop="handleMouseDown"
  ></button>
</template>
