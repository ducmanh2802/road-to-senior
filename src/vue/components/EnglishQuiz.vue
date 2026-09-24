<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  BookOpen,
} from 'lucide-vue-next';
import { generateEnglishQuiz, type QuizQuestion } from '../utils/englishQuiz';
import { useLearningStore } from '../stores/learning';

const emit = defineEmits<{
  (e: 'exit'): void;
}>();

const learningStore = useLearningStore();

const questions = ref<QuizQuestion[]>(generateEnglishQuiz(5));
const currentIndex = ref(0);
const selectedAnswers = ref<Record<number, string>>({});
const isSubmitted = ref<Record<number, boolean>>({});
const isQuizFinished = ref(false);

const currentQuestion = computed(() => questions.value[currentIndex.value]);

const score = computed(() => {
  let correct = 0;
  questions.value.forEach((q, idx) => {
    if (selectedAnswers.value[idx] === q.correctAnswer) {
      correct++;
    }
  });
  return correct;
});

function selectOption(option: string) {
  if (isSubmitted.value[currentIndex.value]) return;
  selectedAnswers.value[currentIndex.value] = option;
}

function submitCurrentAnswer() {
  if (!selectedAnswers.value[currentIndex.value]) return;
  isSubmitted.value[currentIndex.value] = true;

  // If answer was correct, optionally mark this technical term as completed in Pinia store
  const q = currentQuestion.value;
  if (selectedAnswers.value[currentIndex.value] === q.correctAnswer) {
    if (!learningStore.isEnglishItemCompleted(q.targetItemId)) {
      learningStore.toggleEnglishItemCompletion(q.targetItemId);
    }
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
  } else {
    isQuizFinished.value = true;
  }
}

function restartQuiz() {
  questions.value = generateEnglishQuiz(5);
  currentIndex.value = 0;
  selectedAnswers.value = {};
  isSubmitted.value = {};
  isQuizFinished.value = false;
}

defineExpose({
  questions,
  currentIndex,
  currentQuestion,
  score,
  isQuizFinished,
});
</script>

