<script>
export default {
  name: 'GridOverlay',
  props: {
    gridSize: {
      type: Number,
      default: 10,
    },
  },
  computed: {
    gridStyle() {
      return {
        backgroundSize: `${this.gridSize}px ${this.gridSize}px`,
      }
    },
  },
}
</script>

<template>
  <div class="cf-grid-overlay" :style="gridStyle" aria-hidden="true"></div>
</template>
