<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Search, CornerDownLeft } from 'lucide-vue-next';

const emit = defineEmits<{ close: [] }>();
const router = useRouter();

interface Command {
  label: string;
  to: string;
  section: string;
}

/** Only routes that actually exist in the canonical route table. */
const commands: Command[] = [
  { label: 'Go to Command Center', to: '/', section: 'Navigation' },
  { label: 'Go to Roadmap', to: '/learning/roadmap', section: 'Learning' },
  { label: 'Go to Learning Path', to: '/learning', section: 'Navigation' },
  { label: 'Go to Java 25', to: '/learning/java', section: 'Learning' },
  { label: 'Go to AI Knowledge', to: '/learning/ai', section: 'Learning' },
  { label: 'Go to Technical English', to: '/english', section: 'Learning' },
  { label: 'Go to Spring Boot', to: '/learning/spring', section: 'Learning' },
  { label: 'Go to Architecture', to: '/architecture', section: 'Navigation' },
  { label: 'Go to AWS AIF-C01', to: '/certifications/aws/aif-c01', section: 'Certifications' },
  { label: 'Go to Interview', to: '/interview', section: 'Navigation' },
  { label: 'Go to Mistakes', to: '/review/mistakes', section: 'Review' },
  { label: 'Go to Settings', to: '/settings', section: 'Configuration' },
];

const query = ref('');
const activeIndex = ref(0);
const listRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const filtered = computed<Command[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter(
    (c) => c.label.toLowerCase().includes(q) || c.section.toLowerCase().includes(q),
  );
});

function move(delta: number): void {
  if (filtered.value.length === 0) return;
  activeIndex.value = (activeIndex.value + delta + filtered.value.length) % filtered.value.length;
  nextTick(() => {
    const items = listRef.value?.querySelectorAll('[data-command]');
    const target = items ? items[activeIndex.value] : undefined;
    // jsdom (and some embedded browsers) do not implement scrollIntoView
    if (typeof target?.scrollIntoView === 'function') {
      target.scrollIntoView({ block: 'nearest' });
    }
  });
}

function run(command: Command | undefined): void {
  if (!command) return;
  emit('close');
  void router.push(command.to);
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    move(1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    move(-1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    run(filtered.value[activeIndex.value]);
  }
}

onMounted(() => inputRef.value?.focus());
onBeforeUnmount(() => {
  // focus restore target is the TopBar search trigger (semantic, always present)
  document.querySelector<HTMLButtonElement>('[aria-label="Open command palette"]')?.focus();
});
</script>

<template>
  <div
    class="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] bg-black/70"
    role="dialog"
    aria-modal="true"
    aria-label="Command palette"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-lg rounded-lg border border-[#1E293B] bg-[#111622] shadow-2xl overflow-hidden"
      data-testid="command-palette"
    >
      <div class="flex items-center gap-2 px-3 py-2.5 border-b border-[#1E293B]">
        <Search class="w-4 h-4 text-[#64748B]" aria-hidden="true" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-list"
          aria-activedescendant="command-option-0"
          placeholder="Type a command…"
          class="flex-1 bg-transparent text-sm text-[#E5E7EB] placeholder-[#475569] outline-none"
          @input="activeIndex = 0"
          @keydown="onKeydown"
        />
        <kbd class="text-[9px] font-mono text-[#475569] border border-[#1E293B] rounded px-1 py-0.5">Esc</kbd>
      </div>

      <div v-if="filtered.length === 0" class="px-4 py-8 text-center text-xs font-mono text-[#64748B]">
        Search is not available yet — only route navigation commands exist.
      </div>

      <ul
        v-else
        id="command-list"
        ref="listRef"
        role="listbox"
        aria-label="Commands"
        class="max-h-72 overflow-y-auto custom-scrollbar py-1"
      >
        <li
          v-for="(command, index) in filtered"
          :id="`command-option-${index}`"
          :key="command.to + command.label"
          role="option"
          :aria-selected="index === activeIndex"
          data-command
          class="flex items-center justify-between px-3 py-2 text-sm cursor-pointer"
          :class="index === activeIndex ? 'bg-[#1E293B] text-white' : 'text-[#94A3B8]'"
          @mouseenter="activeIndex = index"
          @click="run(command)"
        >
          <span class="flex items-center gap-2.5">
            <CornerDownLeft v-if="index === activeIndex" class="w-3 h-3 text-[#38BDF8]" aria-hidden="true" />
            <span class="font-medium">{{ command.label }}</span>
          </span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#1E293B] bg-[#0B0E14] text-[#64748B]">
            {{ command.section }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  [data-command] {
    transition: background-color 0.1s ease;
  }
}
</style>
