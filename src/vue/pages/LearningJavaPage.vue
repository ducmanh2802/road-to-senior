<script setup lang="ts">
import { Coffee } from 'lucide-vue-next';
import PageHeader from '../components/PageHeader.vue';
import EmptyState from '../components/EmptyState.vue';

/**
 * Representative vertical slice (Phase 002).
 * Demonstrates the page composition pattern:
 * PageHeader → Card section → honest EmptyState (no fake curriculum/progress data).
 * Real Java 25 curriculum content is added in a later phase, sourced from the
 * existing seed content system — never invented at page level.
 */
</script>

<template>
  <div class="max-w-4xl mx-auto pb-12 space-y-6">
    <PageHeader
      title="Java 25"
      description="Core Java track — language features, JVM internals, concurrency. Curriculum content will be sourced from the canonical seed content system in a dedicated phase."
    >
      <template #actions>
        <span
          class="inline-flex items-center gap-1.5 rounded border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#38BDF8]"
        >
          <Coffee class="w-3 h-3" aria-hidden="true" />
          TRACK
        </span>
      </template>
    </PageHeader>

    <section class="ui-panel p-5" aria-labelledby="java-modules-heading">
      <h2 id="java-modules-heading" class="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider mb-3">
        MODULES
      </h2>
      <EmptyState
        title="No curriculum data yet"
        description="Module list will appear here once the Java 25 track content is connected. Nothing fake is rendered in the meantime."
      />
    </section>
  </div>
</template>
