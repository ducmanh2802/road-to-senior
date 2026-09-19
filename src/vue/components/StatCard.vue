<script setup lang="ts">
import type { Component } from 'vue';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';

export interface TrendConfig {
  value: string | number;
  direction: 'up' | 'down' | 'neutral';
  label?: string;
}

const props = withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    subValue?: string;
    icon?: Component;
    iconColor?: string;
    iconBg?: string;
    trend?: TrendConfig;
    interactive?: boolean;
  }>(),
  {
    iconColor: 'text-[#38BDF8]',
    iconBg: 'bg-[#38BDF8]/10 border-[#38BDF8]/20',
    interactive: false,
  }
);

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    class="ui-panel p-3 sm:p-4 flex flex-col justify-between text-left transition-all duration-150 select-none"
    :class="{
      'hover:border-[#38BDF8]/40 hover:bg-[#151B28] cursor-pointer focus-ring': interactive,
    }"
    @click="interactive ? emit('click') : undefined"
  >
    <div class="flex items-center justify-between gap-2 mb-2 w-full">
      <span class="text-[11px] font-mono tracking-wide text-[#94A3B8] uppercase">
        {{ label }}
      </span>
      <div
        v-if="icon"
        class="w-6 h-6 rounded flex items-center justify-center border shrink-0"
        :class="[iconBg, iconColor]"
      >
        <component :is="icon" class="w-3.5 h-3.5" aria-hidden="true" />
      </div>
    </div>

    <div class="flex items-baseline justify-between gap-2 w-full">
      <div class="flex items-baseline gap-1.5">
        <span class="text-xl sm:text-2xl font-bold font-mono text-[#F8FAFC] tracking-tight">
          {{ value }}
        </span>
        <span v-if="subValue && !trend" class="text-xs font-mono text-[#64748B]">
          {{ subValue }}
        </span>
      </div>

      <div
        v-if="trend"
        class="flex items-center gap-1 text-[11px] font-mono font-medium"
        :class="{
          'text-[#22C55E]': trend.direction === 'up',
          'text-[#EF4444]': trend.direction === 'down',
          'text-[#94A3B8]': trend.direction === 'neutral',
        }"
      >
        <TrendingUp v-if="trend.direction === 'up'" class="w-3 h-3" aria-hidden="true" />
        <TrendingDown v-else-if="trend.direction === 'down'" class="w-3 h-3" aria-hidden="true" />
        <span>{{ trend.value }}</span>
        <span v-if="trend.label" class="text-[#64748B] text-[10px]">{{ trend.label }}</span>
      </div>
    </div>
  </component>
</template>
