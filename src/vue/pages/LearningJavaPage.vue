<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Coffee,
  Code2,
  AlertTriangle,
  BookOpen,
  Bug,
  Mic,
  Award,
  CheckCircle2,
  Layers,
} from 'lucide-vue-next';
import PageHeader from '../components/PageHeader.vue';
import CodeBlock from '../components/CodeBlock.vue';
import {
  CANONICAL_JAVA_MODULES,
  JAVA_VERSION_METADATA,
  CANONICAL_JAVA_VERSION,
} from '../../data/canonicalStandards';

type LearningStage = 'theory' | 'code' | 'break' | 'debug' | 'explain' | 'interview';

const selectedTopicId = ref(CANONICAL_JAVA_MODULES[0].id);
const activeStage = ref<LearningStage>('code');

const currentTopic = computed(() => {
  return CANONICAL_JAVA_MODULES.find((m) => m.id === selectedTopicId.value) || CANONICAL_JAVA_MODULES[0];
});

const stages: { id: LearningStage; label: string; icon: typeof BookOpen }[] = [
  { id: 'theory', label: '1. THEORY', icon: BookOpen },
  { id: 'code', label: '2. CODE PATTERN', icon: Code2 },
  { id: 'break', label: '3. BREAK (CHAOS)', icon: Bug },
  { id: 'debug', label: '4. DEBUG & FIX', icon: AlertTriangle },
  { id: 'explain', label: '5. EXPLAIN', icon: Mic },
  { id: 'interview', label: '6. INTERVIEW', icon: Award },
];
</script>

