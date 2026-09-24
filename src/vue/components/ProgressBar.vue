<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    max?: number;
    variant?: 'primary' | 'success' | 'warning' | 'danger';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    label?: string;
    showLabel?: boolean;
  }>(),
  {
    max: 100,
    variant: 'primary',
    size: 'sm',
    showLabel: false,
  }
);

const percentage = computed(() =>
  Math.min(100, Math.max(0, Math.round((props.value / props.max) * 100)))
);

const sizeClasses = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  primary: 'bg-[#38BDF8]',
  success: 'bg-[#22C55E]',
  warning: 'bg-[#F59E0B]',
  danger: 'bg-[#EF4444]',
};
</script>

<template>
  <div class="w-full space-y-1.5">
    <div
      v-if="showLabel || label"
      class="flex items-center justify-between text-xs font-mono"
    >
      <span v-if="label" class="text-[#94A3B8]">{{ label }}</span>
      <span v-if="showLabel" class="text-[#F8FAFC] font-semibold">{{ percentage }}%</span>
    </div>
    <div
      class="w-full bg-[#0B0E14] border border-[#1E293B] rounded-full overflow-hidden"
      :class="sizeClasses[size]"
      role="progressbar"
      :aria-valuenow="percentage"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label || 'Progress'"
    >
      <div
        class="h-full rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none"
        :class="variantClasses[variant]"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
