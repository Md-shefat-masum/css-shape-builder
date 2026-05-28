<script>
export default {
  name: 'HtmlOutput',
  props: {
    html: {
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
      <button class="cf-mini-action" type="button" @click="$emit('copy')">Copy HTML</button>
      <button class="cf-mini-action" type="button" @click="$emit('edit')">Edit HTML</button>
      <button class="cf-mini-action" type="button" @click="$emit('reset')">Reset Generated</button>
      <button class="cf-mini-action" type="button" @click="$emit('format')">Format</button>
      <button class="cf-mini-action" type="button" @click="$emit('download')">Download HTML</button>
    </div>
    <pre class="cf-code-output"><code>{{ html }}</code></pre>
  </section>
</template>
