<script setup lang="ts">
/**
 * Microservices Engineering Track — the production caller of
 * `src/engines/microservices.ts`.
 *
 * Before this page existed, the entire six-phase track (7,163 lines of
 * curriculum) plus a 736-line deterministic engine were unreachable: the
 * route rendered `PagePlaceholder`. Per mission §11 a test-only caller does
 * not count, so this page is the fix that makes the track real.
 *
 * Every "complete" affordance below routes through a store action that writes
 * a recorded learner action into the persisted progress record. Nothing is
 * optimistically marked done.
 */
import { ref, computed } from 'vue';
import {
  CheckCircle2,
  Circle,
  Lock,
  Layers,
  AlertOctagon,
  Gauge,
  Play,
  Wrench,
  Search,
  X,
  Activity,
  ShieldCheck,
  GitBranch,
  Terminal,
  Award,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';
import EmptyState from '../components/EmptyState.vue';
import ProgressBar from '../components/ProgressBar.vue';
import StatCard from '../components/StatCard.vue';
import Badge from '../components/ui/Badge.vue';
import Button from '../components/ui/Button.vue';
import CodeBlock from '../components/ui/CodeBlock.vue';
import Textarea from '../components/ui/Textarea.vue';
import { ALL_MS_PHASES, ALL_MS_INCIDENTS } from '../../data/microservices';
import { MS_EXECUTION_LABELS, MS_EXECUTION_NOTES } from '../../data/microservices/shared';
import type {
  MsModule,
  MsExecutionMode,
  MsLoopStage,
  MsFailureLabSpec,
  MsAssessmentQuestion,
  MsIncident,
} from '../../data/microservices/types';
import {
  MS_STAGE_LABELS,
  MS_COMPETENCY_DIMENSIONS,
  MS_PASS_THRESHOLD_PERCENT,
  applicableStages,
  findActiveModule,
  getModuleStatus,
  msDimensionLabel,
  scoreMsAssessment,
  stageProgressPercent,
} from '../../engines/microservices';
import {
  gradeIncidentTriage,
  selectOpenIncidents,
  type IncidentStep,
  type IncidentTriageResult,
} from '../../engines/incidentEngine';

type Tab = 'learn' | 'labs' | 'break' | 'design' | 'incidents' | 'assess' | 'defend' | 'ai';

const store = useLearningStore();

const selectedModuleId = ref<string>('');
const activeTab = ref<Tab>('learn');
const searchQuery = ref('');
const filterUnlockedOnly = ref(false);

// --- module selection -------------------------------------------------
const moduleStatus = (module: MsModule) =>
  getModuleStatus(module, store.getMsModuleRecord(module.id), store.msCompletedModuleIds);

const unlockedModules = computed(() =>
  store.msModules.filter((m) => moduleStatus(m) !== 'LOCKED')
);

const filteredModules = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return store.msModules.filter((m) => {
    if (filterUnlockedOnly.value && moduleStatus(m) === 'LOCKED') return false;
    if (!q) return true;
    return (
      m.id.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q) ||
      m.stackFocus.some((s) => s.toLowerCase().includes(q))
    );
  });
});

const suggestedModule = computed(() =>
  findActiveModule(store.msModules, store.msCompletedModuleIds, store.msProgress)
);

const activeModule = computed<MsModule | null>(() => {
  const found = store.msModules.find((m) => m.id === selectedModuleId.value);
  return found ?? null;
});

const activeRecord = computed(() =>
  activeModule.value ? store.getMsModuleRecord(activeModule.value.id) : undefined
);

// --- loop stage gates -------------------------------------------------
function stageDone(stage: MsLoopStage): boolean {
  return Boolean(activeRecord.value?.stages.includes(stage));
}

function selectModule(id: string, tab: Tab = 'learn'): void {
  selectedModuleId.value = id;
  activeTab.value = tab;
}

function openSuggested(): void {
  if (suggestedModule.value) selectModule(suggestedModule.value.id);
}

function resetFilters(): void {
  searchQuery.value = '';
  filterUnlockedOnly.value = false;
}

// --- failure lab state ------------------------------------------------
const labState = ref<{
  moduleId: string;
  labId: string;
  step: 'hypothesis' | 'rootcause' | 'fix' | 'done';
  hypothesis: number | null;
  rootCause: number | null;
  fix: number | null;
  graded: boolean;
  passed: boolean;
} | null>(null);

const activeLab = computed<MsFailureLabSpec | null>(() => {
  if (!labState.value || !activeModule.value) return null;
  return (
    activeModule.value.failureLabs.find((l) => l.id === labState.value?.labId) ?? null
  );
});

function openLab(lab: MsFailureLabSpec): void {
  labState.value = {
    moduleId: activeModule.value?.id ?? '',
    labId: lab.id,
    step: 'hypothesis',
    hypothesis: null,
    rootCause: null,
    fix: null,
    graded: false,
    passed: false,
  };
}

function gradeLab(): void {
  const state = labState.value;
  const lab = activeLab.value;
  if (!state || !lab) return;
  const passed =
    state.hypothesis === lab.correctHypothesisIndex &&
    state.rootCause === lab.correctRootCauseIndex &&
    state.fix === lab.correctFixIndex;
  state.passed = passed;
  state.graded = true;
  state.step = 'done';
  store.recordMsFailureLab(state.moduleId, lab.id, passed);
}

function closeLab(): void {
  labState.value = null;
}

// --- assessment state -------------------------------------------------
const answers = ref<Record<number, number>>({});
const assessed = ref(false);

function resetAssessment(): void {
  answers.value = {};
  assessed.value = false;
}

const assessmentResult = computed(() => {
  const module = activeModule.value;
  if (!module || !assessed.value) return null;
  return scoreMsAssessment(module.assessment, answers.value);
});

function submitAssessment(): void {
  const module = activeModule.value;
  if (!module) return;
  const result = scoreMsAssessment(module.assessment, answers.value);
  assessed.value = true;
  store.recordMsAssessmentScore(module.id, result.scorePercent);
}

// --- defense / explain self-score -------------------------------------
const defenseScores = ref<Record<string, number>>({});
const defenseNote = ref('');

function scoreDefense(questionId: string, value: number): void {
  const module = activeModule.value;
  if (!module) return;
  defenseScores.value = { ...defenseScores.value, [questionId]: value };
  store.recordMsSelfScore(module.id, 'defend', value);
}

function scoreExplanation(value: number): void {
  const module = activeModule.value;
  if (!module) return;
  store.recordMsSelfScore(module.id, 'explain', value);
  store.recordMsStage(module.id, 'explain');
}

// --- incident triage (Observe → Hypothesise → Investigate → Debug → Fix → Verify → Explain)
const resolvedIncidentIds = computed(
  () => new Set(Object.values(store.msProgress).flatMap((r) => r.incidentsResolved))
);

function isIncidentResolved(id: string): boolean {
  return resolvedIncidentIds.value.has(id);
}

const triage = ref<{
  incidentId: string;
  step: IncidentStep;
  hypothesis: number | null;
  rootCause: number | null;
  appliedFix: boolean;
  note: string;
  result: IncidentTriageResult | null;
} | null>(null);

const moduleIncidents = computed<MsIncident[]>(() =>
  ALL_MS_INCIDENTS.filter((incident) => incident.moduleId === activeModule.value?.id)
);

const activeIncident = computed<MsIncident | null>(() => {
  if (!triage.value) return null;
  return ALL_MS_INCIDENTS.find((incident) => incident.id === triage.value?.incidentId) ?? null;
});

/** All open incidents, most severe first — derived by the engine, not sorted here. */
const openIncidentsBySeverity = computed(() =>
  selectOpenIncidents(ALL_MS_INCIDENTS, [...resolvedIncidentIds.value])
);

function openTriage(incident: MsIncident): void {
  triage.value = {
    incidentId: incident.id,
    step: 'OBSERVE',
    hypothesis: null,
    rootCause: null,
    appliedFix: false,
    note: '',
    result: null,
  };
  selectModule(incident.moduleId, 'incidents');
}

