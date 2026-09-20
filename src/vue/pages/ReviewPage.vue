<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import confetti from 'canvas-confetti';
import { useLearningStore } from '../stores/learning';
import type { ReviewCard, ReviewGrade } from '../../types';
import PageHeader from '../components/PageHeader.vue';
import EmptyState from '../components/EmptyState.vue';
import {
  Clock,
  Eye,
  CheckCircle2,
  Zap,
} from 'lucide-vue-next';

const store = useLearningStore();

const currentIndex = ref(0);
const isRevealed = ref(false);
const userDraftAnswer = ref('');
const sessionStartTime = ref(Date.now());
const filterMode = ref<'DUE' | 'ALL'>('DUE');
const sessionCardIds = ref<string[]>([]);

const dueCards = computed(() => {
  const now = new Date();
  return store.reviewCards.filter((c) => new Date(c.nextReviewAt) <= now);
});

function initSession(): void {
  const now = new Date();
  const due = store.reviewCards.filter((c) => new Date(c.nextReviewAt) <= now);
  const targetCards = filterMode.value === 'DUE' ? due : store.reviewCards;
  sessionCardIds.value = targetCards.map((c) => c.id);
  currentIndex.value = 0;
  isRevealed.value = false;
  userDraftAnswer.value = '';
  sessionStartTime.value = Date.now();
}

onMounted(() => {
  initSession();
});

// Re-initialize session if reviewCards were loaded after mount
watch(
  () => store.reviewCards.length,
  () => {
    if (sessionCardIds.value.length === 0 && store.reviewCards.length > 0) {
      initSession();
    }
  },
  { immediate: true }
);

const activeDeck = computed<ReviewCard[]>(() => {
  return sessionCardIds.value
    .map((id) => store.reviewCards.find((c) => c.id === id))
    .filter((c): c is ReviewCard => c !== undefined);
});

const currentCard = computed(() => activeDeck.value[currentIndex.value] ?? null);
const isDeckFinished = computed(
  () => activeDeck.value.length > 0 && currentIndex.value >= activeDeck.value.length
);

function triggerCelebration(): void {
  try {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const testCanvas = document.createElement('canvas');
      if (testCanvas.getContext && testCanvas.getContext('2d')) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  } catch {
    // Graceful fallback for headless/test environments
  }
}

function handleReveal(): void {
  isRevealed.value = true;
}

function handleGrade(grade: ReviewGrade): void {
  if (!currentCard.value) return;

  const durationSec = Math.max(1, Math.round((Date.now() - sessionStartTime.value) / 1000));
  store.recordReviewAnswer(currentCard.value.id, grade, durationSec);

  isRevealed.value = false;
  userDraftAnswer.value = '';
  sessionStartTime.value = Date.now();

  const nextIndex = currentIndex.value + 1;
  if (nextIndex >= activeDeck.value.length) {
    triggerCelebration();
  }
  currentIndex.value = nextIndex;
}

function handleResetSession(): void {
  if (sessionCardIds.value.length === 0) {
    initSession();
    return;
  }
  currentIndex.value = 0;
  isRevealed.value = false;
  userDraftAnswer.value = '';
  sessionStartTime.value = Date.now();
}

