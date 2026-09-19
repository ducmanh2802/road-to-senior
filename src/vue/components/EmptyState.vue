<script setup lang="ts">
import type { FunctionalComponent } from 'vue';
import { computed } from 'vue';
import type { LucideIcon } from 'lucide-vue-next';

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
    class="p-8 text-center flex flex-col items-center justify-center border border-dashed border-[#1E293B] rounded-lg bg-[#0B0E14]/40"
    data-testid="empty-state"
  >
    <div
      v-if="icon"
      class="w-12 h-12 rounded-full bg-[#151B28] border border-[#1E293B] flex items-center justify-center text-[#64748B] mb-3"
    >
      <component :is="icon" class="w-6 h-6" aria-hidden="true" />
    </div>
    <h4 class="text-sm font-semibold text-[#F8FAFC] tracking-tight">{{ title }}</h4>
    <p v-if="description" class="text-xs text-[#94A3B8] max-w-sm mt-1 mb-4 leading-relaxed">
      {{ description }}
    </p>
    <button
      v-if="hasAction"
      class="px-3 py-1.5 rounded-md bg-[#38BDF8] text-[#0B0E14] text-xs font-semibold hover:bg-[#0EA5E9] focus-ring"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
    <slot />
  </div>
</template>
