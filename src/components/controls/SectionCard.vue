<script>
export default {
  name: 'SectionCard',
  props: {
    title: {
      type: String,
      default: '',
    },
    collapsible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isOpen: true,
    }
  },
}
</script>

<template>
  <section class="cf-panel-section">
    <button
      v-if="title"
      class="cf-section-header"
      type="button"
      @click="collapsible ? (isOpen = !isOpen) : null"
    >
      <span class="cf-section-label">{{ title }}</span>
      <small v-if="collapsible">{{ isOpen ? 'Hide' : 'Show' }}</small>
    </button>
    <div v-if="isOpen">
      <slot />
    </div>
  </section>
</template>