<template>
  <div class="max-w-5xl mx-auto pb-12 space-y-6">
    <!-- Header -->
    <PageHeader
      title="Java 25"
      description="Core Java track — language features, JVM internals, structured concurrency, and memory model on Java 25 LTS."
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-2.5 py-1 text-[11px] font-mono font-semibold text-[#38BDF8]"
            data-testid="java-version-badge"
          >
            <Coffee class="w-3.5 h-3.5" aria-hidden="true" />
            {{ CANONICAL_JAVA_VERSION }} LTS
          </span>
        </div>
      </template>
    </PageHeader>

    <!-- Runtime & Standards Foundation Card -->
    <section
      class="rounded-xl border border-[#1E293B] bg-[#111622] p-4.5 space-y-3"
      aria-labelledby="runtime-standards-heading"
      data-testid="runtime-standards"
    >
      <div class="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
        <div class="flex items-center gap-2 text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
          <Layers class="w-4 h-4" aria-hidden="true" />
          <h2 id="runtime-standards-heading">CANONICAL RUNTIME: {{ JAVA_VERSION_METADATA.runtimeTarget }}</h2>
        </div>
        <span class="text-[11px] font-mono text-[#94A3B8]">{{ JAVA_VERSION_METADATA.supportPolicy }}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#94A3B8] font-sans">
        <div
          v-for="(item, index) in JAVA_VERSION_METADATA.architecturalBaseline"
          :key="index"
          class="flex items-start gap-2"
        >
          <CheckCircle2 class="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" aria-hidden="true" />
          <span>{{ item }}</span>
        </div>
      </div>
    </section>

    <!-- Topic Selector Bar -->
    <section class="rounded-xl border border-[#1E293B] bg-[#111622] p-2" aria-label="Core Java modules">
      <div class="flex items-center gap-2 overflow-x-auto" role="tablist" aria-label="Java Modules">
        <button
          v-for="topic in CANONICAL_JAVA_MODULES"
          :key="topic.id"
          type="button"
          role="tab"
          :aria-selected="selectedTopicId === topic.id"
          class="px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-mono border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          :class="[
            selectedTopicId === topic.id
              ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 font-bold'
              : 'bg-[#151B28] text-[#94A3B8] border-[#1E293B] hover:border-[#38BDF8]/30 hover:text-[#F8FAFC]',
          ]"
          :data-testid="`topic-tab-${topic.id}`"
          @click="selectedTopicId = topic.id"
        >
          {{ topic.title }}
        </button>
      </div>
    </section>

    <!-- 6-Stage Senior Engineering Loop Navigation -->
    <section class="rounded-xl border border-[#1E293B] bg-[#0B0E14] p-1.5 overflow-x-auto" aria-label="Learning Loop Stages">
      <div class="flex items-center gap-1.5 min-w-max" role="tablist" aria-label="Learning Stages">
        <button
          v-for="stage in stages"
          :key="stage.id"
          type="button"
          role="tab"
          :aria-selected="activeStage === stage.id"
          class="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-mono text-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
          :class="[
            activeStage === stage.id
              ? 'bg-[#38BDF8] text-[#020617] font-bold shadow-sm'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151B28]',
          ]"
          :data-testid="`stage-tab-${stage.id}`"
          @click="activeStage = stage.id"
        >
          <component :is="stage.icon" class="w-3.5 h-3.5" aria-hidden="true" />
          <span>{{ stage.label }}</span>
        </button>
      </div>
    </section>

    <!-- Main Content Area -->
    <main
      class="rounded-xl border border-[#1E293B] bg-[#111622] p-6 space-y-4 min-h-[380px]"
      role="tabpanel"
      data-testid="stage-content-panel"
    >
      <!-- Stage 1: Theory -->
      <div v-if="activeStage === 'theory'" class="space-y-4" data-testid="stage-theory">
        <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider">
          <BookOpen class="w-4 h-4" aria-hidden="true" />
          <span>ARCHITECTURAL FOUNDATION & THEORY ({{ currentTopic.versionTarget }})</span>
        </div>
        <h3 class="text-xl font-bold text-[#F8FAFC]">{{ currentTopic.title }}</h3>
        <p class="text-sm text-[#94A3B8] leading-relaxed font-sans">{{ currentTopic.description }}</p>

        <div class="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
          <div class="text-xs font-mono text-[#22C55E] uppercase font-bold tracking-wider">
            KEY CONCEPTS TO INTERNALIZE:
          </div>
          <ul class="list-disc list-inside space-y-1.5 text-xs text-[#CBD5E1] font-sans leading-relaxed">
            <li v-for="(concept, i) in currentTopic.keyConcepts" :key="i">{{ concept }}</li>
          </ul>
        </div>
      </div>

      <!-- Stage 2: Code Pattern (consumes CodeBlock) -->
      <div v-if="activeStage === 'code'" class="space-y-3" data-testid="stage-code">
        <div class="flex items-center justify-between text-xs font-mono text-[#38BDF8] uppercase font-bold">
          <span class="flex items-center gap-2">
            <Code2 class="w-4 h-4" aria-hidden="true" />
            PRODUCTION {{ currentTopic.versionTarget }} CODE BLUEPRINT
          </span>
          <span class="text-[11px] font-mono text-[#94A3B8]">{{ currentTopic.filename }}</span>
        </div>

        <CodeBlock
          :code="currentTopic.codeSnippet"
          language="java"
          :filename="currentTopic.filename"
          :title="`${currentTopic.title} (${currentTopic.versionTarget})`"
          :show-line-numbers="true"
        />
      </div>

      <!-- Stage 3: Break the Code -->
      <div v-if="activeStage === 'break'" class="space-y-4" data-testid="stage-break">
        <div class="flex items-center gap-2 text-xs font-mono text-[#F43F5E] uppercase font-bold tracking-wider">
          <Bug class="w-4 h-4" aria-hidden="true" />
          <span>CHAOS & FAILURE INJECTION (BREAK THE CODE)</span>
        </div>
        <h4 class="text-sm font-bold text-[#F8FAFC]">How This Breaks In High-Concurrency Production:</h4>
        <div class="p-4 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 space-y-1">
          <div class="text-xs font-mono font-bold text-[#EF4444] uppercase tracking-wider">
            Production Concurrency Hazard:
          </div>
          <p class="text-xs text-[#F8FAFC] leading-relaxed font-sans">{{ currentTopic.breakScenario }}</p>
        </div>
      </div>

      <!-- Stage 4: Debug & Fix -->
      <div v-if="activeStage === 'debug'" class="space-y-4" data-testid="stage-debug">
        <div class="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase font-bold tracking-wider">
          <AlertTriangle class="w-4 h-4" aria-hidden="true" />
          <span>ROOT CAUSE ANALYSIS & SENIOR PRODUCTION FIX</span>
        </div>
        <div class="p-4 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 space-y-1">
          <div class="text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-wider">
            Senior Mitigation Strategy:
          </div>
          <p class="text-xs text-[#F8FAFC] leading-relaxed font-sans">{{ currentTopic.debugFix }}</p>
        </div>
      </div>

      <!-- Stage 5: Explain Out Loud -->
      <div v-if="activeStage === 'explain'" class="space-y-4" data-testid="stage-explain">
        <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider">
          <Mic class="w-4 h-4" aria-hidden="true" />
          <span>ACTIVE EXPLANATION DRILL (EXPLAIN STAGE)</span>
        </div>
        <p class="text-xs text-[#94A3B8]">
          Read the prompt below, then practice explaining this concept out loud in 90 seconds without looking at notes:
        </p>
        <div class="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
          <div class="text-sm font-bold text-[#F8FAFC]">
            Prompt: "{{ currentTopic.explainPrompt }}"
          </div>
        </div>
      </div>

      <!-- Stage 6: Senior Interview -->
      <div v-if="activeStage === 'interview'" class="space-y-4" data-testid="stage-interview">
        <div class="flex items-center gap-2 text-xs font-mono text-[#22C55E] uppercase font-bold tracking-wider">
          <Award class="w-4 h-4" aria-hidden="true" />
          <span>STAFF / SENIOR INTERVIEW ANSWER</span>
        </div>
        <div class="p-4 bg-[#151B28] border border-[#22C55E]/30 rounded-xl space-y-2">
          <p class="text-xs text-[#F8FAFC] whitespace-pre-wrap leading-relaxed font-sans">
            {{ currentTopic.interviewAnswer }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
