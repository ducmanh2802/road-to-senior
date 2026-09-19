<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5 mb-2">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h1 class="text-lg sm:text-xl font-bold text-[#F8FAFC] tracking-tight">{{ title }}</h1>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <p v-if="description" class="text-xs text-[#94A3B8] leading-relaxed max-w-3xl">
      {{ description }}
    </p>
  </div>
</template>
