<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <PageHeader
      title="Interview Practice"
      description="Answer out loud first, then compare your response against the rubric and the reference answer. Any question can be saved into the spaced-review deck."
    >
      <template #actions>
        <Button variant="secondary" size="sm" :icon="RefreshCw" @click="handleNextQuestion">
          Next question
        </Button>
      </template>
    </PageHeader>

    <!-- Category filter: quiet segmented control -->
    <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by category">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        :aria-pressed="selectedCategory === cat"
        :class="`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
          selectedCategory === cat
            ? 'bg-[#151D2C] text-[#F1F5F9] border border-[#334155] font-semibold'
            : 'bg-transparent text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151D2C] border border-[#1B2433]'
        }`"
        @click="handleSelectCategory(cat)"
      >
        {{ cat.replace('_', ' ') }}
      </button>
    </div>

    <!-- Question workspace: question → rubric → reveal → reference answer -->
    <Card v-if="currentQ" variant="default" padding="lg" class="space-y-5">
      <div class="flex items-center justify-between gap-3 text-[11px] font-mono text-[#64748B]">
        <span>
          {{ currentQ.category }} · {{ currentQ.difficulty }}
        </span>
        <span>Question {{ activeQuestionIndex + 1 }} of {{ filteredQuestions.length }}</span>
      </div>

      <div class="space-y-2">
        <h2 class="text-lg sm:text-xl font-bold text-[#F1F5F9] leading-snug">
          {{ currentQ.question }}
        </h2>
      </div>

      <!-- What the interviewer is listening for -->
      <div class="border-l-2 border-[#38BDF8]/40 pl-4 space-y-2">
        <div class="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
          What the interviewer is listening for
        </div>
        <ul class="space-y-1.5">
          <li
            v-for="(pt, idx) in currentQ.keyPointsExpected"
            :key="idx"
            class="text-xs text-[#94A3B8] leading-relaxed flex items-start gap-2"
          >
            <span class="text-[#38BDF8] font-mono shrink-0 mt-0.5" aria-hidden="true">–</span>
            <span>{{ pt }}</span>
          </li>
        </ul>
      </div>

      <Button
        v-if="!showAnswer"
        variant="outline"
        size="lg"
        class="w-full"
        @click="showAnswer = true"
      >
        Reveal reference answer
      </Button>

      <div v-else class="space-y-4 pt-4 border-t border-[#1B2433]">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-[11px] font-mono text-[#22C55E] uppercase tracking-wider">
            <CheckCircle2 class="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reference answer</span>
          </div>
          <p class="text-sm text-[#F1F5F9] leading-relaxed whitespace-pre-wrap">
            {{ currentQ.idealSeniorAnswer }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <Button
            variant="secondary"
            size="md"
            :disabled="createdReviewCard"
            @click="handleCreateReviewCardFromMistake"
          >
            {{ createdReviewCard ? 'Saved to review deck' : 'Save as review card' }}
          </Button>

          <Button variant="primary" size="md" @click="handleNextQuestion">
            Next question
          </Button>
        </div>
      </div>
    </Card>

    <!-- Honest empty state when a category has no questions -->
    <EmptyState
      v-else
      title="No questions in this category yet"
      :description="`There are no interview questions for ${selectedCategory} in the current question bank. Pick another category to continue.`"
      action-label="Show all categories"
      @action="handleSelectCategory('ALL')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CheckCircle2, RefreshCw } from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';
import Card from '../components/ui/Card.vue';
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