<script setup lang="ts">
/**
 * Vue port of src/components/ui/Input.tsx — Input variant (design-system parity).
 * v-model:modelValue for the value.
 */
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    helperText?: string;
    error?: string;
    type?: string;
    placeholder?: string;
    mono?: boolean;
    disabled?: boolean;
    required?: boolean;
  }>(),
  {
    label: undefined,
    helperText: undefined,
    error: undefined,
    type: 'text',
    placeholder: undefined,
    mono: false,
    disabled: false,
    required: false,
  }
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const inputId = computed(() =>
  props.label ? props.label.toLowerCase().replace(/\s+/g, '-') : undefined
);

const inputClasses = computed(
  () => `w-full bg-[#0A0E17] text-[#F1F5F9] border rounded-md text-xs px-3 py-2 transition-all duration-150 placeholder-[#64748B] focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${
    props.error ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#1B2433] hover:border-[#334155] focus:border-[#38BDF8]'
  } ${props.mono ? 'font-mono' : 'font-sans'}`
);

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="w-full space-y-1">
    <label
      v-if="label"
      :for="inputId"
      class="block text-xs font-medium text-[#94A3B8] font-mono select-none"
    >
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      @input="onInput"
    />
    <p v-if="error" class="text-[11px] text-[#EF4444] font-mono">{{ error }}</p>
    <p v-else-if="helperText" class="text-[11px] text-[#64748B] font-mono">{{ helperText }}</p>
  </div>
</template>