<script>
export default {
  name: 'NumberInput',
  props: {
    label: {
      type: String,
      default: 'Value',
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    step: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      default: '',
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
    <span class="cf-input-with-unit">
      <input
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        @input="emitValue"
      />
      <small v-if="unit">{{ unit }}</small>
    </span>
  </label>
</template>
