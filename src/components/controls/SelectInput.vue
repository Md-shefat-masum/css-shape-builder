<script>
export default {
  name: 'SelectInput',
  props: {
    label: {
      type: String,
      default: 'Select',
    },
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
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
    <select :value="modelValue" :disabled="disabled" @change="emitValue">
      <option
        v-for="option in options"
        :key="option.value || option.id"
        :value="option.value || option.id"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