function setFilterMode(mode: 'DUE' | 'ALL'): void {
  filterMode.value = mode;
  initSession();
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12">
    <!-- Page Header -->
    <PageHeader
      title="Spaced Repetition & Active Recall"
      description="Type your architectural explanation before flipping. True memory consolidation occurs only during deliberate retrieval effort."
    >
      <template #actions>
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="inline-flex items-center gap-1.5 rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[#F59E0B]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
            {{ dueCards.length }} Cards Due Today
          </span>

          <!-- Filter Mode Toggles -->
          <div class="inline-flex rounded border border-[#1E293B] bg-[#0B0E14] p-0.5 text-xs font-mono">
            <button
              type="button"
              data-testid="deck-mode-due"
              :class="[
                'px-2.5 py-1 rounded transition-colors cursor-pointer',
                filterMode === 'DUE'
                  ? 'bg-[#38BDF8] text-[#0B0E14] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              ]"
              @click="setFilterMode('DUE')"
            >
              Due Only ({{ dueCards.length }})
            </button>
            <button
              type="button"
              data-testid="deck-mode-all"
              :class="[
                'px-2.5 py-1 rounded transition-colors cursor-pointer',
                filterMode === 'ALL'
                  ? 'bg-[#38BDF8] text-[#0B0E14] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              ]"
              @click="setFilterMode('ALL')"
            >
              All Cards ({{ store.reviewCards.length }})
            </button>
          </div>

          <span class="px-2.5 py-1 rounded border border-[#1E293B] bg-[#111622] font-mono text-xs text-[#94A3B8]">
            Progress: {{ activeDeck.length > 0 ? Math.min(currentIndex + 1, activeDeck.length) : 0 }} / {{ activeDeck.length }}
          </span>
        </div>
      </template>
    </PageHeader>

    <!-- State 1: Honest Empty State when No Review Cards Exist at all -->
    <div v-if="store.reviewCards.length === 0">
      <EmptyState
        title="No Review Cards Available"
        description="No spaced repetition cards found in your learning state. Review cards are generated as you master Java, Spring, Kafka, and System Design concepts."
      />
    </div>

    <!-- State 2: Due Deck Empty / Done when in Due Mode -->
    <div v-else-if="filterMode === 'DUE' && activeDeck.length === 0">
      <EmptyState
        title="Daily Spaced Review Complete!"
        description="All due cards have been processed and rescheduled according to your cognitive retention curve."
        action-label="Practice All Cards"
        @action="setFilterMode('ALL')"
      />
    </div>

    <!-- State 3: Current Active Deck Finished -->
    <div v-else-if="isDeckFinished">
      <EmptyState
        title="Review Session Complete!"
        description="All cards in this deck have been processed. Intervals have been updated using the SuperMemo-2 algorithm."
        action-label="Practice Deck Again"
        @action="handleResetSession"
      />
    </div>

    <!-- State 4: Active Review Arena -->
    <div v-else-if="currentCard" class="ui-panel p-0 overflow-hidden rounded-lg border border-[#1E293B] shadow-xl">
      <!-- Card Top Metadata Bar -->
      <div class="p-4 bg-[#151B28] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center rounded border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-2 py-0.5 text-[10px] font-semibold text-[#38BDF8]">
            {{ currentCard.category }}
          </span>
          <span class="text-[#94A3B8]">
            Interval: <strong class="text-[#F8FAFC]">{{ currentCard.intervalDays }}d</strong> · Reps: {{ currentCard.repetitionCount }} · Ease: {{ currentCard.easeFactor.toFixed(2) }}
          </span>
        </div>

        <div class="text-[#94A3B8] flex items-center gap-1.5">
          <Clock class="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Active Recall Mode</span>
        </div>
      </div>

      <!-- Card Content Area -->
      <div class="p-6 space-y-5">
        <div>
          <div class="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
            <Zap class="w-3.5 h-3.5 text-[#38BDF8]" />
            ACTIVE RECALL PROMPT
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-[#F8FAFC] leading-snug">
            {{ currentCard.question }}
          </h2>
        </div>

        <!-- Mental Retrieval Draft Input Area -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-mono font-medium text-[#94A3B8]">
            YOUR MENTAL RETRIEVAL / ARCHITECTURAL EXPLANATION:
          </label>
          <p class="text-[11px] text-[#64748B]">
            Simulate your senior interview verbal formulation before revealing the reference answer.
          </p>
          <textarea
            v-model="userDraftAnswer"
            data-testid="draft-answer"
            rows="3"
            :disabled="isRevealed"
            placeholder="Draft your explanation in your own words before revealing the senior answer..."
            class="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-[#1E293B] rounded text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        <!-- Reveal Button -->
        <div v-if="!isRevealed">
          <button
            type="button"
            data-testid="reveal-button"
            class="w-full py-2.5 rounded-md font-mono text-xs font-bold bg-[#38BDF8] text-[#0B0E14] hover:bg-[#0EA5E9] transition-colors cursor-pointer flex items-center justify-center gap-2"
            @click="handleReveal"
          >
            <Eye class="w-4 h-4" /> Reveal Model Answer & Code Blueprint
          </button>
        </div>

        <!-- Revealed Answer & Grading Section -->
        <div v-else class="space-y-5 pt-4 border-t border-[#1E293B]">
          <div class="p-4 bg-[#151B28] border border-[#22C55E]/30 rounded-lg space-y-3">
            <div class="flex items-center gap-2 text-xs font-mono text-[#22C55E] font-bold uppercase tracking-wider">
              <CheckCircle2 class="w-4 h-4" />
              <span>IDEAL SENIOR ARCHITECTURAL ANSWER</span>
            </div>
            <p class="text-xs sm:text-sm text-[#F8FAFC] whitespace-pre-wrap leading-relaxed">
              {{ currentCard.expectedAnswer }}
            </p>

            <div v-if="currentCard.codeExample" class="mt-3">
              <div class="text-[10px] font-mono text-[#94A3B8] uppercase font-semibold mb-1">
                CANONICAL PATTERN
              </div>
              <pre class="p-3 bg-[#0B0E14] border border-[#1E293B] rounded text-xs font-mono text-[#38BDF8] overflow-x-auto whitespace-pre"><code>{{ currentCard.codeExample }}</code></pre>
            </div>

            <div v-if="currentCard.explanation" class="mt-2 text-xs text-[#94A3B8] leading-relaxed border-t border-[#1E293B]/60 pt-2">
              <span class="text-[10px] font-mono text-[#64748B] uppercase font-semibold block mb-0.5">ARCHITECTURAL CONTEXT:</span>
              {{ currentCard.explanation }}
            </div>
          </div>

          <!-- 4 SuperMemo Rating Buttons -->
          <div class="space-y-2.5">
            <div class="text-xs font-mono text-center text-[#94A3B8]">
              Rate your retrieval accuracy to compute the next SM-2 interval:
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              <button
                type="button"
                data-testid="grade-again"
                class="p-3 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg text-center transition-all cursor-pointer"
                @click="handleGrade('AGAIN')"
              >
                <div class="text-xs font-bold text-[#EF4444]">AGAIN</div>
                <div class="text-[10px] text-[#94A3B8] mt-0.5">1 day (reset)</div>
              </button>

              <button
                type="button"
                data-testid="grade-hard"
                class="p-3 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-lg text-center transition-all cursor-pointer"
                @click="handleGrade('HARD')"
              >
                <div class="text-xs font-bold text-[#F59E0B]">HARD</div>
                <div class="text-[10px] text-[#94A3B8] mt-0.5">~1.2x interval</div>
              </button>

              <button
                type="button"
                data-testid="grade-good"
                class="p-3 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 rounded-lg text-center transition-all cursor-pointer"
                @click="handleGrade('GOOD')"
              >
                <div class="text-xs font-bold text-[#38BDF8]">GOOD</div>
                <div class="text-[10px] text-[#94A3B8] mt-0.5">SM-2 interval</div>
              </button>

              <button
                type="button"
                data-testid="grade-easy"
                class="p-3 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-lg text-center transition-all cursor-pointer"
                @click="handleGrade('EASY')"
              >
                <div class="text-xs font-bold text-[#22C55E]">EASY</div>
                <div class="text-[10px] text-[#94A3B8] mt-0.5">bonus interval</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
