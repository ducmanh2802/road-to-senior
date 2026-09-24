<script setup lang="ts">
import { AlertOctagon } from 'lucide-vue-next';
import Button from './ui/Button.vue';

withDefaults(
  defineProps<{
    /** User-facing summary of what happened (no stack traces). */
    message: string;
    /** Contextual heading — prefer the page's own wording over a generic one. */
    title?: string;
    /** Optional technical detail, kept out of the main message. */
    detail?: string;
    retryLabel?: string;
  }>(),
  { title: "Couldn't complete that action", retryLabel: 'Try again' }
);

const emit = defineEmits<{ retry: [] }>();
const showDetail = defineModel<boolean>('detailVisible', { default: false });

function toggleDetail(): void {
  showDetail.value = !showDetail.value;
}
</script>

<template>
  <div
    class="p-6 text-center flex flex-col items-center justify-center border border-[#EF4444]/30 rounded-lg bg-[#EF4444]/5"
    role="alert"
    data-testid="error-state"
  >
    <div class="w-9 h-9 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mb-2.5">
      <AlertOctagon class="w-4.5 h-4.5" aria-hidden="true" />
    </div>
    <h4 class="text-sm font-semibold text-[#F1F5F9] tracking-tight">{{ title }}</h4>
    <p class="text-xs text-[#FCA5A5] max-w-md mt-1 mb-3 leading-relaxed">{{ message }}</p>

    <div class="flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline" size="md" @click="emit('retry')">
        {{ retryLabel }}
      </Button>
      <Button
        v-if="detail"
        variant="ghost"
        size="md"
        :aria-expanded="showDetail"
        @click="toggleDetail"
      >
        {{ showDetail ? 'Hide' : 'Show' }} technical detail
      </Button>
    </div>

    <pre
      v-if="detail && showDetail"
      class="mt-3 w-full max-w-md text-left text-[10px] font-mono text-[#94A3B8] bg-[#0A0E17] border border-[#1B2433] rounded-md p-3 overflow-x-auto custom-scrollbar"
    >{{ detail }}</pre>
  </div>
</template>
