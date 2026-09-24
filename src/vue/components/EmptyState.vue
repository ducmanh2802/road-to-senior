<script setup lang="ts">
import type { FunctionalComponent } from 'vue';
import { computed } from 'vue';
import type { LucideIcon } from 'lucide-vue-next';
import Button from './ui/Button.vue';

const props = defineProps<{
  icon?: LucideIcon | FunctionalComponent;
  title: string;
  description?: string;
  actionLabel?: string;
}>();

const emit = defineEmits<{ action: [] }>();

const hasAction = computed(() => Boolean(props.actionLabel));
</script>

<template>
  <div
    class="p-8 text-center flex flex-col items-center justify-center border border-dashed border-[#1B2433] rounded-lg bg-[#0A0E17]/40"
    data-testid="empty-state"
  >
    <div
      v-if="icon"
      class="w-10 h-10 rounded-md bg-[#151D2C] border border-[#1B2433] flex items-center justify-center text-[#64748B] mb-3"
    >
      <component :is="icon" class="w-5 h-5" aria-hidden="true" />
    </div>
    <h4 class="text-sm font-semibold text-[#F1F5F9] tracking-tight">{{ title }}</h4>
    <p v-if="description" class="text-xs text-[#94A3B8] max-w-sm mt-1 mb-4 leading-relaxed">
      {{ description }}
    </p>
    <Button v-if="hasAction" variant="secondary" size="md" @click="emit('action')">
      {{ actionLabel }}
    </Button>
    <slot />
  </div>
</template>
