<template>
  <div class="p-4 space-y-6 max-w-4xl mx-auto pb-12">
    <PageHeader
      title="Spaced Repetition & Active Recall"
      description="Type your architectural explanation before flipping. True memory consolidation occurs only during deliberate retrieval effort."
    >
      <template #actions>
        <Badge variant="warning" size="sm" dot>{{ dueCards.length }} Cards Due Today</Badge>
        <Badge variant="outline" size="md">
          Progress: {{ Math.min(currentIndex + 1, activeDeck.length) }} / {{ activeDeck.length }}
        </Badge>
      </template>
    </PageHeader>

    <!-- Main Flashcard Arena -->
    <Card v-if="currentCard" variant="elevated" padding="none">
      <!-- Card Top Metadata Bar -->
      <div class="p-4 bg-[#151D2C] border-b border-[#1B2433] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div class="flex items-center gap-2">
          <Badge variant="primary" size="sm">{{ currentCard.category }}</Badge>
          <span class="text-[#94A3B8]">
            Interval: <strong class="text-[#F1F5F9]">{{ currentCard.intervalDays }}d</strong> · Reps: {{ currentCard.repetitionCount }}
          </span>
        </div>
        <div class="text-[#64748B] flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
          <span>Session Timer Active</span>
        </div>
      </div>

      <!-- Card Question Area -->
      <div class="p-6 space-y-5">
        <div>
          <div class="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider font-bold mb-1.5">
            ACTIVE RECALL PROMPT
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-[#F1F5F9] leading-snug">
            {{ currentCard.question }}
          </h2>
        </div>

        <!-- Active Recall Input Box -->
        <div class="space-y-2">
          <Textarea
            v-model="userDraftAnswer"
            label="YOUR MENTAL RETRIEVAL / EXPLANATION:"
            helper-text="Simulate your senior interview verbal formulation before checking the answer."
            :rows="3"
            placeholder="Draft your explanation in your own words before revealing the senior answer..."
            :disabled="isRevealed"
          />
        </div>

        <!-- Reveal Button -->
        <Button
          v-if="!isRevealed"
          variant="primary"
          size="lg"
          class="w-full font-mono text-xs font-bold"
          @click="handleReveal"
        >
          Reveal Model Answer & Code Blueprint
        </Button>

        <!-- Revealed Answer Section -->
        <div v-else class="space-y-5 pt-4 border-t border-[#1B2433]">
          <div class="p-4 bg-[#101623] border border-[#22C55E]/30 rounded-lg space-y-3">
            <div class="flex items-center gap-2 text-xs font-mono text-[#22C55E] font-bold uppercase tracking-wider">
              <CheckCircle2 class="w-4 h-4" aria-hidden="true" />
              <span>IDEAL SENIOR ARCHITECTURAL ANSWER</span>
            </div>
            <p class="text-sm text-[#F1F5F9] whitespace-pre-wrap leading-relaxed">
              {{ currentCard.expectedAnswer }}
            </p>

            <div v-if="currentCard.codeExample" class="mt-3">
              <CodeBlock
                :code="currentCard.codeExample"
                language="java"
                title="Canonical Pattern"
                :show-line-numbers="true"
              />
            </div>
          </div>

          <!-- 4 SuperMemo Rating Buttons -->
          <div class="space-y-2.5">
            <div class="text-xs font-mono text-center text-[#94A3B8]">
              Rate your retrieval accuracy to compute the next SM-2 interval:
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              <button
                v-for="g in grades"
                :key="g.grade"
                type="button"
                :class="g.classes"
                :data-testid="`grade-${g.grade.toLowerCase()}`"
                @click="handleGrade(g.grade)"
              >
                <div :class="`text-xs font-bold ${g.text}`">{{ g.grade }}</div>
                <div class="text-[10px] text-[#94A3B8] mt-0.5">{{ g.interval }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Deck Completed Screen -->
    <EmptyState
      v-else
      :icon="CheckCircle2"
      title="Daily Spaced Review Complete!"
      description="All due cards have been processed and rescheduled according to your cognitive retention curve."
      action-label="Practice Deck Again"
      @action="handleResetSession"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CheckCircle2, Clock } from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';
import Card from '../components/ui/Card.vue';
import Badge from '../components/ui/Badge.vue';
import Button from '../components/ui/Button.vue';
import Textarea from '../components/ui/Textarea.vue';
import CodeBlock from '../components/ui/CodeBlock.vue';
import EmptyState from '../components/EmptyState.vue';
import type { ReviewGrade } from '../../types';

const store = useLearningStore();

const currentIndex = ref<number>(0);
const isRevealed = ref<boolean>(false);
const userDraftAnswer = ref<string>('');
const sessionStartTime = ref<number>(Date.now());

// Filter due cards or fallback to active deck
const dueCards = computed(() =>
  store.reviewCards.filter(c => new Date(c.nextReviewAt) <= new Date())
);
const activeDeck = computed(() =>
  dueCards.value.length > 0 ? dueCards.value : store.reviewCards
);

const currentCard = computed(() => activeDeck.value[currentIndex.value]);

interface GradeOption {
  grade: ReviewGrade;
  interval: string;
  classes: string;
  text: string;
}

const grades: GradeOption[] = [
  {
    grade: 'AGAIN',
    interval: '1 day',
    classes:
      'p-3 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/40 rounded-lg text-center transition-all group hover:scale-[1.02] cursor-pointer',
    text: 'text-[#EF4444]',
  },
  {
    grade: 'HARD',
    interval: '2 days',
    classes:
      'p-3 bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 border border-[#F59E0B]/40 rounded-lg text-center transition-all group hover:scale-[1.02] cursor-pointer',
    text: 'text-[#F59E0B]',
  },
  {
    grade: 'GOOD',
    interval: '4 days',
    classes:
      'p-3 bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 border border-[#38BDF8]/40 rounded-lg text-center transition-all group hover:scale-[1.02] cursor-pointer',
    text: 'text-[#38BDF8]',
  },
  {
    grade: 'EASY',
    interval: '8+ days',
    classes:
      'p-3 bg-[#22C55E]/15 hover:bg-[#22C55E]/25 border border-[#22C55E]/40 rounded-lg text-center transition-all group hover:scale-[1.02] cursor-pointer',
    text: 'text-[#22C55E]',
  },
];

function handleReveal(): void {
  isRevealed.value = true;
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