/** Advances only as far as the engine's gate allows. */
function advanceTriage(): void {
  const state = triage.value;
  if (!state) return;
  const order: IncidentStep[] = ['OBSERVE', 'HYPOTHESIS', 'DEBUG', 'FIX', 'VERIFY', 'POSTMORTEM', 'RESOLVED'];
  const currentIndex = order.indexOf(state.step);
  if (currentIndex < 0 || currentIndex >= order.length - 1) return;
  state.step = order[currentIndex + 1];
}

function gradeTriage(): void {
  const state = triage.value;
  const incident = activeIncident.value;
  if (!state || !incident) return;

  const result = gradeIncidentTriage(incident, {
    hypothesisIndex: state.hypothesis,
    rootCauseIndex: state.rootCause,
    fixApplied: state.appliedFix,
    postmortem: state.note,
  });
  state.result = result;
  state.step = result.nextStep;

  // Evidence is recorded only when the triage itself was correct. A failed
  // triage stays an open incident — an honest, visible failure state.
  if (result.correct) resolveIncident(incident);
}

function finishPostmortem(): void {
  const state = triage.value;
  const incident = activeIncident.value;
  if (!state || !incident || !state.result?.correct) return;
  const result = gradeIncidentTriage(incident, {
    hypothesisIndex: state.hypothesis,
    rootCauseIndex: state.rootCause,
    fixApplied: state.appliedFix,
    postmortem: state.note,
  });
  state.result = result;
  state.step = result.nextStep;
}

function resolveIncident(incident: MsIncident): void {
  store.recordMsIncident(incident.moduleId, incident.id);
}

function incidentModuleTitle(moduleId: string): string {
  return store.msModules.find((m) => m.id === moduleId)?.title ?? moduleId;
}

function closeTriage(): void {
  triage.value = null;
}

// --- design submission ------------------------------------------------
const designNote = ref('');

function submitDesign(): void {
  const module = activeModule.value;
  if (!module?.architectureChallenge) return;
  store.recordMsDesign(module.id, module.architectureChallenge.id);
}

