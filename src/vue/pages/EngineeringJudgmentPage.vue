<script setup lang="ts">
/**
 * Phase A — Engineering Judgment Lab.
 *
 * Route: /engineering/judgment
 *
 * The learner cannot pass by picking the right option: every scenario requires a
 * written decision, a named investigation plan, the signals they would actually
 * read, a falsifier, and a confidence. The engine scores the SHAPE of that
 * reasoning deterministically (src/engines/judgmentEngine.ts).
 */
import { ref, computed, onMounted } from 'vue';
import { Scale, Brain, Target, CheckCircle2, Circle, AlertTriangle, Search, X, Gauge, Lock } from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';
import EmptyState from '../components/EmptyState.vue';
import ProgressBar from '../components/ProgressBar.vue';
import StatCard from '../components/StatCard.vue';
import Badge from '../components/ui/Badge.vue';
import Button from '../components/ui/Button.vue';
import Textarea from '../components/ui/Textarea.vue';
import { JUDGMENT_SCENARIOS } from '../../data/judgmentScenarios';
import {
  JUDGMENT_LEVELS,
  JUDGMENT_LEVEL_LABELS,
  JUDGMENT_LEVEL_DESCRIPTIONS,
  EVIDENCE_SIGNAL_LABELS,
  type EvidenceSignal,
  type JudgmentEvaluation,
  type JudgmentScenario,
} from '../../engines/judgmentEngine';

const store = useLearningStore();

const selectedId = ref<string>(JUDGMENT_SCENARIOS[0].id);
const searchQuery = ref('');
const results = ref<Record<string, JudgmentEvaluation>>({});

// --- draft submission -------------------------------------------------
const draft = ref({
  chosenOptionIndex: -1,
  reasoning: '',
  investigationPlan: '',
  claimedSignals: [] as EvidenceSignal[],
  confidence: 50,
  falsification: '',
});

const activeScenario = computed<JudgmentScenario | null>(
  () => JUDGMENT_SCENARIOS.find((scenario) => scenario.id === selectedId.value) ?? null
);

const activeResult = computed(() =>
  activeScenario.value ? results.value[activeScenario.value.id] : undefined
);

const activeRecord = computed(() =>
  activeScenario.value ? store.judgmentRecords[activeScenario.value.id] : undefined
);

const draftReady = computed(
  () =>
    draft.value.chosenOptionIndex >= 0 &&
    draft.value.reasoning.trim().length > 0 &&
    draft.value.investigationPlan.trim().length > 0 &&
    draft.value.falsification.trim().length > 0
);

const filteredScenarios = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return JUDGMENT_SCENARIOS;
  return JUDGMENT_SCENARIOS.filter(
    (scenario) =>
      scenario.id.toLowerCase().includes(q) ||
      scenario.title.toLowerCase().includes(q) ||
      scenario.domain.includes(q)
  );
});

function selectScenario(id: string): void {
  selectedId.value = id;
  resetDraft();
}

function resetDraft(): void {
  draft.value = {
    chosenOptionIndex: -1,
    reasoning: '',
    investigationPlan: '',
    claimedSignals: [],
    confidence: 50,
    falsification: '',
  };
}

function toggleSignal(signal: EvidenceSignal): void {
  const current = draft.value.claimedSignals;
  draft.value.claimedSignals = current.includes(signal)
    ? current.filter((item) => item !== signal)
    : [...current, signal];
}

function submit(): void {
  const scenario = activeScenario.value;
  if (!scenario || !draftReady.value) return;
  const evaluation = store.submitJudgment(scenario.id, {
    chosenOptionIndex: draft.value.chosenOptionIndex,
    reasoning: draft.value.reasoning,
    investigationPlan: draft.value.investigationPlan,
    claimedSignals: draft.value.claimedSignals,
    confidence: draft.value.confidence,
    falsification: draft.value.falsification,
  });
  results.value = { ...results.value, [scenario.id]: evaluation };
}

