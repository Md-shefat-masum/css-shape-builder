<script>
export default {
  name: 'UnitInput',
  props: {
    label: {
      type: String,
      default: 'Unit Value',
    },
    value: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '%',
    },
  },
  emits: ['update:value', 'update:unit'],
}
</script>

<template>
  <label class="cf-field-stack">
    <span>{{ label }}</span>
    <span class="flex gap-2">
      <input
        type="number"
        :value="value"
        @input="$emit('update:value', Number($event.target.value))"
      />
      <select :value="unit" @change="$emit('update:unit', $event.target.value)">
        <option value="%">%</option>
        <option value="px">px</option>
      </select>
    </span>
  </label>
</template>