const executionMode = (mode: MsExecutionMode) => MS_EXECUTION_LABELS[mode];
const executionNote = (mode: MsExecutionMode) => MS_EXECUTION_NOTES[mode];
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12" data-testid="microservices-page">
    <PageHeader
      title="Microservices Engineering Track"
      description="One continuous Senior apprenticeship on a single evolving E-commerce capstone. Every module runs the full loop: learn → code → break → observe → debug → fix → benchmark → design → explain → defend → assess → review."
    >
      <template #actions>
        <Badge variant="primary" dot>{{ store.msTrackProgress.completed }}/{{ store.msTrackProgress.total }} modules</Badge>
      </template>
    </PageHeader>

    <!-- Track statistics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Track Progress"
        :value="`${store.msProgressPercent}%`"
        :sub-value="`${store.msTrackProgress.completed}/${store.msTrackProgress.total}`"
        :icon="Layers"
      />
      <StatCard
        label="Failure Labs Passed"
        :value="`${store.msTrackProgress.failureLabsPassed}/${store.msTrackProgress.failureLabsTotal}`"
        :icon="AlertOctagon"
        icon-color="text-[#F59E0B]"
        icon-bg="bg-[#F59E0B]/10 border-[#F59E0B]/20"
      />
      <StatCard
        label="Open Incidents"
        :value="store.msOpenIncidents.length"
        :icon="Activity"
        icon-color="text-[#EF4444]"
        icon-bg="bg-[#EF4444]/10 border-[#EF4444]/20"
      />
      <StatCard
        label="Designs Completed"
        :value="`${store.msTrackProgress.designsCompleted}/${store.msTrackProgress.designsTotal}`"
        :icon="GitBranch"
        icon-color="text-[#22C55E]"
        icon-bg="bg-[#22C55E]/10 border-[#22C55E]/20"
      />
    </div>

    <!-- Overall progress -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h2 class="text-sm font-semibold text-[#F1F5F9]">Phase breakdown</h2>
        <Button
          v-if="suggestedModule"
          variant="primary"
          size="sm"
          data-testid="open-suggested"
          @click="openSuggested"
        >
          <template #default>Continue {{ suggestedModule.id }}</template>
        </Button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <div
          v-for="phase in store.msTrackProgress.byPhase.filter((p) => p.total > 0)"
          :key="phase.phase"
          class="p-2.5 rounded-md border border-[#1B2433] bg-[#151D2C] space-y-1.5"
          :data-testid="`ms-phase-${phase.phase}`"
        >
          <div class="text-[10px] font-mono text-[#94A3B8]">PHASE {{ phase.phase }}</div>
          <ProgressBar :value="phase.percent" size="xs" :label="`${phase.completed}/${phase.total}`" />
        </div>
      </div>
    </div>

    <!-- Competency matrix (12 dimensions, evidence-derived) -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-3">
      <div class="flex items-center gap-2">
        <Gauge class="w-4 h-4 text-[#38BDF8]" />
        <h2 class="text-sm font-semibold text-[#F1F5F9]">Competency matrix</h2>
        <span class="text-[10px] font-mono text-[#64748B]">
          derived from recorded evidence — no module touched means no score
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="dimension in store.msCompetencies"
          :key="dimension.name"
          class="p-2.5 rounded-md border border-[#1B2433] bg-[#151D2C]"
          :data-testid="`ms-competency-${dimension.name.toLowerCase().replace(/\s+/g, '-')}`"
        >
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[11px] font-mono text-[#F1F5F9]">{{ dimension.name }}</span>
            <span class="text-[10px] font-mono" :class="dimension.score >= 70 ? 'text-[#22C55E]' : 'text-[#64748B]'">
              {{ dimension.totalTopics === 0 ? 'NO EVIDENCE' : `${dimension.score}%` }}
            </span>
          </div>
          <ProgressBar
            :value="dimension.score"
            size="xs"
            :variant="dimension.score >= 70 ? 'success' : 'primary'"
          />
          <div class="mt-1.5 text-[10px] font-mono text-[#64748B]">
            {{ dimension.totalTopics }} module(s) · weakest: {{ dimension.weakestDimension }} · {{ dimension.level }}
          </div>
        </div>
      </div>
      <p class="text-[10px] font-mono text-[#64748B]">
        {{ MS_COMPETENCY_DIMENSIONS.length }} dimensions ·
        {{ msDimensionLabel('distributed-systems') }} is scored from failure-lab and incident evidence only.
      </p>
    </div>

    <!-- Open incidents rail -->
    <div v-if="openIncidentsBySeverity.length > 0" class="bg-[#101623] border border-[#EF4444]/30 rounded-lg p-4 space-y-3">
      <div class="flex items-center gap-2">
        <AlertOctagon class="w-4 h-4 text-[#EF4444]" />
        <h2 class="text-sm font-semibold text-[#F1F5F9]">Open production incidents</h2>
        <span class="text-[10px] font-mono text-[#64748B]">an unresolved incident outranks study</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="incident in openIncidentsBySeverity"
          :key="incident.id"
          class="p-3 rounded-md border border-[#1B2433] bg-[#151D2C] flex items-start justify-between gap-3 flex-wrap"
          :data-testid="`open-incident-${incident.id}`"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              <Badge :variant="incident.severity === 'P0' ? 'danger' : 'warning'" size="sm">{{ incident.severity }}</Badge>
              <span class="text-[10px] font-mono text-[#64748B]">{{ incident.moduleId }} · {{ incident.environment }}</span>
            </div>
            <div class="text-xs font-semibold text-[#F1F5F9]">{{ incident.title }}</div>
            <div class="text-[11px] text-[#94A3B8] mt-0.5">{{ incident.symptomSummary }}</div>
          </div>
          <Button variant="secondary" size="sm" @click="selectModule(incident.moduleId, 'incidents')">
            Triage
          </Button>
        </div>
      </div>
    </div>

    <!-- Module catalogue + module workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Catalogue -->
      <div class="lg:col-span-1 space-y-3">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#64748B]">
            <Search class="w-3.5 h-3.5" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search modules, stack..."
            class="w-full pl-8 pr-7 py-1.5 bg-[#151B28] border border-[#1E293B] rounded-md text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-none"
            data-testid="ms-search"
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

        <label class="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8] cursor-pointer">
          <input v-model="filterUnlockedOnly" type="checkbox" data-testid="ms-filter-unlocked" />
          Unlocked only ({{ unlockedModules.length }})
        </label>

        <EmptyState
          v-if="filteredModules.length === 0"
          :icon="Search"
          title="No modules match"
          description="No module matches this search or filter."
          action-label="Reset filters"
          data-testid="ms-empty"
          @action="resetFilters"
        />

        <div class="space-y-2 max-h-[720px] overflow-y-auto pr-1">
          <template v-for="phase in ALL_MS_PHASES" :key="phase.id">
            <div
              v-if="filteredModules.some((m) => m.phase === phase.id)"
              class="text-[10px] font-mono text-[#64748B] pt-2 px-0.5"
            >
              {{ phase.id }} · {{ phase.title }}
            </div>
            <button
              v-for="module in filteredModules.filter((m) => m.phase === phase.id)"
              :key="module.id"
              type="button"
              :data-testid="`ms-module-${module.id}`"
              :disabled="moduleStatus(module) === 'LOCKED'"
              class="w-full text-left p-3 rounded-lg border ui-transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              :class="
                activeModule?.id === module.id
                  ? 'bg-[#101623] border-[#38BDF8]/60 ring-1 ring-[#38BDF8]/30'
                  : moduleStatus(module) === 'COMPLETED'
                  ? 'bg-[#101623] border-[#22C55E]/30 hover:border-[#22C55E]/50'
                  : 'bg-[#101623] border-[#1B2433] hover:border-[#334155]'
              "
              @click="selectModule(module.id)"
            >
              <div class="flex items-start gap-2">
                <span class="shrink-0 mt-0.5">
                  <CheckCircle2
                    v-if="moduleStatus(module) === 'COMPLETED'"
                    class="w-4 h-4 text-[#22C55E]"
                  />
                  <Lock v-else-if="moduleStatus(module) === 'LOCKED'" class="w-4 h-4 text-[#64748B]" />
                  <Circle v-else class="w-4 h-4 text-[#38BDF8]" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center gap-1.5 text-[10px] font-mono text-[#64748B]">
                    {{ module.id }}
                    <Badge size="sm" :variant="module.executionMode === 'REAL_EXECUTABLE' ? 'success' : 'warning'">
                      {{ module.executionMode }}
                    </Badge>
                  </span>
                  <span class="block text-xs font-semibold text-[#F1F5F9] mt-0.5 leading-snug">
                    {{ module.title }}
                  </span>
                  <span class="block mt-1.5">
                    <ProgressBar
                      :value="stageProgressPercent(module, store.getMsModuleRecord(module.id))"
                      size="xs"
                    />
                  </span>
                </span>
                <ChevronRight class="w-4 h-4 text-[#64748B] shrink-0 mt-1" />
              </div>
            </button>
          </template>
        </div>
      </div>

      <!-- Workspace -->
      <div class="lg:col-span-2 space-y-4">
        <EmptyState
          v-if="!activeModule"
          :icon="BookOpen"
          title="No module selected"
          description="Pick an unlocked module to run the engineering loop. Progress is saved on every action."
          action-label="Continue suggested module"
          @action="openSuggested"
        />

        <template v-else>
          <!-- Module header -->
          <div class="bg-[#111622] border border-[#38BDF8]/30 rounded-lg p-5 space-y-3" data-testid="ms-module-detail">
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                    {{ activeModule.id }} · PHASE {{ activeModule.phase }}
                  </span>
                  <Badge
                    :variant="activeModule.executionMode === 'REAL_EXECUTABLE' ? 'success' : 'warning'"
                    size="sm"
                  >
                    {{ executionMode(activeModule.executionMode) }}
                  </Badge>
                  <Badge size="sm" variant="outline">{{ activeModule.estimatedMinutes }} min</Badge>
                </div>
                <h2 class="text-base font-bold text-[#F8FAFC] mt-2">{{ activeModule.title }}</h2>
                <p class="text-xs text-[#94A3B8]">{{ activeModule.subtitle }}</p>
              </div>
              <div class="text-right">
                <div class="text-[10px] font-mono text-[#64748B]">LOOP PROGRESS</div>
                <div class="text-xl font-bold font-mono text-[#38BDF8]">
                  {{ stageProgressPercent(activeModule, activeRecord) }}%
                </div>
              </div>
            </div>

            <p class="text-xs text-[#CBD5E1] leading-relaxed">{{ activeModule.whyItMatters }}</p>

            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="stage in applicableStages(activeModule)"
                :key="stage"
                class="px-2 py-0.5 rounded text-[10px] font-mono border"
                :class="
                  stageDone(stage)
                    ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                    : 'bg-[#151D2C] text-[#64748B] border-[#1B2433]'
                "
                :data-testid="`ms-stage-${stage}`"
              >
                {{ MS_STAGE_LABELS[stage] }}
              </span>
            </div>

            <ProgressBar
              :value="stageProgressPercent(activeModule, activeRecord)"
              variant="success"
              show-label
              label="Engineering loop"
            />
          </div>

          <!-- Tabs -->
          <div class="flex flex-wrap gap-1.5" role="tablist">
            <button
              v-for="tab in ([['learn','LEARN'],['labs','CODE LABS'],['break','FAILURE LABS'],['incidents','INCIDENTS'],['design','DESIGN'],['assess','ASSESS'],['defend','DEFEND'],['ai','AI REVIEW']] as [Tab,string][])"
              :key="tab[0]"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab[0]"
              :data-testid="`ms-tab-${tab[0]}`"
              class="px-2.5 py-1 rounded-md text-[10px] font-mono border ui-transition cursor-pointer"
              :class="
                activeTab === tab[0]
                  ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 font-semibold'
                  : 'bg-[#151D2C] text-[#94A3B8] border-[#1B2433] hover:text-[#F1F5F9]'
              "
              @click="activeTab = tab[0]"
            >
              {{ tab[1] }}
            </button>
          </div>

          <!-- LEARN -->
          <div v-if="activeTab === 'learn'" class="space-y-3" data-testid="ms-panel-learn">
            <div class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2">
              <h3 class="text-sm font-semibold text-[#F1F5F9]">Learning objective</h3>
              <p class="text-xs text-[#94A3B8] leading-relaxed">{{ activeModule.learningObjective }}</p>
              <div class="flex flex-wrap gap-1.5 pt-1">
                <Badge v-for="focus in activeModule.stackFocus" :key="focus" size="sm" variant="cyan">{{ focus }}</Badge>
              </div>
            </div>

            <div class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-3">
              <h3 class="text-sm font-semibold text-[#F1F5F9]">The 12-question explanation framework</h3>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div v-for="(value, key) in activeModule.explanation" :key="key" class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <dt class="text-[10px] font-mono uppercase text-[#38BDF8] font-bold">{{ key.replace(/([A-Z])/g, ' $1') }}</dt>
                  <dd class="text-[11px] text-[#CBD5E1] mt-1 leading-relaxed">{{ value }}</dd>
                </div>
              </dl>
            </div>

            <div class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2">
              <h3 class="text-sm font-semibold text-[#F1F5F9]">Concept exercises</h3>
              <div
                v-for="exercise in activeModule.conceptExercises"
                :key="exercise.id"
                class="p-3 rounded-md bg-[#151D2C] border border-[#1B2433]"
              >
                <div class="flex items-start justify-between gap-2">
                  <p class="text-xs text-[#F1F5F9] font-medium">{{ exercise.prompt }}</p>
                  <Badge size="sm" variant="purple">{{ msDimensionLabel(exercise.dimension) }}</Badge>
                </div>
                <p class="text-[11px] text-[#64748B] mt-1.5">Expected insight: {{ exercise.expectedInsight }}</p>
              </div>
            </div>

            <div class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2">
              <h3 class="text-sm font-semibold text-[#F1F5F9]">Debugging exercises</h3>
              <div
                v-for="exercise in activeModule.debuggingExercises"
                :key="exercise.id"
                class="p-3 rounded-md bg-[#151D2C] border border-[#1B2433] space-y-1.5"
              >
                <p class="text-xs text-[#F1F5F9] font-medium">{{ exercise.scenario }}</p>
                <p class="text-[11px] text-[#EF4444]">Symptom: {{ exercise.symptom }}</p>
                <p class="text-[11px] text-[#94A3B8]">Task: {{ exercise.task }}</p>
                <details class="text-[11px] text-[#64748B]">
                  <summary class="cursor-pointer text-[#38BDF8]">Expected conclusion</summary>
                  <p class="mt-1">{{ exercise.expectedConclusion }}</p>
                </details>
              </div>
            </div>

            <div class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2">
              <h3 class="text-sm font-semibold text-[#F1F5F9]">Technical English integration</h3>
              <p class="text-xs text-[#CBD5E1] leading-relaxed">{{ activeModule.english.sixtySecondExplanation }}</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                <div v-for="phrase in activeModule.english.sentencePatterns" :key="phrase" class="p-2 rounded bg-[#151D2C] text-[11px] text-[#94A3B8] font-mono">
                  {{ phrase }}
                </div>
              </div>
            </div>

            <Button variant="success" data-testid="ms-mark-learn" @click="store.recordMsStage(activeModule.id, 'learn')">
              Record LEARN stage
            </Button>
          </div>

          <!-- CODE LABS -->
          <div v-else-if="activeTab === 'labs'" class="space-y-3" data-testid="ms-panel-labs">
            <EmptyState
              v-if="activeModule.codeLabs.length === 0"
              :icon="Terminal"
              title="No code lab in this module"
              description="This module teaches through failure labs and design instead of an implementation lab."
            />
            <div
              v-for="labItem in activeModule.codeLabs"
              :key="labItem.id"
              class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-3"
              :data-testid="`ms-lab-${labItem.id}`"
            >
              <div class="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h3 class="text-sm font-semibold text-[#F1F5F9]">{{ labItem.title }}</h3>
                  <p class="text-[11px] text-[#94A3B8] mt-0.5">{{ labItem.objective }}</p>
                </div>
                <Badge size="sm" :variant="labItem.executionMode === 'REAL_EXECUTABLE' ? 'success' : 'warning'">
                  {{ labItem.executionMode }}
                </Badge>
              </div>

              <div class="p-2.5 rounded bg-[#0A0E17] border border-[#1B2433] text-[10px] font-mono text-[#F59E0B]">
                {{ executionNote(labItem.executionMode) }}
              </div>

              <p class="text-xs text-[#CBD5E1] leading-relaxed">{{ labItem.problemStatement }}</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <div class="text-[10px] font-mono font-bold text-[#22C55E] uppercase">Requirements</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="req in labItem.requirements" :key="req" class="text-[11px] text-[#CBD5E1]">• {{ req }}</li>
                  </ul>
                </div>
                <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">Hidden failure cases</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="fail in labItem.hiddenFailureCases" :key="fail" class="text-[11px] text-[#CBD5E1]">• {{ fail }}</li>
                  </ul>
                </div>
              </div>

              <CodeBlock :code="labItem.starterCode" :language="labItem.starterLanguage" />

              <div>
                <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase mb-1">Run instructions</div>
                <CodeBlock :code="labItem.runInstructions.join('\n')" language="bash" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div
                  v-for="testCase in labItem.testCases"
                  :key="testCase.given"
                  class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433] text-[11px]"
                >
                  <div class="font-mono text-[#94A3B8]">GIVEN {{ testCase.given }}</div>
                  <div class="font-mono text-[#22C55E] mt-0.5">EXPECT {{ testCase.expect }}</div>
                </div>
              </div>

              <p class="text-[11px] text-[#64748B]">Verification: {{ labItem.verification }}</p>

              <div class="flex flex-wrap gap-2">
                <Button
                  variant="success"
                  size="sm"
                  :disabled="activeRecord?.codeLabCompletions.includes(labItem.id)"
                  :data-testid="`ms-complete-lab-${labItem.id}`"
                  @click="store.recordMsCodeLab(activeModule.id, labItem.id)"
                >
                  Mark lab implemented
                </Button>
                <Button
                  v-for="(hint, i) in labItem.hints.slice(0, 3)"
                  :key="i"
                  variant="ghost"
                  size="sm"
                  @click="store.recordMsHintUse(activeModule.id)"
                >
                  Hint {{ i + 1 }}
                </Button>
              </div>

              <details v-if="labItem.hints.length > 0" class="text-[11px] text-[#64748B]">
                <summary class="cursor-pointer text-[#38BDF8]">Reveal hints ({{ activeRecord?.hintsUsed ?? 0 }} used)</summary>
                <ol class="mt-1 space-y-0.5 list-decimal list-inside">
                  <li v-for="(hint, i) in labItem.hints" :key="i">{{ hint }}</li>
                </ol>
              </details>
            </div>

            <!-- Benchmark -->
            <div v-if="activeModule.benchmark" class="p-4 rounded-lg border border-[#F59E0B]/30 bg-[#101623] space-y-3" data-testid="ms-benchmark">
              <h3 class="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
                <Play class="w-4 h-4 text-[#F59E0B]" /> Benchmark: {{ activeModule.benchmark.title }}
              </h3>
              <p class="text-[10px] font-mono text-[#F59E0B]">{{ activeModule.benchmark.disclaimer }}</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Baseline</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="line in activeModule.benchmark.baseline" :key="line" class="text-[11px] text-[#CBD5E1] font-mono">• {{ line }}</li>
                  </ul>
                </div>
                <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Measurement protocol</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="line in activeModule.benchmark.measurementProtocol" :key="line" class="text-[11px] text-[#CBD5E1]">• {{ line }}</li>
                  </ul>
                </div>
              </div>
              <div class="p-2.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30">
                <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">False improvement warnings</div>
                <ul class="mt-1 space-y-0.5">
                  <li v-for="line in activeModule.benchmark.falseImprovementWarnings" :key="line" class="text-[11px] text-[#CBD5E1]">• {{ line }}</li>
                </ul>
              </div>
              <div class="space-y-1.5">
                <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Trade-off questions</div>
                <p v-for="q in activeModule.benchmark.tradeoffQuestions" :key="q" class="text-[11px] text-[#CBD5E1]">• {{ q }}</p>
              </div>
              <Button
                variant="success"
                size="sm"
                :disabled="activeRecord?.benchmarksCompleted.includes(activeModule.benchmark.title)"
                data-testid="ms-complete-benchmark"
                @click="store.recordMsBenchmark(activeModule.id, activeModule.benchmark!.title)"
              >
                Record benchmark run
              </Button>
            </div>
          </div>

          <!-- FAILURE LABS -->
          <div v-else-if="activeTab === 'break'" class="space-y-3" data-testid="ms-panel-break">
            <template v-if="labState && activeLab">
              <!-- Graded failure-lab runner: nothing is revealed before a choice -->
              <div class="p-4 rounded-lg border border-[#EF4444]/40 bg-[#101623] space-y-3" data-testid="ms-lab-runner">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-sm font-semibold text-[#F1F5F9]">{{ activeLab.title }}</h3>
                  <Button variant="ghost" size="sm" data-testid="ms-close-lab" @click="closeLab">Close</Button>
                </div>
                <p class="text-[10px] font-mono text-[#F59E0B]">{{ executionMode(activeLab.executionMode) }}</p>

                <div class="p-3 rounded-md bg-[#151D2C] border border-[#EF4444]/30">
                  <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">Bug</div>
                  <p class="text-xs text-[#F1F5F9] mt-1">{{ activeLab.bug }}</p>
                </div>

                <div>
                  <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Observe</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="line in activeLab.observe" :key="line" class="text-[11px] text-[#CBD5E1] font-mono">• {{ line }}</li>
                  </ul>
                </div>

                <!-- STEP 1: hypothesis -->
                <div v-if="labState.step === 'hypothesis'" class="space-y-1.5">
                  <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Hypothesis — commit before investigating</div>
                  <label
                    v-for="(option, i) in activeLab.hypothesisOptions"
                    :key="i"
                    class="flex items-start gap-2 p-2.5 rounded-md border border-[#1B2433] bg-[#0A0E17] cursor-pointer"
                  >
                    <input v-model="labState.hypothesis" type="radio" :value="i" :data-testid="`ms-hypothesis-${i}`" />
                    <span class="text-[11px] text-[#CBD5E1]">{{ option }}</span>
                  </label>
                  <Button variant="primary" size="sm" data-testid="ms-lab-investigate" @click="labState.step = 'rootcause'">
                    Investigate
                  </Button>
                </div>

                <!-- STEP 2: investigate then root cause -->
                <template v-else-if="labState.step === 'rootcause'">
                  <div class="space-y-1.5">
                    <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Investigate</div>
                    <div
                      v-for="(step, i) in activeLab.investigate"
                      :key="i"
                      class="p-2.5 rounded-md bg-[#0A0E17] border border-[#1B2433] space-y-1"
                    >
                      <CodeBlock :code="step.command" language="bash" />
                      <p class="text-[11px] text-[#CBD5E1] font-mono">{{ step.output }}</p>
                      <p class="text-[11px] text-[#22C55E]">{{ step.insight }}</p>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Root cause</div>
                    <label
                      v-for="(option, i) in activeLab.debugOptions"
                      :key="i"
                      class="flex items-start gap-2 p-2.5 rounded-md border border-[#1B2433] bg-[#0A0E17] cursor-pointer"
                    >
                      <input v-model="labState.rootCause" type="radio" :value="i" :data-testid="`ms-rootcause-${i}`" />
                      <span class="text-[11px] text-[#CBD5E1]">{{ option }}</span>
                    </label>
                  </div>
                  <Button variant="primary" size="sm" data-testid="ms-lab-fix" @click="labState.step = 'fix'">
                    Propose fix
                  </Button>
                </template>

                <!-- STEP 3: fix -->
                <div v-else-if="labState.step === 'fix'" class="space-y-1.5">
                  <div class="space-y-1">
                    <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Verify the reproduction is gone</div>
                    <p
                      v-for="(step, i) in activeLab.verify"
                      :key="i"
                      class="text-[11px] text-[#CBD5E1] font-mono"
                    >
                      {{ step.command }} → {{ step.insight }}
                    </p>
                  </div>
                  <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Fix</div>
                  <label
                    v-for="(option, i) in activeLab.fixOptions"
                    :key="i"
                    class="flex items-start gap-2 p-2.5 rounded-md border border-[#1B2433] bg-[#0A0E17] cursor-pointer"
                  >
                    <input v-model="labState.fix" type="radio" :value="i" :data-testid="`ms-fix-${i}`" />
                    <span class="text-[11px] text-[#CBD5E1]">{{ option }}</span>
                  </label>
                  <Button variant="primary" size="sm" data-testid="ms-lab-submit" @click="gradeLab">
                    Grade this fix
                  </Button>
                </div>

                <!-- RESULT -->
                <div v-else class="space-y-2" data-testid="ms-lab-result">
                  <Badge :variant="labState.passed ? 'success' : 'danger'">
                    {{ labState.passed ? 'LAB PASSED — evidence recorded' : 'LAB FAILED — review and retry' }}
                  </Badge>
                  <div v-if="!labState.passed" class="space-y-2">
                    <div class="p-2.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30">
                      <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">Why your hypotheses were rejected</div>
                      <ul class="mt-1 space-y-0.5">
                        <li v-for="(reason, i) in activeLab.hypothesisRejection" :key="i" class="text-[11px] text-[#CBD5E1]">• {{ reason }}</li>
                      </ul>
                    </div>
                    <div class="p-2.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30">
                      <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">Why the fix was rejected</div>
                      <ul class="mt-1 space-y-0.5">
                        <li v-for="(reason, i) in activeLab.fixRejection" :key="i" class="text-[11px] text-[#CBD5E1]">• {{ reason }}</li>
                      </ul>
                    </div>
                  </div>
                  <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                    <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Explain it in your own words first</div>
                    <p class="text-xs text-[#F1F5F9] mt-1">{{ activeLab.explainPrompt }}</p>
                    <Textarea
                      v-model="designNote"
                      class="mt-2"
                      placeholder="Write the explanation before reading the model answer..."
                      data-testid="ms-lab-explain"
                    />
                  </div>
                  <details class="text-[11px] text-[#64748B]">
                    <summary class="cursor-pointer text-[#38BDF8]">Compare with the model explanation</summary>
                    <p class="mt-1 text-[#CBD5E1]">{{ activeLab.modelExplanation }}</p>
                    <p class="mt-1 text-[#64748B]">Related patterns: {{ activeLab.relatedPatterns.join(', ') }}</p>
                  </details>
                  <Button variant="secondary" size="sm" data-testid="ms-lab-finish" @click="closeLab">
                    Finish lab
                  </Button>
                </div>
              </div>
            </template>

            <EmptyState
              v-else-if="activeModule.failureLabs.length === 0"
              :icon="AlertOctagon"
              title="No failure lab in this module"
              description="Nothing to break here — the module's debugging evidence comes from the assessment instead."
            />

            <div v-else class="space-y-2">
              <div
                v-for="labItem in activeModule.failureLabs"
                :key="labItem.id"
                class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2"
                :data-testid="`ms-failure-lab-${labItem.id}`"
              >
                <div class="flex items-start justify-between gap-2 flex-wrap">
                  <h3 class="text-sm font-semibold text-[#F1F5F9]">{{ labItem.title }}</h3>
                  <Badge size="sm" :variant="activeRecord?.failureLabsPassed.includes(labItem.id) ? 'success' : 'outline'">
                    {{ activeRecord?.failureLabsPassed.includes(labItem.id) ? 'PASSED' : `${activeRecord?.failureLabAttempts ?? 0} attempts` }}
                  </Badge>
                </div>
                <p class="text-[11px] text-[#EF4444]">{{ labItem.bug }}</p>
                <p class="text-[10px] font-mono text-[#64748B]">
                  dimension: {{ msDimensionLabel(labItem.dimension) }} · {{ labItem.estimatedMinutes }} min ·
                  {{ executionMode(labItem.executionMode) }}
                </p>
                <Button variant="outline" size="sm" :data-testid="`ms-open-lab-${labItem.id}`" @click="openLab(labItem)">
                  <Wrench class="w-3.5 h-3.5" /> Start failure lab
                </Button>
              </div>
            </div>
          </div>

          <!-- INCIDENTS -->
          <div v-else-if="activeTab === 'incidents'" class="space-y-3" data-testid="ms-panel-incidents">
            <template v-if="triage && activeIncident">
              <div class="p-4 rounded-lg border border-[#EF4444]/40 bg-[#101623] space-y-3" data-testid="ms-triage-runner">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <h3 class="text-sm font-semibold text-[#F1F5F9]">{{ activeIncident.title }}</h3>
                  <div class="flex items-center gap-2">
                    <Badge :variant="activeIncident.severity === 'P0' ? 'danger' : 'warning'" size="sm">
                      {{ activeIncident.severity }}
                    </Badge>
                    <Button variant="ghost" size="sm" data-testid="ms-close-triage" @click="closeTriage">Close</Button>
                  </div>
                </div>
                <p class="text-[11px] font-mono text-[#64748B]">
                  {{ activeIncident.environment }} · module {{ activeIncident.moduleId }} ·
                  {{ executionMode(activeIncident.executionMode) }}
                </p>
                <p class="text-xs text-[#F1F5F9]">{{ activeIncident.symptomSummary }}</p>

                <div class="p-2.5 rounded bg-[#0A0E17] border border-[#F59E0B]/30 text-[10px] font-mono text-[#F59E0B]">
                  {{ executionNote(activeIncident.executionMode) }}
                </div>

                <!-- Step 1: observe alerts -->
                <div v-if="triage.step === 'OBSERVE'" class="space-y-1.5">
                  <div
                    v-if="triage.result && !triage.result.correct"
                    class="p-2.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30 space-y-1"
                    data-testid="ms-incident-failed"
                  >
                    <Badge variant="danger">TRIAGE REJECTED BY THE EVIDENCE — no incident evidence recorded</Badge>
                    <ul class="space-y-0.5">
                      <li v-for="item in triage.result.remaining" :key="item" class="text-[11px] text-[#CBD5E1]">• {{ item }}</li>
                    </ul>
                    <p v-for="line in triage.result.auditTrail" :key="line" class="text-[11px] font-mono text-[#64748B]">{{ line }}</p>
                  </div>
                  <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">Observe — alerts fired</div>
                  <ul class="space-y-0.5">
                    <li v-for="alert in activeIncident.alerts" :key="alert" class="text-[11px] text-[#CBD5E1] font-mono">• {{ alert }}</li>
                  </ul>
                  <Button
                    variant="primary"
                    size="sm"
                    data-testid="ms-triage-hypothesise"
                    @click="triage.result = null; advanceTriage()"
                  >
                    {{ triage.result ? 'Start again from the alerts' : 'Form a hypothesis' }}
                  </Button>
                </div>

                <!-- Step 2: hypothesis + metrics/logs/trace -->
                <template v-else-if="triage.step === 'HYPOTHESIS'">
                  <div class="space-y-1.5">
                    <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Hypothesis</div>
                    <label
                      v-for="(option, i) in activeIncident.hypothesisOptions"
                      :key="i"
                      class="flex items-start gap-2 p-2.5 rounded-md border border-[#1B2433] bg-[#0A0E17] cursor-pointer"
                    >
                      <input v-model="triage.hypothesis" type="radio" :value="i" :data-testid="`ms-incident-hypothesis-${i}`" />
                      <span class="text-[11px] text-[#CBD5E1]">{{ option }}</span>
                    </label>
                  </div>
                  <div class="space-y-1.5">
                    <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Metrics</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div
                        v-for="metric in activeIncident.metrics"
                        :key="metric.name"
                        class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433] text-[11px]"
                      >
                        <div class="font-mono text-[#94A3B8]">{{ metric.name }}: {{ metric.value }} (baseline {{ metric.baseline }})</div>
                        <div class="text-[#CBD5E1] mt-0.5">{{ metric.interpretation }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Logs & trace</div>
                    <CodeBlock :code="[...activeIncident.logs, ...activeIncident.trace].join('\n')" language="text" />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    :disabled="triage.hypothesis === null"
                    data-testid="ms-triage-debug"
                    @click="advanceTriage"
                  >
                    Continue to root cause
                  </Button>
                </template>

                <!-- Step 3: root cause -->
                <div v-else-if="triage.step === 'DEBUG'" class="space-y-1.5">
                  <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Root cause</div>
                  <label
                    v-for="(option, i) in activeIncident.rootCauseOptions"
                    :key="i"
                    class="flex items-start gap-2 p-2.5 rounded-md border border-[#1B2433] bg-[#0A0E17] cursor-pointer"
                  >
                    <input v-model="triage.rootCause" type="radio" :value="i" :data-testid="`ms-incident-rootcause-${i}`" />
                    <span class="text-[11px] text-[#CBD5E1]">{{ option }}</span>
                  </label>
                  <Button
                    variant="primary"
                    size="sm"
                    :disabled="triage.rootCause === null"
                    data-testid="ms-triage-fix"
                    @click="advanceTriage"
                  >
                    Apply fix
                  </Button>
                </div>

                <!-- Step 4: fix -->
                <div v-else-if="triage.step === 'FIX'" class="space-y-1.5">
                  <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Remediation steps</div>
                  <ol class="space-y-0.5 list-decimal list-inside">
                    <li v-for="step in activeIncident.fixSteps" :key="step" class="text-[11px] text-[#CBD5E1] font-mono">{{ step }}</li>
                  </ol>
                  <label class="flex items-center gap-2 text-[11px] text-[#CBD5E1] cursor-pointer">
                    <input v-model="triage.appliedFix" type="checkbox" data-testid="ms-incident-applied-fix" />
                    I applied the fix in my environment and re-ran the verification
                  </label>
                  <Button
                    variant="primary"
                    size="sm"
                    :disabled="!triage.appliedFix"
                    data-testid="ms-triage-verify"
                    @click="advanceTriage"
                  >
                    Verify
                  </Button>
                </div>

                <!-- Step 5: verify -->
                <div v-else-if="triage.step === 'VERIFY'" class="space-y-1.5">
                  <div class="text-[10px] font-mono font-bold text-[#22C55E] uppercase">Verification evidence</div>
                  <ul class="space-y-0.5">
                    <li v-for="line in activeIncident.verification" :key="line" class="text-[11px] text-[#CBD5E1] font-mono">• {{ line }}</li>
                  </ul>
                  <Button variant="primary" size="sm" data-testid="ms-triage-grade" @click="gradeTriage">
                    Grade triage
                  </Button>
                </div>

                <!-- Step 6: postmortem — only reachable when the triage was correct -->
                <div v-else-if="triage.step === 'POSTMORTEM' || triage.step === 'RESOLVED'" class="space-y-2" data-testid="ms-incident-resolved">
                  <Badge :variant="triage.step === 'RESOLVED' ? 'success' : 'warning'">
                    {{ triage.step === 'RESOLVED' ? 'INCIDENT RESOLVED — evidence recorded' : 'TRIAGED — postmortem still owed' }}
                  </Badge>
                  <div class="text-[10px] font-mono font-bold text-[#F59E0B] uppercase">Write your own postmortem first</div>
                  <p class="text-xs text-[#F1F5F9]">{{ activeIncident.explainPrompt }}</p>
                  <Textarea v-model="triage.note" :rows="5" placeholder="Impact / Detection / Root cause / Resolution / Prevention..." data-testid="ms-postmortem-note" />
                  <p class="text-[10px] font-mono text-[#64748B]">
                    {{ triage.note.trim().length }} characters · 80 required before the incident is fully closed
                  </p>
                  <Button
                    variant="success"
                    size="sm"
                    data-testid="ms-postmortem-submit"
                    @click="finishPostmortem"
                  >
                    Record postmortem
                  </Button>
                  <div v-if="triage.result" class="space-y-0.5">
                    <div class="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Triage audit trail</div>
                    <p v-for="line in triage.result.auditTrail" :key="line" class="text-[11px] font-mono text-[#64748B]">{{ line }}</p>
                  </div>
                  <details class="text-[11px] text-[#64748B]">
                    <summary class="cursor-pointer text-[#38BDF8]">Reference postmortem</summary>
                    <dl class="mt-1 space-y-1">
                      <div v-for="(value, key) in activeIncident.postmortem" :key="key">
                        <dt class="font-mono text-[#94A3B8] uppercase text-[10px]">{{ key }}</dt>
                        <dd class="text-[#CBD5E1]">{{ value }}</dd>
                      </div>
                    </dl>
                  </details>
                  <div class="space-y-0.5">
                    <div class="text-[10px] font-mono font-bold text-[#F59E0B] uppercase">Defense questions</div>
                    <p v-for="q in activeIncident.defenseQuestions" :key="q" class="text-[11px] text-[#CBD5E1]">• {{ q }}</p>
                  </div>
                  <Button variant="secondary" size="sm" data-testid="ms-triage-finish" @click="closeTriage">
                    Close postmortem
                  </Button>
                </div>

                <!-- Failed triage: honest failure, no fake progress -->
                <div v-else class="space-y-2" data-testid="ms-incident-failed">
                  <Badge variant="danger">TRIAGE REJECTED BY THE EVIDENCE — no incident evidence recorded</Badge>
                  <ul v-if="triage.result" class="space-y-0.5">
                    <li v-for="item in triage.result.remaining" :key="item" class="text-[11px] text-[#CBD5E1]">• {{ item }}</li>
                  </ul>
                  <div v-if="triage.result" class="space-y-0.5">
                    <p v-for="line in triage.result.auditTrail" :key="line" class="text-[11px] font-mono text-[#64748B]">{{ line }}</p>
                  </div>
                  <p class="text-[11px] text-[#CBD5E1]">
                    An unresolved incident is a real state, not a failure to hide. Re-run the triage from the alerts.
                  </p>
                  <Button variant="outline" size="sm" data-testid="ms-triage-retry" @click="openTriage(activeIncident)">
                    Retry triage
                  </Button>
                </div>
              </div>
            </template>

            <EmptyState
              v-else-if="moduleIncidents.length === 0"
              :icon="Activity"
              title="No incident for this module"
              description="Production incidents are attached to the module that can actually explain them."
            />

            <div v-else class="space-y-2">
              <div
                v-for="incident in moduleIncidents"
                :key="incident.id"
                class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2"
                :data-testid="`ms-incident-${incident.id}`"
              >
                <div class="flex items-start justify-between gap-2 flex-wrap">
                  <h3 class="text-sm font-semibold text-[#F1F5F9]">{{ incident.title }}</h3>
                  <div class="flex items-center gap-2">
                    <Badge :variant="incident.severity === 'P0' ? 'danger' : 'warning'" size="sm">{{ incident.severity }}</Badge>
                    <Badge size="sm" :variant="isIncidentResolved(incident.id) ? 'success' : 'outline'">
                      {{ isIncidentResolved(incident.id) ? 'RESOLVED' : 'OPEN' }}
                    </Badge>
                  </div>
                </div>
                <p class="text-[11px] text-[#94A3B8]">{{ incident.symptomSummary }}</p>
                <p class="text-[10px] font-mono text-[#64748B]">
                  {{ incident.environment }} · {{ executionMode(incident.executionMode) }}
                </p>
                <Button variant="outline" size="sm" :data-testid="`ms-open-incident-${incident.id}`" @click="openTriage(incident)">
                  <AlertOctagon class="w-3.5 h-3.5" /> Triage incident
                </Button>
              </div>
            </div>

            <!-- Cross-module open incident ledger -->
            <div class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2">
              <h3 class="text-sm font-semibold text-[#F1F5F9]">All open incidents</h3>
              <div
                v-for="incident in openIncidentsBySeverity"
                :key="incident.id"
                class="flex items-center justify-between gap-2 p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]"
              >
                <div class="min-w-0">
                  <div class="text-[11px] text-[#F1F5F9] truncate">{{ incident.title }}</div>
                  <div class="text-[10px] font-mono text-[#64748B]">{{ incidentModuleTitle(incident.moduleId) }} · {{ incident.severity }}</div>
                </div>
                <Button variant="ghost" size="sm" @click="selectModule(incident.moduleId, 'incidents')">Open</Button>
              </div>
              <p v-if="store.msOpenIncidents.length === 0" class="text-[11px] text-[#22C55E]">
                No open incidents — every triage has recorded evidence.
              </p>
            </div>
          </div>

          <!-- DESIGN -->
          <div v-else-if="activeTab === 'design'" class="space-y-3" data-testid="ms-panel-design">
            <EmptyState
              v-if="!activeModule.architectureChallenge"
              :icon="GitBranch"
              title="No architecture challenge in this module"
              description="Design evidence for this module comes from the incident and defense stages."
            />
            <div v-else class="p-4 rounded-lg border border-[#38BDF8]/30 bg-[#101623] space-y-3">
              <h3 class="text-sm font-semibold text-[#F1F5F9]">{{ activeModule.architectureChallenge.title }}</h3>
              <p class="text-xs text-[#CBD5E1] leading-relaxed">{{ activeModule.architectureChallenge.scenario }}</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <div class="text-[10px] font-mono font-bold text-[#38BDF8] uppercase">Requirements</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="req in activeModule.architectureChallenge.requirements" :key="req" class="text-[11px] text-[#CBD5E1]">• {{ req }}</li>
                  </ul>
                </div>
                <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <div class="text-[10px] font-mono font-bold text-[#F59E0B] uppercase">Constraints</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="c in activeModule.architectureChallenge.constraints" :key="c" class="text-[11px] text-[#CBD5E1]">• {{ c }}</li>
                  </ul>
                </div>
              </div>
              <div class="p-2.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30">
                <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">Failure modes to design for</div>
                <ul class="mt-1 space-y-0.5">
                  <li v-for="mode in activeModule.architectureChallenge.failureModes" :key="mode" class="text-[11px] text-[#CBD5E1]">• {{ mode }}</li>
                </ul>
              </div>
              <div>
                <div class="text-[10px] font-mono font-bold text-[#22C55E] uppercase mb-1">Deliverables</div>
                <ul class="space-y-0.5">
                  <li v-for="d in activeModule.architectureChallenge.deliverables" :key="d" class="text-[11px] text-[#CBD5E1]">• {{ d }}</li>
                </ul>
              </div>
              <Textarea
                v-model="designNote"
                placeholder="Design it yourself here before opening the model answers..."
                data-testid="ms-design-note"
              />
              <details class="text-[11px] text-[#64748B]">
                <summary class="cursor-pointer text-[#38BDF8]">Trade-off questions & model answers</summary>
                <div v-for="tq in activeModule.architectureChallenge.tradeoffQuestions" :key="tq.question" class="mt-2">
                  <p class="text-[#F1F5F9] font-medium">{{ tq.question }}</p>
                  <p class="text-[#CBD5E1] mt-0.5">{{ tq.modelAnswer }}</p>
                </div>
              </details>
              <Button
                variant="success"
                size="sm"
                :disabled="activeRecord?.designsCompleted.includes(activeModule.architectureChallenge.id)"
                data-testid="ms-submit-design"
                @click="submitDesign"
              >
                Record design submitted
              </Button>
            </div>
          </div>

          <!-- ASSESS -->
          <div v-else-if="activeTab === 'assess'" class="space-y-3" data-testid="ms-panel-assess">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="text-[11px] font-mono text-[#64748B]">
                Pass standard: ≥{{ MS_PASS_THRESHOLD_PERCENT }}% — grading is deterministic, no partial credit invented.
              </p>
              <Button v-if="assessed" variant="ghost" size="sm" data-testid="ms-reset-assess" @click="resetAssessment">
                Retry
              </Button>
            </div>

            <div
              v-for="(question, qIndex) in activeModule.assessment as MsAssessmentQuestion[]"
              :key="question.id"
              class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2"
              :data-testid="`ms-question-${question.id}`"
            >
              <div class="flex items-center gap-2">
                <Badge size="sm" variant="outline">{{ question.type }}</Badge>
                <span class="text-[10px] font-mono text-[#64748B]">Q{{ qIndex + 1 }}/{{ activeModule.assessment.length }}</span>
              </div>
              <p class="text-xs text-[#F1F5F9] font-medium">{{ question.prompt }}</p>
              <CodeBlock v-if="question.codeSnippet" :code="question.codeSnippet" language="java" />
              <label
                v-for="(option, oIndex) in question.options"
                :key="oIndex"
                class="flex items-start gap-2 p-2 rounded-md border border-[#1B2433] bg-[#0A0E17] cursor-pointer"
                :class="
                  assessed && oIndex === question.correctIndex
                    ? 'border-[#22C55E]/50 bg-[#22C55E]/10'
                    : assessed && answers[qIndex] === oIndex
                    ? 'border-[#EF4444]/50 bg-[#EF4444]/10'
                    : ''
                "
              >
                <input
                  v-model="answers[qIndex]"
                  type="radio"
                  :value="oIndex"
                  :name="question.id"
                  :disabled="assessed"
                  :data-testid="`ms-answer-${question.id}-${oIndex}`"
                />
                <span class="text-[11px] text-[#CBD5E1]">{{ option }}</span>
              </label>
              <p v-if="assessed" class="text-[11px] text-[#94A3B8]">{{ question.explanation }}</p>
            </div>

            <div v-if="assessmentResult" class="p-4 rounded-lg border border-[#1B2433] bg-[#151D2C] space-y-1" data-testid="ms-assessment-result">
              <Badge :variant="assessmentResult.passed ? 'success' : 'danger'">
                {{ assessmentResult.scorePercent }}% — {{ assessmentResult.passed ? 'PASS' : 'FAIL' }}
              </Badge>
              <p class="text-[11px] text-[#94A3B8]">
                {{ assessmentResult.correctCount }}/{{ assessmentResult.total }} correct.
                {{ assessmentResult.weakQuestionIds.length }} weak question(s) to re-drill.
              </p>
            </div>

            <Button
              variant="primary"
              :disabled="assessed"
              data-testid="ms-submit-assessment"
              @click="submitAssessment"
            >
              Submit assessment
            </Button>
          </div>

          <!-- DEFEND -->
          <div v-else-if="activeTab === 'defend'" class="space-y-3" data-testid="ms-panel-defend">
            <div
              v-for="question in activeModule.defenseQuestions"
              :key="question.id"
              class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2"
              :data-testid="`ms-defense-${question.id}`"
            >
              <div class="flex items-center gap-2">
                <Badge size="sm" variant="purple">{{ msDimensionLabel(question.dimension) }}</Badge>
              </div>
              <p class="text-xs text-[#F1F5F9] font-medium">{{ question.question }}</p>
              <Textarea
                v-model="defenseNote"
                placeholder="Answer out loud first, then write it..."
                data-testid="ms-defense-answer"
              />
              <div class="flex flex-wrap gap-1.5 items-center">
                <span class="text-[10px] font-mono text-[#64748B]">Self-score against rubric:</span>
                <button
                  v-for="score in [0, 25, 50, 75, 100]"
                  :key="score"
                  type="button"
                  class="px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ui-transition"
                  :class="
                    defenseScores[question.id] === score
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40'
                      : 'bg-[#151D2C] text-[#94A3B8] border-[#1B2433]'
                  "
                  :data-testid="`ms-defense-score-${score}`"
                  @click="scoreDefense(question.id, score)"
                >
                  {{ score }}
                </button>
              </div>
              <details class="text-[11px] text-[#64748B]">
                <summary class="cursor-pointer text-[#38BDF8]">Rubric & model answer</summary>
                <ul class="mt-1 space-y-0.5">
                  <li v-for="r in question.rubric" :key="r" class="text-[#CBD5E1]">• {{ r }}</li>
                </ul>
                <p class="mt-1 text-[#CBD5E1]">{{ question.modelAnswer }}</p>
              </details>
            </div>

            <div class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2">
              <h3 class="text-sm font-semibold text-[#F1F5F9]">60-second explanation</h3>
              <p class="text-xs text-[#CBD5E1]">{{ activeModule.english.sixtySecondExplanation }}</p>
              <div class="flex flex-wrap gap-1.5 items-center">
                <span class="text-[10px] font-mono text-[#64748B]">EXPLAIN self-score:</span>
                <Button
                  v-for="score in [0, 50, 100]"
                  :key="score"
                  variant="secondary"
                  size="sm"
                  :data-testid="`ms-explain-score-${score}`"
                  @click="scoreExplanation(score)"
                >
                  {{ score }}
                </Button>
              </div>
            </div>
          </div>

          <!-- AI REVIEW -->
          <div v-else class="space-y-3" data-testid="ms-panel-ai">
            <div class="p-4 rounded-lg border border-[#A855F7]/30 bg-[#101623] space-y-3">
              <h3 class="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
                <Sparkles class="w-4 h-4 text-[#A855F7]" /> Ask an AI, then verify it
              </h3>
              <p class="text-[11px] font-mono text-[#F59E0B]">
                The suggestion below is written to be plausible and imperfect. Copying it without verification is the failure mode this stage trains.
              </p>
              <CodeBlock :code="activeModule.aiReview.prompt" language="text" />
              <div class="p-3 rounded-md bg-[#151D2C] border border-[#1B2433] space-y-1">
                <div class="text-[10px] font-mono font-bold text-[#A855F7] uppercase">AI's initial answer (verify before trusting)</div>
                <p class="text-xs text-[#CBD5E1]">{{ activeModule.aiReview.aiSuggestion }}</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <div class="text-[10px] font-mono font-bold text-[#EF4444] uppercase">Risks to check</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="risk in activeModule.aiReview.risksToCheck" :key="risk" class="text-[11px] text-[#CBD5E1]">• {{ risk }}</li>
                  </ul>
                </div>
                <div class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]">
                  <div class="text-[10px] font-mono font-bold text-[#22C55E] uppercase">Verification steps</div>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="step in activeModule.aiReview.verificationSteps" :key="step" class="text-[11px] text-[#CBD5E1]">• {{ step }}</li>
                  </ul>
                </div>
              </div>
              <div class="p-2.5 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/30">
                <div class="text-[10px] font-mono font-bold text-[#22C55E] uppercase">Defended outcome</div>
                <p class="text-[11px] text-[#CBD5E1]">{{ activeModule.aiReview.correctOutcome }}</p>
              </div>
              <Button
                variant="success"
                size="sm"
                :disabled="activeRecord?.aiChallengesCompleted.includes(activeModule.aiReview.prompt)"
                data-testid="ms-ai-verified"
                @click="store.recordMsAiChallenge(activeModule.id, activeModule.aiReview.prompt)"
              >
                I verified and corrected the suggestion
              </Button>
            </div>

            <div class="p-4 rounded-lg border border-[#1B2433] bg-[#101623] space-y-2">
              <h3 class="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
                <ShieldCheck class="w-4 h-4 text-[#38BDF8]" /> Incident response language
              </h3>
              <div
                v-for="line in activeModule.english.incidentCommunication"
                :key="line.situation"
                class="p-2.5 rounded-md bg-[#151D2C] border border-[#1B2433]"
              >
                <div class="text-[10px] font-mono text-[#F59E0B] uppercase">{{ line.situation }}</div>
                <p class="text-[11px] text-[#CBD5E1] mt-1 font-mono">{{ line.message }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Resolved incident ledger -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-4 space-y-2">
      <h2 class="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
        <Award class="w-4 h-4 text-[#22C55E]" /> Incident evidence
      </h2>
      <p class="text-[11px] font-mono text-[#64748B]">
        {{ store.msTrackProgress.incidentsResolved }} incident(s) resolved with recorded evidence.
      </p>
      <ul class="space-y-1">
        <li
          v-for="record in Object.values(store.msProgress).filter((r) => r.incidentsResolved.length > 0)"
          :key="record.moduleId"
          class="text-[11px] text-[#CBD5E1] font-mono"
        >
          {{ record.moduleId }} — {{ record.incidentsResolved.join(', ') }}
        </li>
      </ul>
      <p v-if="Object.keys(store.msProgress).length === 0" class="text-[11px] text-[#64748B]">
        No evidence recorded yet.
      </p>
    </div>
  </div>
</template>