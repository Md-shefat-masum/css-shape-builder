<script>
export default {
  name: 'CssOutput',
  props: {
    css: {
      type: String,
      default: '',
    },
  },
  emits: ['copy', 'download', 'edit', 'format', 'reset'],
}
</script>

<template>
  <section class="cf-output-block">
    <div class="cf-output-actions">
      <button class="cf-mini-action" type="button" @click="$emit('copy')">Copy CSS</button>
      <button class="cf-mini-action" type="button" @click="$emit('edit')">Edit CSS</button>
      <button class="cf-mini-action" type="button" @click="$emit('reset')">Reset Generated</button>
      <button class="cf-mini-action" type="button" @click="$emit('format')">Format</button>
      <button class="cf-mini-action" type="button" @click="$emit('download')">Download CSS</button>
    </div>
    <pre class="cf-code-output"><code>{{ css }}</code></pre>
  </section>
</template>
