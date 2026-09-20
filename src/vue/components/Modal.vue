<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { X } from 'lucide-vue-next';

interface Props {
  title: string;
}

defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const titleId = 'modal-title-' + Math.random().toString(36).slice(2, 7);

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-lg rounded-lg border border-[#1E293B] bg-[#111622] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
        <h3 :id="titleId" class="text-sm font-semibold text-[#F8FAFC]">
          {{ title }}
        </h3>
        <button
          type="button"
          class="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
          aria-label="Close dialog"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="p-5 overflow-y-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
