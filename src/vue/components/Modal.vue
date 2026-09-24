<script setup lang="ts">
/**
 * Page-level modal wrapper: delegates dialogs, focus handling and Escape /
 * backdrop dismissal to the shared `ui/Modal.vue` primitive. Kept so pages can
 * use the short `<Modal title="…" @close="…">` API without duplicating the
 * dialog implementation.
 */
import UiModal from './ui/Modal.vue';

defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <UiModal :is-open="true" :title="title" @close="emit('close')">
    <slot />
  </UiModal>
</template>
