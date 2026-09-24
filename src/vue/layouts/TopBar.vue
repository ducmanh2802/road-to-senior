<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Search, Menu } from 'lucide-vue-next';

defineEmits<{ openPalette: []; toggleMobileNav: [] }>();

const route = useRoute();

const currentSection = computed(() => {
  const section = route.meta.section;
  return typeof section === 'string' ? section : 'SENIOR JAVA 180';
});

const currentTitle = computed(() => {
  const title = route.meta.title;
  return typeof title === 'string' ? title : '';
});

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const paletteHint = isMac ? '⌘K' : 'Ctrl K';
</script>

<template>
  <header
    class="h-12 shrink-0 border-b border-[#1B2433] bg-[#101623] flex items-center justify-between px-4 sm:px-6 gap-3"
    role="banner"
  >
    <div class="flex items-center gap-3 min-w-0">
      <button
        class="md:hidden p-1.5 rounded text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151D2C] focus-ring"
        aria-label="Open navigation"
        @click="$emit('toggleMobileNav')"
      >
        <Menu class="w-4 h-4" aria-hidden="true" />
      </button>
      <nav aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 font-mono text-xs min-w-0">
          <li class="text-[#64748B]">{{ currentSection }}</li>
          <li v-if="currentTitle" aria-hidden="true" class="text-[#334155]">/</li>
          <li v-if="currentTitle" class="text-[#F1F5F9] font-medium truncate">{{ currentTitle }}</li>
        </ol>
      </nav>
    </div>

    <button
      class="flex items-center gap-2 rounded-md border border-[#1B2433] bg-[#0A0E17] px-2.5 py-1 text-xs font-mono text-[#94A3B8] hover:border-[#334155] hover:text-[#F1F5F9] focus-ring cursor-pointer"
      aria-label="Open command palette"
      @click="$emit('openPalette')"
    >
      <Search class="w-3.5 h-3.5" aria-hidden="true" />
      <span class="hidden sm:inline">Search…</span>
      <kbd class="text-[9px] border border-[#1B2433] bg-[#101623] rounded px-1 py-0.5 text-[#64748B]">{{ paletteHint }}</kbd>
    </button>
  </header>
</template>
