<script setup lang="ts">
/**
 * Vue port of src/components/ui/IconButton.tsx (design-system parity).
 * `label` is required and used as the accessible aria-label.
 */
import { computed } from 'vue';
import type { FunctionalComponent } from 'vue';
import { Loader2 } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    icon: FunctionalComponent;
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
  }>(),
  { variant: 'ghost', size: 'md', isLoading: false, disabled: false }
);

defineEmits<{ click: [event: MouseEvent] }>();

const baseClasses =
  'inline-flex items-center justify-center rounded ui-transition focus-ring select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-7 h-7 p-1',
  md: 'w-8 h-8 p-1.5',
  lg: 'w-9 h-9 p-2',
};

const iconSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4.5 h-4.5',
};

const variantClasses: Record<'primary' | 'secondary' | 'ghost' | 'danger' | 'outline', string> = {
  primary: 'bg-[#38BDF8] text-[#0A0E17] hover:bg-[#0284C7] active:bg-[#0369A1]',
  secondary:
    'bg-[#151D2C] hover:bg-[#1A2436] active:bg-[#101623] text-[#F1F5F9] border border-[#1B2433] hover:border-[#334155]',
  ghost: 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151D2C] active:bg-[#101623]',
  outline:
    'bg-transparent text-[#94A3B8] hover:text-[#38BDF8] border border-[#1B2433] hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/5 active:bg-[#38BDF8]/10',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C]',
};

const classes = computed(
  () => `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]}`
);
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled || isLoading"
    :aria-busy="isLoading || undefined"
    :class="classes"
    @click="$emit('click', $event)"
  >
    <Loader2 v-if="isLoading" :class="`${iconSizes[size]} animate-spin motion-reduce:animate-none`" />
    <component :is="icon" v-else :class="iconSizes[size]" aria-hidden="true" />
  </button>
</template>