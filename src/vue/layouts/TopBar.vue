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
    class="h-14 shrink-0 border-b border-[#1E293B] bg-[#111622] flex items-center justify-between px-4 gap-3"
    role="banner"
  >
    <div class="flex items-center gap-3 min-w-0">
      <button
        class="md:hidden p-1.5 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] focus-ring"
        aria-label="Open navigation"
        @click="$emit('toggleMobileNav')"
      >
        <Menu class="w-5 h-5" aria-hidden="true" />
      </button>
      <nav aria-label="Breadcrumb">
        <ol class="flex items-center gap-1.5 font-mono text-xs min-w-0">
          <li class="text-[#64748B]">{{ currentSection }}</li>
          <li v-if="currentTitle" aria-hidden="true" class="text-[#334155]">/</li>
          <li v-if="currentTitle" class="text-[#E5E7EB] truncate">{{ currentTitle }}</li>
        </ol>
      </nav>
    </div>

    <button
      class="flex items-center gap-2 rounded-md border border-[#1E293B] bg-[#0B0E14] px-3 py-1.5 text-xs font-mono text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8] focus-ring"
      aria-label="Open command palette"
      @click="$emit('openPalette')"
    >
      <Search class="w-3.5 h-3.5" aria-hidden="true" />
      <span>Search…</span>
      <kbd class="text-[9px] border border-[#1E293B] rounded px-1 py-0.5">{{ paletteHint }}</kbd>
    </button>
  </header>
</template>
