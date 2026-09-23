<script setup lang="ts">
/**
 * Vue port of src/components/ui/Card.tsx (design-system parity).
 */
import { computed } from 'vue';

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'sunken'
  | 'outline'
  | 'interactive'
  | 'emphasis'
  | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: CardVariant;
    padding?: CardPadding;
    interactive?: boolean;
  }>(),
  { variant: 'default', padding: 'md', interactive: false }
);

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-6',
};

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-[#111622] border border-[#1E293B]',
  elevated: 'bg-[#151B28] border border-[#1E293B] shadow-lg shadow-black/20',
  sunken: 'bg-[#0B0E14] border border-[#1E293B]',
  outline: 'bg-transparent border border-[#1E293B]',
  interactive:
    'bg-[#111622] border border-[#1E293B] hover:border-[#38BDF8]/40 hover:bg-[#151B28] transition-all duration-150 cursor-pointer',
  emphasis: 'bg-[#151B28] border border-[#38BDF8]/30 shadow-md shadow-[#38BDF8]/5',
  glass: 'bg-[#111622]/80 backdrop-blur-xs border border-[#1E293B]',
};

const classes = computed(
  () =>
    `rounded-md ${variantClasses[props.variant]} ${paddingClasses[props.padding]} ${
      props.interactive && props.variant !== 'interactive'
        ? 'hover:border-[#38BDF8]/40 hover:bg-[#151B28] transition-all duration-150 cursor-pointer'
        : ''
    }`
);
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>