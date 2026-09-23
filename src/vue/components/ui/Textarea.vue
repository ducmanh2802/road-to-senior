<script setup lang="ts">
/**
 * Vue port of src/components/ui/Input.tsx — Textarea variant (design-system parity).
 * v-model:modelValue for the value.
 */
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    helperText?: string;
    error?: string;
    rows?: number;
    placeholder?: string;
    mono?: boolean;
    disabled?: boolean;
  }>(),
  {
    label: undefined,
    helperText: undefined,
    error: undefined,
    rows: 3,
    placeholder: undefined,
    mono: false,
    disabled: false,
  }
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const labelId = computed(() =>
  props.label ? props.label.toLowerCase().replace(/\s+/g, '-') : undefined
);

const areaClasses = computed(
  () => `w-full bg-[#0B0E14] text-[#F8FAFC] border rounded text-xs px-3 py-2 transition-all duration-150 placeholder-[#64748B] focus-ring resize-y disabled:opacity-50 disabled:cursor-not-allowed ${
    props.error ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#1E293B] hover:border-[#334155] focus:border-[#38BDF8]'
  } ${props.mono ? 'font-mono' : 'font-sans'}`
);

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="w-full space-y-1">
    <label
      v-if="label"
      :for="labelId"
      class="block text-xs font-medium text-[#94A3B8] font-mono select-none"
    >
      {{ label }}
    </label>
    <textarea
      :id="labelId"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="areaClasses"
      @input="onInput"
    />
    <p v-if="error" class="text-[11px] text-[#EF4444] font-mono">{{ error }}</p>
    <p v-else-if="helperText" class="text-[11px] text-[#64748B] font-mono">{{ helperText }}</p>
  </div>
</template>