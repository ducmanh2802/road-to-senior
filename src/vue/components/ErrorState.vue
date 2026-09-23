<script setup lang="ts">
import { AlertOctagon } from 'lucide-vue-next';

defineProps<{
  /** User-facing summary of what happened (no stack traces). */
  message: string;
  /** Optional technical detail, kept out of the main message. */
  detail?: string;
  retryLabel?: string;
}>();

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
    <div class="w-10 h-10 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mb-2.5">
      <AlertOctagon class="w-5 h-5" aria-hidden="true" />
    </div>
    <h4 class="text-sm font-semibold text-white tracking-tight">Something went wrong</h4>
    <p class="text-xs text-[#FCA5A5] max-w-sm mt-1 mb-3 font-mono leading-relaxed">{{ message }}</p>

    <div class="flex items-center gap-2">
      <button
        v-if="retryLabel !== ''"
        class="px-3 py-1.5 rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 text-xs font-semibold text-[#FCA5A5] hover:bg-[#EF4444]/20 focus-ring"
        @click="emit('retry')"
      >
        {{ retryLabel ?? 'Try Again' }}
      </button>
      <button
        v-if="detail"
        class="px-3 py-1.5 rounded-md border border-[#1E293B] bg-[#151B28] text-xs font-mono text-[#94A3B8] hover:text-white focus-ring"
        :aria-expanded="showDetail"
        @click="toggleDetail"
      >
        {{ showDetail ? 'Hide' : 'Show' }} technical detail
      </button>
    </div>

    <pre
      v-if="detail && showDetail"
      class="mt-3 w-full max-w-md text-left text-[10px] font-mono text-[#94A3B8] bg-[#0B0E14] border border-[#1E293B] rounded p-3 overflow-x-auto custom-scrollbar"
    >{{ detail }}</pre>
  </div>
</template>
