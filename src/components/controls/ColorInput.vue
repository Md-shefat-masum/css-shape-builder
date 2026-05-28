<script>
export default {
  name: 'ColorInput',
  props: {
    label: {
      type: String,
      default: 'Color',
    },
    modelValue: {
      type: String,
      default: '#22d3ee',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'update:modelValue'],
  methods: {
    emitValue(event) {
      this.$emit('update:modelValue', event.target.value)
      this.$emit('change', event.target.value)
    },
  },
}
</script>

<template>
  <label class="cf-field-stack">
    <span>{{ label }}</span>
    <span class="cf-color-input-row">
      <input type="color" :value="modelValue" :disabled="disabled" @input="emitValue" />
      <input type="text" :value="modelValue" :disabled="disabled" @change="emitValue" />
    </span>
  </label>
</template>
