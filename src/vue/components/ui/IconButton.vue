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
  'inline-flex items-center justify-center rounded transition-all duration-150 focus-ring select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

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
  primary: 'bg-[#38BDF8] text-[#0B0E14] hover:bg-[#0EA5E9]',
  secondary: 'bg-[#151B28] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B]',
  ghost: 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60',
  outline:
    'bg-transparent text-[#94A3B8] hover:text-[#38BDF8] border border-[#1E293B] hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/5',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
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
    :class="classes"
    @click="$emit('click', $event)"
  >
    <Loader2 v-if="isLoading" :class="`${iconSizes[size]} animate-spin`" />
    <component :is="icon" v-else :class="iconSizes[size]" aria-hidden="true" />
  </button>
</template>