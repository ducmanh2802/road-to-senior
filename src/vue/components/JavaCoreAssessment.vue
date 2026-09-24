<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  AlertTriangle,
  Award,
} from 'lucide-vue-next';
import type { AssessmentQuestion } from '../../data/javaCoreCurriculum';
import { useLearningStore } from '../stores/learning';

const props = defineProps<{
  moduleId: string;
  questions: AssessmentQuestion[];
  failureLabCompleted: boolean;
}>();

const emit = defineEmits<{
  (e: 'completed', score: number, passed: boolean): void;
  (e: 'retake'): void;
}>();

const learningStore = useLearningStore();

const currentIndex = ref(0);
const selectedAnswers = ref<Record<number, number>>({});
const isSubmitted = ref<Record<number, boolean>>({});
const isFinished = ref(false);

const currentQuestion = computed(() => props.questions[currentIndex.value]);

const correctCount = computed(() => {
  let count = 0;
  props.questions.forEach((q, idx) => {
    if (selectedAnswers.value[idx] === q.correctIndex) {
      count++;
    }
  });
  return count;
});

const scorePercent = computed(() => {
  if (props.questions.length === 0) return 0;
  return Math.round((correctCount.value / props.questions.length) * 100);
});

const isPassed = computed(() => {
  return scorePercent.value >= 80 && props.failureLabCompleted;
});

function selectOption(index: number) {
  if (isSubmitted.value[currentIndex.value]) return;
  selectedAnswers.value[currentIndex.value] = index;
}

function submitAnswer() {
  if (selectedAnswers.value[currentIndex.value] === undefined) return;
  isSubmitted.value[currentIndex.value] = true;
}

function nextQuestion() {
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++;
  } else {
    isFinished.value = true;
    const passed = learningStore.recordJavaAssessmentScore(
      props.moduleId,
      scorePercent.value,
      props.failureLabCompleted
    );
    emit('completed', scorePercent.value, passed);
  }
}

function resetAssessment() {
  currentIndex.value = 0;
  selectedAnswers.value = {};
  isSubmitted.value = {};
  isFinished.value = false;
  emit('retake');
}

defineExpose({
  currentIndex,
  selectedAnswers,
  isSubmitted,
  isFinished,
  scorePercent,
  isPassed,
  submitAnswer,
  nextQuestion,
  resetAssessment,
});
</script>

