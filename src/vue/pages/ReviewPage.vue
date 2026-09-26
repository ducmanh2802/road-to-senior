<template>
  <div class="space-y-6 max-w-3xl mx-auto pb-12">
    <PageHeader
      title="Review"
      description="Recall the answer from memory before revealing it. The effort of retrieval is what makes the review stick."
    >
      <template #actions>
        <Badge variant="warning" size="sm" dot>{{ dueLabel }}</Badge>
        <span v-if="activeDeck.length > 0" class="text-xs font-mono text-[#64748B]">
          {{ Math.min(currentIndex + 1, activeDeck.length) }} / {{ activeDeck.length }}
        </span>
      </template>
    </PageHeader>

    <!-- Store error: the deck could not be read -->
    <ErrorState
      v-if="store.status === 'error'"
      :message="store.errorMessage ?? 'Your review deck could not be read from local storage.'"
      :detail="store.errorDetail"
      retry-label="Reload deck"
      @retry="store.loadFromStorage"
    />

    <!-- No cards at all (nothing was ever captured) -->
    <EmptyState
      v-else-if="store.reviewCards.length === 0"
      :icon="Repeat"
      title="No review cards yet"
      description="Review cards are created when you save an interview question or log a mistake. Nothing is scheduled until then."
      action-label="Browse interview questions"
      @action="goToInterview"
    />

    <!-- Deck finished for today -->
    <EmptyState
      v-else-if="!currentCard"
      :icon="CheckCircle2"
      title="Review session complete"
      description="Every due card was graded and rescheduled by the SM-2 scheduler. The next batch becomes due tomorrow."
      action-label="Practice deck again"
      @action="handleResetSession"
    />

    <!-- Current card -->
    <Card v-else variant="default" padding="none">
      <!-- Card metadata -->
      <div class="px-5 py-3 border-b border-[#1B2433] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#64748B]">
        <div class="flex items-center gap-2">
          <Badge variant="neutral" size="sm">{{ currentCard.category }}</Badge>
          <span>
            Interval {{ currentCard.intervalDays }}d · Reps {{ currentCard.repetitionCount }}
          </span>
        </div>
        <span>{{ store.reviewCards.length }} cards in deck</span>
      </div>

      <div class="p-5 sm:p-6 space-y-5">
        <div>
          <div class="text-[11px] font-mono text-[#64748B] uppercase tracking-wider mb-1.5">
            ACTIVE RECALL PROMPT
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-[#F1F5F9] leading-snug">
            {{ currentCard.question }}
          </h2>
        </div>

        <Textarea
          v-model="userDraftAnswer"
          label="Your explanation"
          helper-text="Write your answer in your own words before revealing the model answer."
          :rows="4"
          placeholder="Draft your explanation before revealing the model answer…"
          :disabled="isRevealed"
        />

        <Button
          v-if="!isRevealed"
          variant="primary"
          size="lg"
          class="w-full"
          @click="handleReveal"
        >
          Reveal Model Answer
        </Button>

        <div v-else class="space-y-5 pt-4 border-t border-[#1B2433]">
          <div class="text-sm font-medium text-[#F1F5F9] text-center mb-2">
            IDEAL SENIOR ARCHITECTURAL ANSWER
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[11px] font-mono text-[#22C55E] uppercase tracking-wider">
              <CheckCircle2 class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Model answer</span>
            </div>
            <p class="text-sm text-[#F1F5F9] whitespace-pre-wrap leading-relaxed">
              {{ currentCard.expectedAnswer }}
            </p>

            <div v-if="currentCard.codeExample" class="pt-1">
              <CodeBlock
                :code="currentCard.codeExample"
                language="java"
                title="Reference pattern"
                :show-line-numbers="true"
              />
            </div>
          </div>

          <!-- SM-2 self-assessment: how easy was the recall? -->
          <div class="space-y-2 pt-1">
            <div class="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
              How well did you recall it?
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="option in grades"
                :key="option.grade"
                type="button"
                :data-testid="`grade-${option.grade.toLowerCase()}`"
                :aria-label="`Grade ${option.grade}, next review in ${option.interval}`"
                class="px-3 py-2.5 rounded-md border border-[#1B2433] bg-[#0A0E17] text-center ui-transition cursor-pointer hover:border-[#334155] hover:bg-[#151D2C] focus-ring"
                @click="handleGrade(option.grade)"
              >
                <span class="block text-xs font-semibold" :class="option.textClass">
                  {{ option.label }}
                </span>
                <span class="block text-[10px] font-mono text-[#64748B] mt-0.5">
                  {{ option.interval }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle2, Repeat } from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';
import Card from '../components/ui/Card.vue';
import Badge from '../components/ui/Badge.vue';
import Button from '../components/ui/Button.vue';
import Textarea from '../components/ui/Textarea.vue';
import CodeBlock from '../components/ui/CodeBlock.vue';
import EmptyState from '../components/EmptyState.vue';
import ErrorState from '../components/ErrorState.vue';
import type { ReviewGrade } from '../../types';

const store = useLearningStore();
const router = useRouter();

const currentIndex = ref<number>(0);
const isRevealed = ref<boolean>(false);
const userDraftAnswer = ref<string>('');
const sessionStartTime = ref<number>(Date.now());

/** Due-now subset of the deck; falls back to the full deck when nothing is due. */
const dueCards = computed(() =>
  store.reviewCards.filter((c) => new Date(c.nextReviewAt) <= new Date())
);
const activeDeck = computed(() =>
  dueCards.value.length > 0 ? dueCards.value : store.reviewCards
);

const currentCard = computed(() => activeDeck.value[currentIndex.value]);

const dueLabel = computed(() => {
  const count = dueCards.value.length;
  return `${count} ${count === 1 ? 'card' : 'cards'} due`;
});

interface GradeOption {
  grade: ReviewGrade;
  label: string;
  interval: string;
  textClass: string;
}

const grades: GradeOption[] = [
  { grade: 'AGAIN', label: 'Again', interval: '1 day', textClass: 'text-[#EF4444]' },
  { grade: 'HARD', label: 'Hard', interval: '2 days', textClass: 'text-[#F59E0B]' },
  { grade: 'GOOD', label: 'Good', interval: '4 days', textClass: 'text-[#38BDF8]' },
  { grade: 'EASY', label: 'Easy', interval: '8+ days', textClass: 'text-[#22C55E]' },
];

function handleReveal(): void {
  isRevealed.value = true;
}

function goToInterview(): void {
  void router.push('/interview');
}

function handleGrade(grade: ReviewGrade): void {
  const card = currentCard.value;
  if (!card) return;
  const durationSec = Math.round((Date.now() - sessionStartTime.value) / 1000);
  store.recordReviewAnswer(card.id, grade, durationSec);

  isRevealed.value = false;
  userDraftAnswer.value = '';
  sessionStartTime.value = Date.now();
  currentIndex.value += 1;
}

function handleResetSession(): void {
  currentIndex.value = 0;
  isRevealed.value = false;
  userDraftAnswer.value = '';
  sessionStartTime.value = Date.now();
}
</script>
