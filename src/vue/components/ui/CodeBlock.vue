<script setup lang="ts">
/**
 * Canonical code block (single implementation for the whole app).
 * Plain monospace rendering with an optional line-number table and clipboard
 * copy. No syntax-highlighting dependency.
 */
import { computed, onBeforeUnmount, ref } from 'vue';
import { Copy, Check } from 'lucide-vue-next';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  title?: string;
  showLineNumbers?: boolean;
}

const props = withDefaults(defineProps<CodeBlockProps>(), {
  language: 'java',
  filename: undefined,
  title: undefined,
  showLineNumbers: false,
});

const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

const displayTitle = computed(() => props.title || props.filename);
const languageLabel = computed(() => (props.language || 'java').toUpperCase());
const lines = computed(() => props.code.trim().split('\n'));

async function handleCopy(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.code);
      copied.value = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copied.value = false;
      }, 2000);
    }
  } catch {
    // Clipboard unavailable (permissions / insecure context): leave the button
    // in its idle state instead of showing a false success confirmation.
    copied.value = false;
  }
}

onBeforeUnmount(() => {
  if (copyTimeout) clearTimeout(copyTimeout);
});
</script>

<template>
  <div
    class="rounded-lg border border-[#1B2433] bg-[#0A0E17] overflow-hidden font-mono text-xs"
    data-testid="code-block"
    role="region"
    :aria-label="displayTitle || `${languageLabel} code block`"
  >
    <!-- Header: title + language + copy -->
    <div class="px-3.5 py-2 bg-[#101623] border-b border-[#1B2433] flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-[#94A3B8] truncate min-w-0">
        <span
          v-if="displayTitle"
          class="text-[#F1F5F9] font-medium truncate"
          data-testid="code-title"
        >
          {{ displayTitle }}
        </span>
        <span class="text-[10px] text-[#64748B] shrink-0" data-testid="code-language">
          [{{ languageLabel }}]
        </span>
      </div>

      <button
        type="button"
        :aria-label="copied ? 'Copied code to clipboard' : 'Copy code to clipboard'"
        :title="copied ? 'Copied' : 'Copy code to clipboard'"
        class="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] ui-transition p-1 rounded hover:bg-[#151D2C] cursor-pointer focus-ring shrink-0"
        data-testid="copy-button"
        @click="handleCopy"
      >
        <template v-if="copied">
          <Check class="w-3.5 h-3.5 text-[#22C55E]" aria-hidden="true" />
          <span class="text-[#22C55E] font-medium">Copied</span>
        </template>
        <template v-else>
          <Copy class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Copy</span>
        </template>
      </button>
    </div>

    <!-- Body -->
    <div class="p-3.5 overflow-x-auto custom-scrollbar text-[#E2E8F0]">
      <table v-if="showLineNumbers" class="w-full border-collapse" role="presentation" data-testid="code-table">
        <tbody>
          <tr v-for="(line, idx) in lines" :key="idx">
            <td class="pr-4 select-none text-[#475569] text-right font-mono text-[11px] w-8 align-top">
              {{ idx + 1 }}
            </td>
            <td class="whitespace-pre font-mono leading-relaxed"><code>{{ line }}</code></td>
          </tr>
        </tbody>
      </table>
      <pre v-else class="whitespace-pre font-mono leading-relaxed" data-testid="code-pre"><code>{{ code.trim() }}</code></pre>
    </div>
  </div>
</template>
