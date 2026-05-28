<script>
export default {
  name: 'RangeInput',
  props: {
    label: {
      type: String,
      default: 'Range',
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'update:modelValue'],
  methods: {
    emitValue(event) {
      const value = Number(event.target.value)

      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
  },
}
</script>

<template>
  <label class="cf-field-stack">
    <span>{{ label }}</span>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :disabled="disabled"
      @input="emitValue"
    />
  </label>
</template>
