<template>
  <div class="p-4 space-y-6 max-w-6xl mx-auto pb-12">
    <PageHeader
      title="Live Mock Interview & Grilling Arena"
      description="Pressure-test your answers against real FAANG / Tier-1 Senior & Staff Java backend interview questions."
    >
      <template #actions>
        <Badge variant="success" size="sm" dot>Staff Interview Grilling Simulator</Badge>
        <Button variant="primary" size="sm" :icon="RefreshCw" @click="handleNextQuestion">
          Random Question
        </Button>
      </template>
    </PageHeader>

    <!-- Category Filter Pills -->
    <Card variant="default" padding="sm">
      <div class="flex items-center gap-2 overflow-x-auto">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          :class="`px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap border cursor-pointer ${
            selectedCategory === cat
              ? 'bg-[#38BDF8] text-[#0A0E17] font-semibold border-[#38BDF8]'
              : 'bg-[#151D2C] text-[#94A3B8] hover:text-[#F1F5F9] border-[#1B2433] hover:border-[#334155]'
          }`"
          @click="handleSelectCategory(cat)"
        >
          {{ cat.replace('_', ' ') }}
        </button>
      </div>
    </Card>

    <!-- Main Grilling Screen -->
    <Card v-if="currentQ" variant="default" padding="lg" class="space-y-5">
      <div class="flex items-center justify-between font-mono text-xs">
        <Badge variant="primary" size="sm">{{ currentQ.category }} · {{ currentQ.difficulty }}</Badge>
        <span class="text-[#64748B]">
          Question {{ activeQuestionIndex + 1 }} of {{ filteredQuestions.length }}
        </span>
      </div>

      <div class="space-y-2">
        <div class="text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider">
          INTERVIEWER PROMPT:
        </div>
        <h2 class="text-lg sm:text-xl font-bold text-[#F1F5F9] leading-snug">
          {{ currentQ.question }}
        </h2>
      </div>

      <!-- Key points expected -->
      <div class="p-4 bg-[#101623] border border-[#1B2433] rounded-lg font-mono text-xs space-y-2">
        <div class="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider">
          RUBRIC POINTS INTERVIEWER IS LISTENING FOR:
        </div>
        <ul class="space-y-1 text-[#94A3B8]">
          <li v-for="(pt, idx) in currentQ.keyPointsExpected" :key="idx" class="flex items-start gap-2">
            <span class="text-[#38BDF8] mt-0.5">•</span>
            <span>{{ pt }}</span>
          </li>
        </ul>
      </div>

      <!-- Reveal & Review Card Actions -->
      <Button
        v-if="!showAnswer"
        variant="outline"
        size="lg"
        class="w-full font-mono text-xs font-bold"
        @click="showAnswer = true"
      >
        Reveal Ideal Staff Architect Answer
      </Button>

      <div v-else class="space-y-4 pt-4 border-t border-[#1E293B]">
        <div class="p-5 bg-[#151B28] border border-[#22C55E]/30 rounded-xl space-y-3">
          <div class="flex items-center gap-2 text-xs font-mono text-[#22C55E] font-bold uppercase tracking-wider">
            <CheckCircle2 class="w-4 h-4" aria-hidden="true" />
            <span>IDEAL STAFF ARCHITECT RESPONSE:</span>
          </div>
          <p class="text-sm text-[#F8FAFC] leading-relaxed whitespace-pre-wrap font-sans">
            {{ currentQ.idealSeniorAnswer }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            :disabled="createdReviewCard"
            @click="handleCreateReviewCardFromMistake"
          >
            {{ createdReviewCard ? 'Card Created in Spaced Deck!' : 'Save as Spaced Review Flashcard' }}
          </Button>

          <Button variant="primary" size="md" @click="handleNextQuestion">
            Next Interview Question
          </Button>
        </div>
      </div>
    </Card>

    <!-- Honest empty state when a category has no questions -->
    <EmptyState
      v-else
      title="No questions in this category yet"
      :description="`There are no interview questions for ${selectedCategory} in the current question bank.`"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CheckCircle2, RefreshCw } from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';
import Card from '../components/ui/Card.vue';
import Badge from '../components/ui/Badge.vue';
import Button from '../components/ui/Button.vue';
import EmptyState from '../components/EmptyState.vue';
import type { InterviewQuestion } from '../../types';

const store = useLearningStore();

const categories = [
  'ALL',
  'JAVA',
  'SPRING',
  'DATABASE',
  'MICROSERVICES',
  'KAFKA',
  'SYSTEM_DESIGN',
  'DSA',
  'BEHAVIORAL',
  'ENGLISH',
] as const;

type CategoryFilter = (typeof categories)[number];

const selectedCategory = ref<CategoryFilter>('ALL');
const activeQuestionIndex = ref<number>(0);
const showAnswer = ref<boolean>(false);
const createdReviewCard = ref<boolean>(false);

const filteredQuestions = computed<InterviewQuestion[]>(() =>
  store.interviewQuestions.filter(
    q => selectedCategory.value === 'ALL' || q.category === selectedCategory.value
  )
);

const currentQ = computed(
  () => filteredQuestions.value[activeQuestionIndex.value] ?? filteredQuestions.value[0]
);

function handleSelectCategory(cat: CategoryFilter): void {
  selectedCategory.value = cat;
  activeQuestionIndex.value = 0;
  showAnswer.value = false;
  createdReviewCard.value = false;
}

function handleNextQuestion(): void {
  showAnswer.value = false;
  createdReviewCard.value = false;
  if (filteredQuestions.value.length > 0) {
    activeQuestionIndex.value =
      (activeQuestionIndex.value + 1) % filteredQuestions.value.length;
  }
}

function handleCreateReviewCardFromMistake(): void {
  const q = currentQ.value;
  if (!q) return;
  store.createReviewCardFromMistake(q.question, q.idealSeniorAnswer, q.category);
  createdReviewCard.value = true;
}
</script>