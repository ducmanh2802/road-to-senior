<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
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
  showLineNumbers: false,
});

const displayTitle = computed(() => props.title || props.filename);
const languageLabel = computed(() => (props.language || 'java').toUpperCase());

const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

const lines = computed(() => props.code.trim().split('\n'));

async function handleCopy() {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(props.code);
      copied.value = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copied.value = false;
      }, 2000);
    } else {
      console.warn('Clipboard API not supported or accessible');
    }
  } catch (err) {
    // Graceful error handling: ensure component does not crash on clipboard failure
    console.error('Failed to copy code to clipboard', err);
  }
}

onBeforeUnmount(() => {
  if (copyTimeout) {
    clearTimeout(copyTimeout);
  }
});
</script>

<template>
  <div
    class="rounded-md border border-[#1E293B] bg-[#0B0E14] overflow-hidden font-mono text-xs"
    data-testid="code-block"
    role="region"
    :aria-label="displayTitle || `${languageLabel} code block`"
  >
    <!-- Code Header -->
    <div class="px-3.5 py-2 bg-[#111622] border-b border-[#1E293B] flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-[#94A3B8] truncate">
        <span class="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60 inline-block" aria-hidden="true" />
        <span class="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60 inline-block" aria-hidden="true" />
        <span class="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60 inline-block" aria-hidden="true" />
        <span v-if="displayTitle" class="text-[#F8FAFC] font-medium ml-1 truncate" data-testid="code-title">
          {{ displayTitle }}
        </span>
        <span class="text-[10px] uppercase text-[#64748B] ml-1" data-testid="code-language">
          [{{ languageLabel }}]
        </span>
      </div>

      <button
        type="button"
        :aria-label="copied ? 'Copied code to clipboard' : 'Copy code to clipboard'"
        :title="copied ? 'Copied' : 'Copy code to clipboard'"
        class="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#38BDF8] transition-colors p-1 rounded hover:bg-[#1E293B] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
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

    <!-- Code Body -->
    <div class="p-3.5 overflow-x-auto custom-scrollbar text-[#E5E7EB]">
      <table v-if="showLineNumbers" class="w-full border-collapse" role="presentation" data-testid="code-table">
        <tbody>
          <tr v-for="(line, idx) in lines" :key="idx" class="hover:bg-[#151B28]/40">
            <td class="pr-4 select-none text-[#64748B] text-right font-mono text-[11px] w-8">
              {{ idx + 1 }}
            </td>
            <td class="whitespace-pre font-mono"><code>{{ line }}</code></td>
          </tr>
        </tbody>
      </table>
      <pre v-else class="whitespace-pre font-mono leading-relaxed" data-testid="code-pre"><code>{{ code.trim() }}</code></pre>
    </div>
  </div>
</template>
