<script setup lang="ts">
/**
 * Vue port of src/components/ui/CodeBlock.tsx (design-system parity).
 * Plain monospace pre/code rendering with clipboard copy (no syntax
 * highlighter dependency — the React version renders plain code too).
 */
import { computed, ref } from 'vue';
import { Copy, Check } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
    filename?: string;
    title?: string;
    showLineNumbers?: boolean;
  }>(),
  { language: 'java', filename: undefined, title: undefined, showLineNumbers: false }
);

const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;

async function handleCopy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    console.error(e);
  }
}

const displayTitle = computed(() => props.title || props.filename);
const lines = computed(() => props.code.trim().split('\n'));
</script>

<template>
  <div class="rounded-lg border border-[#1B2433] bg-[#0A0E17] overflow-hidden font-mono text-xs">
    <div class="px-3.5 py-2 bg-[#101623] border-b border-[#1B2433] flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-[#94A3B8] truncate">
        <span class="w-2 h-2 rounded-full bg-[#EF4444]/70 inline-block" />
        <span class="w-2 h-2 rounded-full bg-[#F59E0B]/70 inline-block" />
        <span class="w-2 h-2 rounded-full bg-[#22C55E]/70 inline-block" />
        <span v-if="displayTitle" class="text-[#F1F5F9] font-medium ml-1 truncate">{{ displayTitle }}</span>
        <span class="text-[10px] uppercase text-[#64748B] ml-1">[{{ language }}]</span>
      </div>
      <button
        type="button"
        class="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#38BDF8] transition-colors p-1 rounded hover:bg-[#151D2C] cursor-pointer"
        title="Copy code to clipboard"
        @click="handleCopy"
      >
        <Check v-if="copied" class="w-3.5 h-3.5 text-[#22C55E]" />
        <Copy v-else class="w-3.5 h-3.5" />
        <span :class="copied ? 'text-[#22C55E]' : ''">{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>
    <pre class="p-4 overflow-x-auto custom-scrollbar text-[#E2E8F0] leading-relaxed"><code><span
        v-for="(line, i) in lines"
        :key="i"
        class="block whitespace-pre"
      ><span
          v-if="showLineNumbers"
          class="select-none text-[#334155] inline-block w-8 mr-3 text-right"
        >{{ i + 1 }}</span>{{ line }}</span></code></pre>
  </div>
</template>