<template>
  <div class="space-y-6" data-testid="java-assessment-container">
    <!-- Active Assessment View -->
    <div v-if="!isFinished" class="space-y-4">
      <!-- Progress Bar & Counter -->
      <div class="flex items-center justify-between text-xs font-mono">
        <span class="text-[#38BDF8] font-bold">
          QUESTION {{ currentIndex + 1 }} OF {{ questions.length }}
        </span>
        <span class="px-2 py-0.5 rounded text-[11px] font-mono border"
          :class="[
            currentQuestion.type === 'conceptual'
              ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20'
              : currentQuestion.type === 'code-tracing'
              ? 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20'
              : currentQuestion.type === 'debugging'
              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
              : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
          ]"
        >
          {{ currentQuestion.type.toUpperCase() }}
        </span>
      </div>

      <!-- Question Card -->
      <div class="p-5 rounded-lg border border-[#1B2433] bg-[#151D2C] space-y-4">
        <h4 class="text-base font-semibold text-[#F1F5F9] leading-snug">
          {{ currentQuestion.prompt }}
        </h4>

        <!-- Code Snippet if applicable -->
        <div v-if="currentQuestion.codeSnippet" class="p-3 bg-[#0A0E17] border border-[#1B2433] rounded-md font-mono text-xs text-[#38BDF8] overflow-x-auto whitespace-pre">
          <code>{{ currentQuestion.codeSnippet }}</code>
        </div>

        <!-- Options List -->
        <div class="space-y-2.5 pt-2" role="radiogroup" :aria-label="currentQuestion.prompt">
          <button
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            type="button"
            role="radio"
            :aria-checked="selectedAnswers[currentIndex] === idx"
            :disabled="isSubmitted[currentIndex]"
            class="w-full text-left p-3.5 rounded-md border text-xs font-sans transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default"
            :class="[
              !isSubmitted[currentIndex]
                ? selectedAnswers[currentIndex] === idx
                  ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-[#F1F5F9] font-medium'
                  : 'border-[#1B2433] bg-[#101623] text-[#CBD5E1] hover:border-[#38BDF8]/30 hover:bg-[#151D2C]'
                : idx === currentQuestion.correctIndex
                ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E] font-medium'
                : selectedAnswers[currentIndex] === idx
                ? 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444]'
                : 'border-[#1B2433] bg-[#101623] text-[#64748B] opacity-60'
            ]"
            :data-testid="`option-${idx}`"
            @click="selectOption(idx)"
          >
            <span
              class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5"
              :class="[
                !isSubmitted[currentIndex]
                  ? selectedAnswers[currentIndex] === idx
                    ? 'border-[#38BDF8] bg-[#38BDF8] text-[#020617] font-bold'
                    : 'border-[#334155] text-[#94A3B8]'
                  : idx === currentQuestion.correctIndex
                  ? 'border-[#22C55E] bg-[#22C55E] text-[#020617] font-bold'
                  : selectedAnswers[currentIndex] === idx
                  ? 'border-[#EF4444] bg-[#EF4444] text-[#FFFFFF]'
                  : 'border-[#334155] text-[#64748B]'
              ]"
            >
              {{ String.fromCharCode(65 + idx) }}
            </span>
            <span class="flex-1 leading-relaxed">{{ option }}</span>
            <CheckCircle2
              v-if="isSubmitted[currentIndex] && idx === currentQuestion.correctIndex"
              class="w-4 h-4 text-[#22C55E] shrink-0"
            />
            <XCircle
              v-if="isSubmitted[currentIndex] && selectedAnswers[currentIndex] === idx && idx !== currentQuestion.correctIndex"
              class="w-4 h-4 text-[#EF4444] shrink-0"
            />
          </button>
        </div>

        <!-- Explanation card after submitting -->
        <div
          v-if="isSubmitted[currentIndex]"
          class="p-4 rounded-lg border text-xs space-y-1.5 mt-4"
          :class="[
            selectedAnswers[currentIndex] === currentQuestion.correctIndex
              ? 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#CBD5E1]'
              : 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#CBD5E1]'
          ]"
          data-testid="explanation-card"
        >
          <div class="font-bold flex items-center gap-1.5"
            :class="selectedAnswers[currentIndex] === currentQuestion.correctIndex ? 'text-[#22C55E]' : 'text-[#EF4444]'"
          >
            <span v-if="selectedAnswers[currentIndex] === currentQuestion.correctIndex">Correct!</span>
            <span v-else>Incorrect</span>
          </div>
          <p class="leading-relaxed font-sans">{{ currentQuestion.explanation }}</p>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex items-center justify-between pt-2">
        <div class="text-[11px] font-mono text-[#94A3B8]">
          Pass Criteria: &ge; 80% + Failure Lab Completion
        </div>
        <div>
          <button
            v-if="!isSubmitted[currentIndex]"
            type="button"
            :disabled="selectedAnswers[currentIndex] === undefined"
            class="px-4 py-2 rounded-lg bg-[#38BDF8] text-[#020617] text-xs font-mono font-bold hover:bg-[#38BDF8]/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            data-testid="submit-answer-btn"
            @click="submitAnswer"
          >
            CONFIRM ANSWER
          </button>
          <button
            v-else
            type="button"
            class="px-4 py-2 rounded-lg bg-[#38BDF8] text-[#020617] text-xs font-mono font-bold hover:bg-[#38BDF8]/90 cursor-pointer flex items-center gap-1.5 transition-all"
            data-testid="next-question-btn"
            @click="nextQuestion"
          >
            <span>{{ currentIndex < questions.length - 1 ? 'NEXT QUESTION' : 'VIEW SCORE REPORT' }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Results Summary View -->
    <div v-else class="space-y-6" data-testid="assessment-summary">
      <div class="p-6 rounded-xl border border-[#1E293B] bg-[#151B28] text-center space-y-4">
        <div class="w-12 h-12 rounded-full mx-auto flex items-center justify-center border"
          :class="isPassed ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]' : 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'"
        >
          <Trophy v-if="isPassed" class="w-6 h-6" />
          <AlertTriangle v-else class="w-6 h-6" />
        </div>

        <div class="space-y-1">
          <h3 class="text-xl font-bold text-[#F8FAFC]">
            {{ isPassed ? 'Module Assessment Passed!' : 'Assessment Not Passed' }}
          </h3>
          <p class="text-xs text-[#94A3B8] font-sans">
            {{ isPassed
              ? 'Demonstrated mastery of Java record shallow vs deep immutability, defensive copies, and concurrency boundaries.'
              : 'Senior engineering standard requires &ge; 80% on the assessment and completion of the Break/Failure lab.' }}
          </p>
        </div>

        <!-- Metric Badges -->
        <div class="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left pt-2">
          <div class="p-3 bg-[#111622] rounded-lg border border-[#1E293B]">
            <div class="text-[10px] font-mono text-[#94A3B8] uppercase">Score</div>
            <div class="text-lg font-mono font-bold" :class="scorePercent >= 80 ? 'text-[#22C55E]' : 'text-[#EF4444]'">
              {{ scorePercent }}% ({{ correctCount }}/{{ questions.length }})
            </div>
          </div>
          <div class="p-3 bg-[#111622] rounded-lg border border-[#1E293B]">
            <div class="text-[10px] font-mono text-[#94A3B8] uppercase">Failure Lab</div>
            <div class="text-lg font-mono font-bold" :class="failureLabCompleted ? 'text-[#22C55E]' : 'text-[#EF4444]'">
              {{ failureLabCompleted ? 'COMPLETED' : 'INCOMPLETE' }}
            </div>
          </div>
        </div>

        <!-- Failure Lab Warning if not done -->
        <div v-if="!failureLabCompleted" class="p-3 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 text-xs text-[#EF4444] text-left">
          <strong>Mandatory Requirement:</strong> You scored {{ scorePercent }}%, but the module cannot be marked COMPLETED until you complete the Break Lab (Failure Injection) in Stage 3.
        </div>

        <!-- Retake Button -->
        <div class="pt-4 flex justify-center gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] text-xs font-mono font-bold hover:bg-[#38BDF8]/20 flex items-center gap-2 cursor-pointer transition-colors"
            data-testid="retake-assessment-btn"
            @click="resetAssessment"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>RETAKE ASSESSMENT</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
