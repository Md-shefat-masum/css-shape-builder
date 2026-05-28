<script>
export default {
  name: 'ResizeHandle',
  props: {
    placement: {
      type: String,
      default: 'se',
    },
  },
  emits: ['resize-start'],
}
</script>

<template>
  <button
    class="cf-resize-handle"
    :class="`cf-resize-handle-${placement}`"
    type="button"
    :aria-label="`Resize ${placement}`"
    @mousedown.stop="$emit('resize-start', $event, placement)"
  ></button>
</template>
