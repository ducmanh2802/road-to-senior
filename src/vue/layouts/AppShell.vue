<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Sidebar from './Sidebar.vue';
import TopBar from './TopBar.vue';

const isMobileNavOpen = ref(false);
const isPaletteOpen = ref(false);

function onKeydown(e: KeyboardEvent): void {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    isPaletteOpen.value = !isPaletteOpen.value;
    return;
  }
  if (e.key === 'Escape') {
    isPaletteOpen.value = false;
    isMobileNavOpen.value = false;
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#0B0E14] text-[#E5E7EB] font-sans antialiased">
    <!-- Desktop persistent sidebar -->
    <Sidebar class="hidden md:flex" />

    <!-- Mobile drawer overlay -->
    <Transition name="drawer">
      <div v-if="isMobileNavOpen" class="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Navigation">
        <div class="fixed inset-0 bg-black/70" @click="isMobileNavOpen = false" />
        <Sidebar class="relative w-72 z-50" @navigate="isMobileNavOpen = false" />
      </div>
    </Transition>

    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <TopBar @open-palette="isPaletteOpen = true" @toggle-mobile-nav="isMobileNavOpen = !isMobileNavOpen" />
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <RouterView />
      </main>
    </div>

    <CommandPalette v-if="isPaletteOpen" @close="isPaletteOpen = false" />
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .drawer-enter-active,
  .drawer-leave-active {
    transition: none;
  }
}
</style>
