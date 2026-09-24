<script setup lang="ts">
/**
 * Vue port of src/components/ui/Input.tsx — Select variant (design-system parity).
 * Options are passed via the default slot (<option> elements).
 */
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    helperText?: string;
    disabled?: boolean;
  }>(),
  { label: undefined, helperText: undefined, disabled: false }
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const selectId = computed(() =>
  props.label ? props.label.toLowerCase().replace(/\s+/g, '-') : undefined
);

function onChange(e: Event): void {
  emit('update:modelValue', (e.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="w-full space-y-1">
    <label
      v-if="label"
      :for="selectId"
      class="block text-xs font-medium text-[#94A3B8] font-mono select-none"
    >
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      class="w-full bg-[#0A0E17] text-[#F1F5F9] border border-[#1B2433] hover:border-[#334155] focus:border-[#38BDF8] rounded-md text-xs px-3 py-2 transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed font-sans cursor-pointer"
      @change="onChange"
    >
      <slot />
    </select>
    <p v-if="helperText" class="text-[11px] text-[#64748B] font-mono">{{ helperText }}</p>
  </div>
</template>