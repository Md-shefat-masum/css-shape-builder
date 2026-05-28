<script>
import LayerTree from '../layers/LayerTree.vue'

export default {
  name: 'LayersPanel',
  components: {
    LayerTree,
  },
}
</script>

<template>
  <section class="cf-inspector-body">
    <div class="cf-panel-section">
      <p class="cf-section-label">Layer Tree</p>
      <LayerTree />
    </div>
  </section>
</template>
