<script setup lang="ts">
/**
 * Canonical modal: dialog semantics, Escape to close, backdrop click to close,
 * focus moved into the dialog and restored to the trigger on close.
 * `src/vue/components/Modal.vue` is a thin wrapper over this component.
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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

const dialogRef = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusFirstElement(): void {
  const root = dialogRef.value;
  if (!root) return;
  const focusable = root.querySelectorAll<HTMLElement>(FOCUSABLE);
  (focusable[0] ?? root).focus();
}

function handleKeydown(e: KeyboardEvent): void {
  if (!props.isOpen) return;

  if (e.key === 'Escape') {
    emit('close');
    return;
  }

  if (e.key !== 'Tab') return;

  // Keep keyboard focus inside the dialog while it is open.
  const root = dialogRef.value;
  if (!root) return;
  const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (focusable.length === 0) {
    e.preventDefault();
    root.focus();
    return;
  }
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  const active = document.activeElement as HTMLElement | null;

  if (e.shiftKey && (active === first || active === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      void nextTick(focusFirstElement);
    } else {
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
      previouslyFocused = null;
    }
  },
  { immediate: true }
);

onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div class="fixed inset-0" aria-hidden="true" @click="emit('close')" />
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        :class="`relative w-full ${maxWidthClasses[maxWidth]} bg-[#101623] border border-[#1B2433] rounded-lg shadow-xl shadow-black/60 overflow-hidden max-h-[90vh] flex flex-col`"
      >
        <div
          v-if="title"
          class="px-5 py-4 border-b border-[#1B2433] flex items-center justify-between gap-3 shrink-0"
        >
          <div>
            <h2 class="text-sm font-semibold text-[#F1F5F9]">{{ title }}</h2>
            <p v-if="subtitle" class="text-xs text-[#94A3B8] mt-0.5">{{ subtitle }}</p>
          </div>
          <IconButton :icon="X" size="sm" variant="ghost" label="Close dialog" @click="emit('close')" />
        </div>

        <div class="p-5 overflow-y-auto custom-scrollbar flex-1">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="px-5 py-3 border-t border-[#1B2433] bg-[#0A0E17]/40 flex items-center justify-end gap-2 shrink-0"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
