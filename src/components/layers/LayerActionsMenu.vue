<script>
export default {
  name: 'LayerActionsMenu',
  emits: ['add-child', 'delete', 'duplicate', 'hide', 'lock', 'rename'],
}
</script>

<template>
  <div class="cf-layer-menu" role="menu">
    <button type="button" @click="$emit('rename')">Rename</button>
    <button type="button" @click="$emit('add-child')">Add Child</button>
    <button type="button" @click="$emit('duplicate')">Duplicate</button>
    <button type="button" @click="$emit('hide')">Hide / Show</button>
    <button type="button" @click="$emit('lock')">Lock / Unlock</button>
    <button type="button" @click="$emit('delete')">Delete</button>
  </div>
</template>