onMounted(() => {
  // Seed the visible evaluation from persisted evidence so a reload does not
  // erase what the learner already earned (§10: never fake completion).
  JUDGMENT_SCENARIOS.forEach((scenario) => {
    const record = store.judgmentRecords[scenario.id];
    if (record) {
      results.value[scenario.id] = {
        level: record.level,
        score: record.score,
        correctDecision: record.correctDecision,
        rightAnswerWrongReason: false,
        wrongAnswerRightReason: false,
        fellForTemptingShortcut: false,
        signals: [],
        calibrationError: Math.abs(record.confidence - record.score),
        calibrationVerdict: record.calibrationVerdict,
        auditTrail: [],
        seniorGaps: [],
        feedback: `Restored from your recorded attempt at ${record.attemptedAt}. Submit again to re-evaluate.`,
      };
    }
  });
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12" data-testid="judgment-page">
    <PageHeader
      title="Engineering Judgment Lab"
      description="Eight production scenarios with a deliberate trap in each. You cannot pass by guessing — the lab scores the evidence behind your decision, the plan you would run first, and what would prove you wrong."
    >
      <template #actions>
        <Badge variant="purple" dot>
          {{ store.judgmentProgress.passed }}/{{ store.judgmentProgress.total }} at evidence level or above
        </Badge>
      </template>
    </PageHeader>

    <!-- The 4-level ladder -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-3" data-testid="judgment-ladder">
      <div class="flex items-center gap-2">
        <Brain class="w-4 h-4 text-[#A855F7]" />
        <h2 class="text-sm font-semibold text-[#F1F5F9]">The reasoning ladder</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div
          v-for="(level, index) in JUDGMENT_LEVELS"
          :key="level"
          class="p-3 rounded-md border"
          :class="
            level === 'SENIOR'
              ? 'border-[#22C55E]/40 bg-[#22C55E]/5'
              : level === 'EVIDENCE_DRIVEN'
              ? 'border-[#38BDF8]/40 bg-[#38BDF8]/5'
              : 'border-[#1B2433] bg-[#151D2C]'
          "
          :data-testid="`ladder-${level}`"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-mono text-[#64748B]">LEVEL {{ index + 1 }}</span>
            <span class="text-[10px] font-mono text-[#38BDF8]">{{ store.judgmentProgress.byLevel[level] }}</span>
          </div>
          <div class="text-xs font-semibold text-[#F1F5F9]">{{ JUDGMENT_LEVEL_LABELS[level] }}</div>
          <p class="text-[10px] text-[#64748B] mt-1 leading-relaxed">{{ JUDGMENT_LEVEL_DESCRIPTIONS[level] }}</p>
        </div>
      </div>
    </div>

    <!-- Track statistics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Scenarios Attempted" :value="`${store.judgmentProgress.attempted}/${store.judgmentProgress.total}`" :icon="Scale" />
      <StatCard
        label="Senior-Level Decisions"
        :value="store.judgmentProgress.seniorLevel"
        :icon="Target"
        icon-color="text-[#22C55E]"
        icon-bg="bg-[#22C55E]/10 border-[#22C55E]/20"
      />
      <StatCard
        label="Average Score"
        :value="store.judgmentProgress.attempted === 0 ? '—' : store.judgmentProgress.averageScore"
        :sub-value="store.judgmentProgress.attempted === 0 ? 'no evidence' : 'of 100'"
        :icon="Gauge"
      />
      <StatCard
        label="Calibration Error"
        :value="store.judgmentProgress.attempted === 0 ? '—' : store.judgmentProgress.averageCalibrationError"
        :sub-value="store.judgmentProgress.attempted === 0 ? 'no evidence' : 'avg points off'"
        :icon="Brain"
        icon-color="text-[#F59E0B]"
        icon-bg="bg-[#F59E0B]/10 border-[#F59E0B]/20"
      />
    </div>

    <!-- Domain coverage — honest gaps are shown, never filled -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-2">
      <h2 class="text-sm font-semibold text-[#F1F5F9]">Domain coverage</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          v-for="entry in store.judgmentProgress.domainCoverage"
          :key="entry.domain"
          class="p-2.5 rounded-md border border-[#1B2433] bg-[#151D2C]"
          :data-testid="`judgment-domain-${entry.domain}`"
        >
          <div class="text-[10px] font-mono text-[#94A3B8] uppercase">{{ entry.domain }}</div>
          <ProgressBar
            :value="entry.attempted"
            :max="entry.total"
            size="xs"
            :variant="entry.attempted === entry.total ? 'success' : 'primary'"
          />
          <div class="text-[10px] font-mono text-[#64748B] mt-1">{{ entry.attempted }}/{{ entry.total }}</div>
        </div>
      </div>
      <p v-if="store.judgmentProgress.untouchedDomains.length > 0" class="text-[10px] font-mono text-[#F59E0B]">
        UNTOUCHED DOMAINS: {{ store.judgmentProgress.untouchedDomains.join(', ') }} — no evidence recorded.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Scenario list -->
      <div class="lg:col-span-1 space-y-3">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#64748B]">
            <Search class="w-3.5 h-3.5" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search scenarios..."
            class="w-full pl-8 pr-7 py-1.5 bg-[#151B28] border border-[#1E293B] rounded-md text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-none"
            data-testid="judgment-search"
          />
          <button
            v-if="searchQuery"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#64748B] hover:text-[#F8FAFC]"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <EmptyState
          v-if="filteredScenarios.length === 0"
          :icon="Search"
          title="No scenarios match"
          description="Clear the search to see all scenarios."
          action-label="Clear search"
          @action="searchQuery = ''"
        />

        <button
          v-for="scenario in filteredScenarios"
          :key="scenario.id"
          type="button"
          :data-testid="`judgment-scenario-${scenario.id}`"
          class="w-full text-left p-3 rounded-lg border ui-transition cursor-pointer"
          :class="
            activeScenario?.id === scenario.id
              ? 'bg-[#101623] border-[#38BDF8]/60 ring-1 ring-[#38BDF8]/30'
              : 'bg-[#101623] border-[#1B2433] hover:border-[#334155]'
          "
          @click="selectScenario(scenario.id)"
        >
          <div class="flex items-start gap-2">
            <CheckCircle2
              v-if="store.judgmentRecords[scenario.id] && (store.judgmentRecords[scenario.id]!.level === 'SENIOR' || store.judgmentRecords[scenario.id]!.level === 'EVIDENCE_DRIVEN')"
              class="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5"
            />
            <Circle v-else class="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-[#64748B]">{{ scenario.id }}</span>
                <Badge size="sm" variant="outline">{{ scenario.domain }}</Badge>
              </div>
              <div class="text-xs font-semibold text-[#F1F5F9] mt-0.5 leading-snug">{{ scenario.title }}</div>
              <div v-if="store.judgmentRecords[scenario.id]" class="text-[10px] font-mono text-[#38BDF8] mt-1">
                {{ JUDGMENT_LEVEL_LABELS[store.judgmentRecords[scenario.id]!.level] }} · {{ store.judgmentRecords[scenario.id]!.score }}/100
              </div>
            </div>
          </div>
        </button>
      </div>

      <!-- Scenario workspace -->
      <div class="lg:col-span-2 space-y-4">
        <EmptyState
          v-if="!activeScenario"
          :icon="Scale"
          title="No scenario selected"
          description="Pick a scenario to start."
        />

        <template v-else>
          <!-- Brief -->
          <div class="bg-[#111622] border border-[#38BDF8]/30 rounded-lg p-5 space-y-3" data-testid="judgment-brief">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                {{ activeScenario.id }}
              </span>
              <Badge size="sm" variant="purple">{{ activeScenario.domain }}</Badge>
              <Badge size="sm" :variant="activeRecord ? 'success' : 'outline'">
                {{ activeRecord ? JUDGMENT_LEVEL_LABELS[activeRecord.level] : 'NOT ATTEMPTED' }}
              </Badge>
            </div>
            <h2 class="text-base font-bold text-[#F8FAFC]">{{ activeScenario.title }}</h2>
            <p class="text-xs text-[#CBD5E1] leading-relaxed">{{ activeScenario.context }}</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                <div class="text-[10px] font-mono font-bold text-[#F59E0B] uppercase">Constraints</div>
                <ul class="mt-1 space-y-0.5">
                  <li v-for="c in activeScenario.constraints" :key="c" class="text-[11px] text-[#CBD5E1]">• {{ c }}</li>
                </ul>
              </div>
              <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">Symptoms</div>
                <ul class="mt-1 space-y-0.5">
                  <li v-for="s in activeScenario.symptoms" :key="s" class="text-[11px] text-[#CBD5E1]">• {{ s }}</li>
                </ul>
              </div>
            </div>

            <div class="p-2.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30">
              <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">The tempting shortcut</div>
              <p class="text-[11px] text-[#F1F5F9] mt-1">{{ activeScenario.temptingShortcut }}</p>
              <p class="text-[10px] text-[#94A3B8] mt-1">
                Why it is attractive: {{ activeScenario.whyTempting }} Choosing it costs you marks even if it happens to work.
              </p>
            </div>
          </div>

          <!-- Evidence available in THIS scenario -->
          <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-2" data-testid="judgment-evidence">
            <h3 class="text-sm font-semibold text-[#F1F5F9]">Evidence you can actually read here</h3>
            <p class="text-[10px] font-mono text-[#64748B]">
              Citing a signal outside this list is credited as unearned — you cannot reason from evidence you do not have.
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="signal in activeScenario.availableEvidence"
                :key="signal"
                class="px-2 py-0.5 rounded text-[10px] font-mono border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]"
              >
                {{ EVIDENCE_SIGNAL_LABELS[signal] }}
              </span>
            </div>
          </div>

          <!-- Decision form -->
          <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-3">
            <h3 class="text-sm font-semibold text-[#F1F5F9]">Your decision</h3>

            <div class="space-y-1.5" data-testid="judgment-options">
              <label
                v-for="(option, index) in activeScenario.options"
                :key="option.id"
                class="flex items-start gap-2 p-3 rounded-md border cursor-pointer"
                :class="
                  draft.chosenOptionIndex === index
                    ? 'border-[#38BDF8]/60 bg-[#38BDF8]/10'
                    : 'border-[#1B2433] bg-[#0A0E17]'
                "
                :data-testid="`judgment-option-${option.id}`"
              >
                <input v-model="draft.chosenOptionIndex" type="radio" :value="index" :name="`opt-${activeScenario.id}`" />
                <span class="min-w-0">
                  <span class="block text-xs text-[#F1F5F9] font-medium">{{ option.action }}</span>
                  <span class="block text-[10px] text-[#64748B] mt-1">Expected outcome: {{ option.outcome }}</span>
                </span>
              </label>
            </div>

            <div>
              <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase mb-1">
                Which signals would you read before deciding?
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="signal in activeScenario.availableEvidence"
                  :key="signal"
                  type="button"
                  class="px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ui-transition"
                  :class="
                    draft.claimedSignals.includes(signal)
                      ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40'
                      : 'bg-[#151D2C] text-[#94A3B8] border-[#1B2433]'
                  "
                  :data-testid="`judgment-signal-${signal}`"
                  @click="toggleSignal(signal)"
                >
                  {{ EVIDENCE_SIGNAL_LABELS[signal] }}
                </button>
              </div>
            </div>

            <Textarea
              v-model="draft.investigationPlan"
              label="What do you check FIRST, and in what order?"
              :helper-text="`Minimum ${30} characters. Write the actual steps you would run.`"
              data-testid="judgment-plan"
            />

            <Textarea
              v-model="draft.reasoning"
              label="Reasoning and the trade-off you are accepting"
              :helper-text="`Minimum ${40} characters.`"
              data-testid="judgment-reasoning"
            />

            <Textarea
              v-model="draft.falsification"
              label="What evidence would prove this decision WRONG?"
              helper-text="This is what separates a senior decision from a belief. Minimum 40 characters."
              data-testid="judgment-falsification"
            />

            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-[10px] font-mono text-[#94A3B8]">Confidence: {{ draft.confidence }}%</span>
              <input
                v-model.number="draft.confidence"
                type="range"
                min="0"
                max="100"
                step="5"
                class="flex-1 min-w-[160px]"
                data-testid="judgment-confidence"
                aria-label="Decision confidence"
              />
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <Button variant="primary" :disabled="!draftReady" data-testid="judgment-submit" @click="submit">
                Submit decision
              </Button>
              <Button variant="ghost" data-testid="judgment-reset" @click="resetDraft">Clear</Button>
              <span v-if="!draftReady" class="text-[10px] font-mono text-[#F59E0B]">
                An option, a plan, reasoning and a falsifier are all required — you cannot pass silently.
              </span>
            </div>
          </div>

          <!-- Evaluation -->
          <div
            v-if="activeResult"
            class="rounded-lg p-4 space-y-3 border"
            :class="
              activeResult.level === 'SENIOR'
                ? 'border-[#22C55E]/40 bg-[#22C55E]/5'
                : activeResult.level === 'EVIDENCE_DRIVEN'
                ? 'border-[#38BDF8]/40 bg-[#38BDF8]/5'
                : 'border-[#EF4444]/40 bg-[#EF4444]/5'
            "
            data-testid="judgment-result"
          >
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <Badge
                :variant="activeResult.level === 'SENIOR' ? 'success' : activeResult.level === 'EVIDENCE_DRIVEN' ? 'primary' : 'danger'"
              >
                {{ JUDGMENT_LEVEL_LABELS[activeResult.level] }} · {{ activeResult.score }}/100
              </Badge>
              <div class="flex items-center gap-2 flex-wrap">
                <Badge size="sm" :variant="activeResult.correctDecision ? 'success' : 'danger'">
                  {{ activeResult.correctDecision ? 'CORRECT ACTION' : 'INCORRECT ACTION' }}
                </Badge>
                <Badge v-if="activeResult.fellForTemptingShortcut" size="sm" variant="danger">
                  FELL FOR THE SHORTCUT
                </Badge>
                <Badge size="sm" variant="outline">{{ activeResult.calibrationVerdict }}</Badge>
              </div>
            </div>

            <p class="text-xs text-[#CBD5E1] leading-relaxed">{{ activeResult.feedback }}</p>

            <div v-if="activeResult.signals.length > 0" class="space-y-1">
              <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Evidence credit</div>
              <div
                v-for="signal in activeResult.signals"
                :key="signal.signal"
                class="text-[11px] flex items-start gap-2"
                :class="signal.credit ? 'text-[#22C55E]' : 'text-[#64748B]'"
              >
                <span>{{ signal.credit ? '✓' : '·' }}</span>
                <span>{{ signal.rationale }}</span>
              </div>
            </div>

            <div v-if="activeResult.seniorGaps.length > 0" class="p-2.5 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/30 space-y-1">
              <div class="text-[10px] font-mono font-bold text-[#F59E0B] uppercase flex items-center gap-1">
                <AlertTriangle class="w-3 h-3" /> What a senior would have added
              </div>
              <p v-for="gap in activeResult.seniorGaps" :key="gap" class="text-[11px] text-[#CBD5E1]">• {{ gap }}</p>
            </div>

            <details v-if="activeResult.auditTrail.length > 0" class="text-[11px] text-[#64748B]">
              <summary class="cursor-pointer text-[#38BDF8]">Score audit trail</summary>
              <ul class="mt-1 font-mono space-y-0.5">
                <li v-for="line in activeResult.auditTrail" :key="line">{{ line }}</li>
              </ul>
            </details>

            <details v-if="activeResult.correctDecision" class="text-[11px] text-[#64748B]">
              <summary class="cursor-pointer text-[#38BDF8]">Rejected alternatives and the full decision</summary>
              <ul class="mt-1 space-y-0.5">
                <li v-for="alt in activeScenario.rejectedAlternatives" :key="alt" class="text-[#CBD5E1]">• {{ alt }}</li>
              </ul>
              <p class="mt-2 text-[#CBD5E1]"><span class="text-[#22C55E] font-mono">DECISION:</span> {{ activeScenario.seniorDecision }}</p>
              <p class="mt-1 text-[#CBD5E1]"><span class="text-[#F59E0B] font-mono">COST:</span> {{ activeScenario.consequence }}</p>
              <p class="mt-1 text-[#CBD5E1]"><span class="text-[#38BDF8] font-mono">VERIFY:</span> {{ activeScenario.verification }}</p>
              <p class="mt-1 text-[#CBD5E1]"><span class="text-[#A855F7] font-mono">FALSIFIER:</span> {{ activeScenario.falsifier }}</p>
            </details>
          </div>
        </template>
      </div>
    </div>

    <!-- Honest gate -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-2">
      <div class="flex items-center gap-2">
        <Lock class="w-4 h-4 text-[#64748B]" />
        <h2 class="text-sm font-semibold text-[#F1F5F9]">Judgment gate</h2>
      </div>
      <p class="text-xs text-[#94A3B8]">
        A scenario counts as passed at EVIDENCE_DRIVEN or above. A correct guess scores PLAUSIBLE at best and
        <strong>never</strong> counts. {{ store.judgmentProgress.passed }} of {{ store.judgmentProgress.total }} scenarios currently pass.
      </p>
      <ProgressBar
        :value="store.judgmentProgress.passed"
        :max="store.judgmentProgress.total"
        variant="success"
        show-label
        label="Scenarios at evidence level or above"
      />
    </div>
  </div>
</template>