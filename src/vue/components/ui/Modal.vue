<script setup lang="ts">
/**
 * Vue port of src/components/ui/Modal.tsx (design-system parity).
 * Closes on Escape key and on backdrop click.
 */
import { onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';
import IconButton from './IconButton.vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  }>(),
  { title: undefined, subtitle: undefined, maxWidth: 'lg' }
);

const emit = defineEmits<{ close: [] }>();

const maxWidthClasses: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
};

function handleEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.isOpen) emit('close');
}

onMounted(() => window.addEventListener('keydown', handleEscape));
onUnmounted(() => window.removeEventListener('keydown', handleEscape));
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
  >
    <div class="fixed inset-0" aria-hidden="true" @click="emit('close')" />
    <div
      role="dialog"
      aria-modal="true"
      :class="`relative w-full ${maxWidthClasses[maxWidth]} bg-[#111622] border border-[#1E293B] rounded-lg shadow-2xl shadow-black/80 overflow-hidden`"
    >
      <div
        v-if="title"
        class="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between gap-3 shrink-0"
      >
        <div>
          <h3 class="text-sm font-bold text-[#F8FAFC]">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-[#94A3B8] mt-0.5">{{ subtitle }}</p>
        </div>
        <IconButton :icon="X" size="sm" variant="ghost" label="Close modal" @click="emit('close')" />
      </div>

      <div class="p-5 overflow-y-auto custom-scrollbar flex-1">
        <slot />
      </div>

      <div
        v-if="$slots.footer"
        class="px-5 py-3 border-t border-[#1E293B] bg-[#0B0E14]/40 flex items-center justify-end gap-2 shrink-0"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>