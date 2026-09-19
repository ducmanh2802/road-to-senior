<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Box } from 'lucide-vue-next';
import PageHeader from '../components/PageHeader.vue';
import EmptyState from '../components/EmptyState.vue';

const route = useRoute();

const title = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'Page',
);
const section = computed(() =>
  typeof route.meta.section === 'string' ? route.meta.section : '',
);
</script>

<template>
  <div class="max-w-4xl mx-auto pb-12 space-y-6">
    <PageHeader :title="title" :description="`Section: ${section}`" />
    <EmptyState
      :icon="Box"
      title="Coming next"
      description="This module has not been implemented yet. No fake data is shown until real content is wired in."
    />
  </div>
</template>