<template>
  <div class="space-y-6" data-testid="english-quiz-view">
    <!-- Quiz Header Controls -->
    <div class="flex items-center justify-between gap-4 p-4 rounded-lg bg-[#111622] border border-[#1E293B]">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8]">
          <HelpCircle class="w-4 h-4" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-[#F8FAFC]">Technical English Quiz Mode</h2>
          <p class="text-xs text-[#94A3B8]">5 multiple-choice questions dynamically generated from your vocabulary curriculum</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-[#0B0E14] border border-[#1E293B] text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#151B28] transition-colors"
          data-testid="restart-quiz-btn"
          @click="restartQuiz"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>New Quiz</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-[#0B0E14] border border-[#1E293B] text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#151B28] transition-colors"
          data-testid="exit-quiz-btn"
          @click="emit('exit')"
        >
          <BookOpen class="w-3.5 h-3.5" />
          <span>Back to Vocabulary</span>
        </button>
      </div>
    </div>

    <!-- Active Question View -->
    <div v-if="!isQuizFinished" class="space-y-5" data-testid="active-question-card">
      <!-- Progress Bar & Question Counter -->
      <div class="flex items-center justify-between gap-2 text-xs font-mono text-[#64748B]">
        <span>QUESTION {{ currentIndex + 1 }} OF {{ questions.length }}</span>
        <span>DIFFICULTY: <span class="text-[#38BDF8]">{{ currentQuestion.difficulty }}</span></span>
      </div>
      <div class="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
        <div
          class="h-full bg-[#38BDF8] ui-transition-slow"
          :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"
        />
      </div>

      <!-- Question Card -->
      <div class="rounded-lg border border-[#1E293B] bg-[#111622] p-5 sm:p-6 space-y-5">
        <div class="space-y-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-[#94A3B8]">
              {{ currentQuestion.section }}
            </span>
            <span class="text-xs font-mono text-[#64748B]">Topic: {{ currentQuestion.topic }}</span>
          </div>
          <h3 class="text-base font-semibold text-[#F8FAFC] leading-snug" data-testid="quiz-prompt">
            {{ currentQuestion.prompt }}
          </h3>
        </div>

        <!-- Multiple Choice Options -->
        <div class="space-y-2.5" role="radiogroup" aria-label="Question choices">
          <button
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            type="button"
            role="radio"
            :aria-checked="selectedAnswers[currentIndex] === option"
            :disabled="isSubmitted[currentIndex]"
            class="w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm font-sans ui-transition flex items-start gap-3 select-none"
            :class="[
              // Option states after submission
              isSubmitted[currentIndex]
                ? option === currentQuestion.correctAnswer
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/50 text-[#4ADE80]'
                  : selectedAnswers[currentIndex] === option
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#F87171]'
                  : 'bg-[#0B0E14] border-[#1E293B]/60 text-[#64748B] opacity-60'
                // Option states before submission
                : selectedAnswers[currentIndex] === option
                ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-[#38BDF8]'
                : 'bg-[#0B0E14] border-[#1E293B] text-[#E2E8F0] hover:bg-[#151B28] hover:border-[#38BDF8]/40'
            ]"
            :data-testid="`quiz-option-${idx}`"
            @click="selectOption(option)"
          >
            <span
              class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5"
              :class="[
                isSubmitted[currentIndex]
                  ? option === currentQuestion.correctAnswer
                    ? 'border-[#22C55E] text-[#22C55E] bg-[#22C55E]/20'
                    : selectedAnswers[currentIndex] === option
                    ? 'border-[#EF4444] text-[#EF4444] bg-[#EF4444]/20'
                    : 'border-[#1E293B] text-[#64748B]'
                  : selectedAnswers[currentIndex] === option
                  ? 'border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/20'
                  : 'border-[#1E293B] text-[#94A3B8]'
              ]"
            >
              {{ String.fromCharCode(65 + idx) }}
            </span>
            <span class="flex-1 leading-relaxed">{{ option }}</span>
          </button>
        </div>

        <!-- Explanation box (after submission) -->
        <div
          v-if="isSubmitted[currentIndex]"
          class="rounded-lg p-4 space-y-3"
          :class="[
            selectedAnswers[currentIndex] === currentQuestion.correctAnswer
              ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#E2E8F0]'
              : 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#E2E8F0]'
          ]"
          data-testid="quiz-explanation-box"
        >
          <div class="flex items-center gap-2 text-xs font-mono font-bold">
            <template v-if="selectedAnswers[currentIndex] === currentQuestion.correctAnswer">
              <CheckCircle2 class="w-4 h-4 text-[#22C55E]" />
              <span class="text-[#4ADE80]">CORRECT!</span>
            </template>
            <template v-else>
              <XCircle class="w-4 h-4 text-[#EF4444]" />
              <span class="text-[#F87171]">INCORRECT. CORRECT ANSWER: {{ currentQuestion.correctAnswer }}</span>
            </template>
          </div>

          <p class="text-xs text-[#CBD5E1] leading-relaxed">
            <span class="text-[#38BDF8] font-mono font-semibold">Meeting Usage:</span>
            "{{ currentQuestion.explanation }}"
          </p>

          <div class="text-xs text-[#94A3B8] border-t border-[#1E293B]/60 pt-2 space-y-1">
            <span class="font-mono text-[10px] text-[#64748B] uppercase">Senior Architectural Reality:</span>
            <p class="text-[#CBD5E1]">{{ currentQuestion.seniorInsight }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-2 border-t border-[#1E293B]/60">
          <button
            v-if="!isSubmitted[currentIndex]"
            type="button"
            :disabled="!selectedAnswers[currentIndex]"
            class="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-bold ui-transition"
            :class="[
              selectedAnswers[currentIndex]
                ? 'bg-[#38BDF8] text-[#0B0E14] hover:bg-[#38BDF8]/90 cursor-pointer shadow-sm'
                : 'bg-[#1E293B] text-[#64748B] cursor-not-allowed opacity-60'
            ]"
            data-testid="submit-answer-btn"
            @click="submitCurrentAnswer"
          >
            <span>Submit Answer</span>
          </button>

          <button
            v-else
            type="button"
            class="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-bold bg-[#38BDF8] text-[#0B0E14] hover:bg-[#38BDF8]/90 ui-transition cursor-pointer shadow-sm"
            data-testid="next-question-btn"
            @click="nextQuestion"
          >
            <span>{{ currentIndex < questions.length - 1 ? 'Next Question' : 'View Results' }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Quiz Results Screen -->
    <div
      v-else
      class="rounded-lg border border-[#1E293B] bg-[#111622] p-6 sm:p-8 text-center space-y-6 max-w-xl mx-auto"
      data-testid="quiz-results-card"
    >
      <div class="w-14 h-14 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] mx-auto">
        <Trophy class="w-7 h-7" />
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-bold text-[#F8FAFC]">Quiz Completed!</h3>
        <p class="text-xs text-[#94A3B8]">
          Here is your Technical English vocabulary mastery evaluation:
        </p>
      </div>

      <div class="p-4 rounded-lg bg-[#0B0E14] border border-[#1E293B] inline-block min-w-[200px]">
        <div class="text-3xl font-extrabold font-mono" :class="score >= 4 ? 'text-[#4ADE80]' : score >= 3 ? 'text-[#38BDF8]' : 'text-[#F59E0B]'" data-testid="quiz-final-score">
          {{ score }} / {{ questions.length }}
        </div>
        <p class="text-xs font-mono text-[#64748B] mt-1">
          {{ Math.round((score / questions.length) * 100) }}% SCORE
        </p>
      </div>

      <p class="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
        <span v-if="score === 5" class="text-[#4ADE80] font-semibold">Outstanding performance!</span>
        <span v-else-if="score >= 3" class="text-[#38BDF8] font-semibold">Solid foundation!</span>
        <span v-else class="text-[#F59E0B] font-semibold">Keep practicing!</span>
        Correctly answered terms have been automatically synchronized with your learning progress.
      </p>

      <!-- Question-by-Question Breakdown Summary Table -->
      <div class="text-left border border-[#1E293B] rounded-lg overflow-hidden bg-[#0B0E14]" data-testid="quiz-breakdown-list">
        <div class="px-4 py-2.5 bg-[#151B28] border-b border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <span class="font-bold text-[#E2E8F0]">PER-QUESTION SUMMARY</span>
          <span>{{ score }}/{{ questions.length }} CORRECT</span>
        </div>
        <div class="divide-y divide-[#1E293B]">
          <div
            v-for="(q, idx) in questions"
            :key="q.id"
            class="p-3 text-xs space-y-1"
            :data-testid="`quiz-breakdown-item-${idx}`"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono text-[#64748B]">Q{{ idx + 1 }}: <span class="text-[#E2E8F0] font-semibold">{{ q.term }}</span></span>
              <span
                class="flex items-center gap-1 font-mono text-[11px] font-bold"
                :class="selectedAnswers[idx] === q.correctAnswer ? 'text-[#4ADE80]' : 'text-[#F87171]'"
              >
                <CheckCircle2 v-if="selectedAnswers[idx] === q.correctAnswer" class="w-3.5 h-3.5 text-[#22C55E]" />
                <XCircle v-else class="w-3.5 h-3.5 text-[#EF4444]" />
                {{ selectedAnswers[idx] === q.correctAnswer ? 'CORRECT' : 'INCORRECT' }}
              </span>
            </div>
            <div v-if="selectedAnswers[idx] !== q.correctAnswer" class="text-[11px] text-[#94A3B8]">
              Your choice: <span class="text-[#FCA5A5]">{{ selectedAnswers[idx] || 'None' }}</span>
              <br />
              Correct: <span class="text-[#86EFAC]">{{ q.correctAnswer }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold bg-[#38BDF8] text-[#0B0E14] hover:bg-[#38BDF8]/90 transition-colors shadow-sm"
          data-testid="retry-quiz-btn"
          @click="restartQuiz"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Retake Quiz</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded text-xs font-mono bg-[#0B0E14] border border-[#1E293B] text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#151B28] transition-colors"
          data-testid="finish-quiz-btn"
          @click="emit('exit')"
        >
          <BookOpen class="w-3.5 h-3.5" />
          <span>Return to Curriculum</span>
        </button>
      </div>
    </div>
  </div>
</template>
