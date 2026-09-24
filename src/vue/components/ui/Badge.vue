<script setup lang="ts">
/**
 * Vue port of src/components/ui/Badge.tsx (design-system parity).
 */
import { computed } from 'vue';
import type { FunctionalComponent } from 'vue';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'cyan'
  | 'pink'
  | 'neutral'
  | 'outline';

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
    pulse?: boolean;
    mono?: boolean;
    icon?: FunctionalComponent | null;
  }>(),
  { variant: 'default', size: 'md', dot: false, pulse: false, mono: true, icon: null }
);

const sizeClasses: Record<'sm' | 'md', string> = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-0.5 gap-1.5',
};

const variantClasses: Record<BadgeVariant, { bg: string; dot: string }> = {
  default: { bg: 'bg-[#151D2C] text-[#94A3B8] border border-[#1B2433]', dot: 'bg-[#94A3B8]' },
  primary: { bg: 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30', dot: 'bg-[#38BDF8]' },
  success: { bg: 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30', dot: 'bg-[#22C55E]' },
  warning: { bg: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30', dot: 'bg-[#F59E0B]' },
  danger: { bg: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30', dot: 'bg-[#EF4444]' },
  info: { bg: 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30', dot: 'bg-[#38BDF8]' },
  purple: { bg: 'bg-[#A855F7]/10 text-[#C084FC] border border-[#A855F7]/30', dot: 'bg-[#A855F7]' },
  cyan: { bg: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30', dot: 'bg-[#06B6D4]' },
  pink: { bg: 'bg-[#EC4899]/10 text-[#F472B6] border border-[#EC4899]/30', dot: 'bg-[#EC4899]' },
  neutral: { bg: 'bg-[#0A0E17] text-[#64748B] border border-[#1B2433]', dot: 'bg-[#64748B]' },
  outline: { bg: 'bg-transparent text-[#94A3B8] border border-[#1B2433]', dot: 'bg-[#94A3B8]' },
};

const classes = computed(() => {
  const v = variantClasses[props.variant];
  return `inline-flex items-center font-medium rounded-md ${props.mono ? 'font-mono' : 'font-sans'} ${sizeClasses[props.size]} ${v.bg}`;
});

const dotClass = computed(() => `w-1.5 h-1.5 rounded-full ${variantClasses[props.variant].dot} ${props.pulse ? 'animate-pulse' : ''}`);
</script>

<template>
  <span :class="classes">
    <span v-if="dot" :class="dotClass" />
    <component :is="icon" v-if="icon" class="w-3 h-3 shrink-0" aria-hidden="true" />
    <span><slot /></span>
  </span>
</template>