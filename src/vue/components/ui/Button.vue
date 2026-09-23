<script setup lang="ts">
/**
 * Vue port of src/components/ui/Button.tsx (design-system parity).
 * Renders a native <button>; all extra attributes fall through.
 */
import { computed } from 'vue';
import type { FunctionalComponent } from 'vue';
import { Loader2 } from 'lucide-vue-next';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline'
  | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    icon?: FunctionalComponent | null;
  }>(),
  { variant: 'primary', size: 'md', isLoading: false, disabled: false, type: 'button', icon: null }
);

const baseClasses =
  'inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus-ring select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1 gap-1.5 h-7',
  md: 'text-xs px-3.5 py-1.5 gap-2 h-9',
  lg: 'text-sm px-4 py-2 gap-2.5 h-10',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#38BDF8] text-[#0B0E14] font-semibold hover:bg-[#0EA5E9] active:bg-[#0284C7] shadow-sm',
  secondary: 'bg-[#151B28] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] hover:border-[#334155]',
  ghost: 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60',
  outline: 'bg-transparent text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8]/10 hover:border-[#38BDF8]',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] font-medium shadow-sm',
  success: 'bg-[#22C55E] text-[#0B0E14] font-semibold hover:bg-[#16A34A] shadow-sm',
};

const classes = computed(
  () => `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]}`
);
</script>

<template>
  <button :type="type" :disabled="disabled || isLoading" :class="classes">
    <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
    <component :is="icon" v-else-if="icon" class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
    <slot />
  </button>
</template>