<script>
export default {
  name: 'ToggleSwitch',
  props: {
    label: {
      type: String,
      default: 'Toggle',
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'update:modelValue'],
  methods: {
    emitValue(event) {
      this.$emit('update:modelValue', event.target.checked)
      this.$emit('change', event.target.checked)
    },
  },
}
</script>

<template>
  <label class="cf-toggle-row">
    <span>{{ label }}</span>
    <input type="checkbox" :checked="modelValue" :disabled="disabled" @change="emitValue" />
  </label>
</template>
