<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Skeleton shape */
    variant?: 'text' | 'rect' | 'circle';
    width?: string;
    height?: string;
    /** Number of stacked rows (text variant) */
    rows?: number;
  }>(),
  { variant: 'rect', rows: 1 },
);
</script>

<template>
  <div
    class="animate-pulse motion-reduce:animate-none space-y-2"
    role="status"
    aria-label="Loading content"
    data-testid="loading-skeleton"
  >
    <template v-if="variant === 'text'">
      <div
        v-for="row in rows"
        :key="row"
        class="h-3 rounded bg-[#1E293B]/80"
        :style="{ width: width ?? (row === rows ? '60%' : '100%'), height }"
      />
    </template>
    <template v-else-if="variant === 'circle'">
      <div
        class="rounded-full bg-[#1E293B]/80"
        :style="{ width: width ?? '48px', height: height ?? width ?? '48px' }"
      />
    </template>
    <template v-else>
      <div
        class="rounded-md bg-[#1E293B]/80"
        :style="{ width: width ?? '100%', height: height ?? '96px' }"
      />
    </template>
  </div>
</template>
