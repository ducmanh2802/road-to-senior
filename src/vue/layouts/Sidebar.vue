<script setup lang="ts">
import { navSections } from '../config/navigation';
import { useActiveRoute } from '../composables/useActiveRoute';

defineEmits<{ navigate: [] }>();

const { isRouteActive, isRouteExact } = useActiveRoute();
</script>

<template>
  <aside
    class="flex-col bg-[#0D121D] border-r border-[#1B2433] h-full shrink-0 select-none w-60"
    aria-label="Primary navigation"
  >
    <div class="px-4 py-3.5 border-b border-[#1B2433] flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#38BDF8]" aria-hidden="true" />
        <span class="text-xs font-mono font-bold text-[#F1F5F9] tracking-wider">
          SENIOR JAVA 180
        </span>
      </div>
      <span class="text-[10px] font-mono text-[#64748B] uppercase">LTS 25</span>
    </div>

    <nav class="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-3" aria-label="Main">
      <div v-for="section in navSections" :key="section.title" class="mb-3" data-testid="nav-section">
        <div class="px-2 pt-1 pb-1 text-[10px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
          {{ section.title }}
        </div>
        <ul class="space-y-0.5">
          <li v-for="item in section.items" :key="item.to + item.label">
            <RouterLink
              :to="item.to"
              class="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-ring"
              :class="[
                item.child ? 'pl-6' : '',
                isRouteActive(item.to)
                  ? 'bg-[#151D2C] text-[#38BDF8] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151D2C]/60',
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

    <div class="p-3 border-t border-[#1B2433] bg-[#0A0E17]/80 mt-auto">
      <div class="text-[10px] font-mono text-[#64748B] mb-1">ENGINEERING LOOP</div>
      <div class="text-[9px] font-mono text-[#94A3B8] flex flex-wrap gap-1 items-center">
        <span>LEARN</span><span class="text-[#64748B]">→</span>
        <span>BUILD</span><span class="text-[#64748B]">→</span>
        <span>BREAK</span><span class="text-[#64748B]">→</span>
        <span>DEBUG</span><span class="text-[#64748B]">→</span>
        <span>EXPLAIN</span><span class="text-[#64748B]">→</span>
        <span>INTERVIEW</span>
      </div>
    </div>
  </aside>
</template>
