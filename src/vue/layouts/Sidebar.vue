<script setup lang="ts">
import { navSections } from '../config/navigation';
import { useActiveRoute } from '../composables/useActiveRoute';

defineEmits<{ navigate: [] }>();

const { isRouteActive, isRouteExact } = useActiveRoute();
</script>

<template>
  <aside
    class="flex-col bg-[#111622] border-r border-[#1E293B] h-full shrink-0 select-none w-64"
    aria-label="Primary navigation"
  >
    <div class="p-3 border-b border-[#1E293B]">
      <div class="text-xs font-mono font-bold text-[#38BDF8] tracking-wider px-1">
        SENIOR JAVA 180
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto custom-scrollbar px-2 py-2" aria-label="Main">
      <div v-for="section in navSections" :key="section.title" class="mb-2" data-testid="nav-section">
        <div class="px-2 pt-2 pb-1 text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-widest">
          {{ section.title }}
        </div>
        <ul class="space-y-0.5">
          <li v-for="item in section.items" :key="item.to + item.label">
            <RouterLink
              :to="item.to"
              class="flex items-center gap-2.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors focus-ring"
              :class="[
                item.child ? 'pl-6' : '',
                isRouteActive(item.to)
                  ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 font-semibold'
                  : 'text-[#94A3B8] hover:text-[#E5E7EB] hover:bg-[#1E293B]/60 border border-transparent',
              ]"
              :aria-current="isRouteExact(item.to) ? 'page' : undefined"
              @click="$emit('navigate')"
            >
              <component
                :is="item.icon"
                class="w-4 h-4 shrink-0"
                :class="isRouteActive(item.to) ? 'text-[#38BDF8]' : 'text-[#64748B]'"
                aria-hidden="true"
              />
              <span class="truncate">{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <div class="p-3 border-t border-[#1E293B] bg-[#0B0E14]/70 mt-auto">
      <div class="text-[10px] font-mono text-[#64748B] mb-1.5">ENGINEERING LOOP</div>
      <div class="text-[9px] font-mono text-[#94A3B8] leading-tight flex flex-wrap gap-1">
        <span class="text-[#38BDF8]">LEARN</span><span>→</span>
        <span class="text-[#22C55E]">BUILD</span><span>→</span>
        <span class="text-[#EF4444]">BREAK</span><span>→</span>
        <span class="text-[#F59E0B]">DEBUG</span><span>→</span>
        <span class="text-[#38BDF8]">EXPLAIN</span><span>→</span>
        <span class="text-[#A855F7]">INTERVIEW</span>
      </div>
    </div>
  </aside>
</template>
