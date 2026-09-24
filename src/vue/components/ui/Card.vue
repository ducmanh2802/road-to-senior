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
  default: 'bg-[#101623] border border-[#1B2433]',
  elevated: 'bg-[#151D2C] border border-[#1B2433]',
  sunken: 'bg-[#0A0E17] border border-[#1B2433]',
  outline: 'bg-transparent border border-[#1B2433]',
  interactive:
    'bg-[#101623] border border-[#1B2433] hover:border-[#38BDF8]/40 hover:bg-[#151D2C] ui-transition cursor-pointer',
  emphasis: 'bg-[#151D2C] border border-[#38BDF8]/40',
  glass: 'bg-[#101623]/90 border border-[#1B2433]',
};

const classes = computed(
  () =>
    `rounded-lg ${variantClasses[props.variant]} ${paddingClasses[props.padding]} ${
      props.interactive && props.variant !== 'interactive'
        ? 'ui-transition hover:border-[#38BDF8]/40 hover:bg-[#151D2C] cursor-pointer'
        : ''
    }`
);
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>