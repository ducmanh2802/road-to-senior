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
  Lock,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Sparkles,
  Zap,
  Activity,
  Trophy,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-vue-next';
import PageHeader from '../components/PageHeader.vue';
import CodeBlock from '../components/ui/CodeBlock.vue';
import ProgressBar from '../components/ProgressBar.vue';
import JavaCoreAssessment from '../components/JavaCoreAssessment.vue';
import JavaFailureLab from '../components/JavaFailureLab.vue';
import {
  CANONICAL_JAVA_VERSION,
  JAVA_VERSION_METADATA,
} from '../../data/canonicalStandards';
import {
  JAVA_CORE_MODULES_METADATA,
  MODULE_1_1_CONTENT,
  MODULE_1_2_CONTENT,
  MODULE_1_3_CONTENT,
  type JavaCoreModuleMetadata,
  type JavaCorePillar,
  type EngineeringLoopStage,
  type ModuleContent,
} from '../../data/javaCoreCurriculum';
import { useLearningStore } from '../stores/learning';

const learningStore = useLearningStore();

// Pillar Tab Filter: 'all' | 'language' | 'jvm' | 'concurrency'
const selectedPillar = ref<JavaCorePillar | 'all'>('all');

// Currently Selected Module ID (defaults to '1.1')
const selectedModuleId = ref('1.1');

// 11-Stage Engineering Loop:
// LEARN -> BUILD -> BREAK -> OBSERVE -> DEBUG -> FIX -> BENCHMARK -> DESIGN -> EXPLAIN -> DEFEND -> ASSESS
const activeStage = ref<EngineeringLoopStage>('learn');

const stages: { id: EngineeringLoopStage; label: string; icon: typeof BookOpen }[] = [
  { id: 'learn', label: '1. LEARN', icon: BookOpen },
  { id: 'build', label: '2. BUILD', icon: Code2 },
  { id: 'break', label: '3. BREAK', icon: Bug },
  { id: 'observe', label: '4. OBSERVE', icon: Terminal },
  { id: 'debug', label: '5. DEBUG', icon: AlertTriangle },
  { id: 'fix', label: '6. FIX', icon: ShieldCheck },
  { id: 'benchmark', label: '7. BENCHMARK', icon: Zap },
  { id: 'design', label: '8. DESIGN', icon: Layers },
  { id: 'explain', label: '9. EXPLAIN', icon: Mic },
  { id: 'defend', label: '10. DEFEND', icon: ShieldAlert },
  { id: 'assess', label: '11. ASSESS', icon: Award },
];

const modules = ref<JavaCoreModuleMetadata[]>(JAVA_CORE_MODULES_METADATA);

const filteredModules = computed(() => {
  if (selectedPillar.value === 'all') return modules.value;
  return modules.value.filter((m) => m.pillar === selectedPillar.value);
});

const currentModule = computed(() => {
  return modules.value.find((m) => m.id === selectedModuleId.value) || modules.value[0];
});

// Map active content for implemented modules
const activeModuleContent = computed<ModuleContent | null>(() => {
  if (selectedModuleId.value === '1.1') return MODULE_1_1_CONTENT;
  if (selectedModuleId.value === '1.2') return MODULE_1_2_CONTENT;
  if (selectedModuleId.value === '1.3') return MODULE_1_3_CONTENT;
  return null;
});

// Track failure lab completion state in session and learning store
const isFailureLabCompleted = computed(() => {
  const completedStages = learningStore.getModuleStagesCompleted(selectedModuleId.value);
  return completedStages.includes('break');
});

function markStageCompleted(stage: EngineeringLoopStage) {
  learningStore.recordJavaModuleStage(selectedModuleId.value, stage);
}

function handleFailureLabCompleted() {
  markStageCompleted('break');
  markStageCompleted('observe');
  markStageCompleted('fix');
}

function handleAssessmentCompleted(_score: number, passed: boolean) {
  if (passed) {
    markStageCompleted('assess');
  }
}

function selectModule(mod: JavaCoreModuleMetadata) {
  if (mod.status === 'LOCKED') return;
  selectedModuleId.value = mod.id;
  activeStage.value = 'learn';
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12" data-testid="learning-java-page">
    <!-- Header -->
    <PageHeader
      title="Java Core Curriculum (P0)"
      description="The definitive technical mastery curriculum for Senior Java Engineers: Language Evolution, JVM Internals, and Modern Concurrency."
    >
      <template #actions>
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
          data-testid="java-version-badge"
        >
          <Coffee class="w-3.5 h-3.5" />
          {{ CANONICAL_JAVA_VERSION }} LTS
        </span>
      </template>
    </PageHeader>

    <!-- Runtime Standards Compliance Banner -->
    <section
      class="rounded-xl border border-[#1E293B] bg-[#111622] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
      aria-label="Runtime Compliance"
      data-testid="runtime-standards"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-bold">
            Target Platform Standard:
          </span>
          <span class="text-xs font-mono text-[#F8FAFC]">
            {{ JAVA_VERSION_METADATA.runtimeTarget }}
          </span>
        </div>
        <p class="text-xs text-[#94A3B8]">
          Curriculum is locked to LTS release standards with Zero-Mock engineering rigor.
        </p>
      </div>

      <div class="flex items-center gap-4 text-xs font-mono">
        <div class="flex items-center gap-1.5 text-[#22C55E]">
          <CheckCircle2 class="w-4 h-4" />
          <span>{{ JAVA_VERSION_METADATA.supportPolicy }}</span>
        </div>
        <div class="px-2 py-1 rounded bg-[#0B0E14] text-[#94A3B8] border border-[#1E293B]">
          11-Stage Engineering Loop
        </div>
      </div>
    </section>

    <!-- Pillar Tabs -->
    <section class="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Curriculum Pillars">
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-lg text-xs font-mono border ui-transition cursor-pointer"
        :class="selectedPillar === 'all' ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8] font-bold' : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'"
        data-testid="pillar-tab-all"
        @click="selectedPillar = 'all'"
      >
        ALL PILLARS (20)
      </button>
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-lg text-xs font-mono border ui-transition cursor-pointer"
        :class="selectedPillar === 'language' ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8] font-bold' : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'"
        data-testid="pillar-tab-language"
        @click="selectedPillar = 'language'"
      >
        PILLAR 1: LANGUAGE (7)
      </button>
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-lg text-xs font-mono border ui-transition cursor-pointer"
        :class="selectedPillar === 'jvm' ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8] font-bold' : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'"
        data-testid="pillar-tab-jvm"
        @click="selectedPillar = 'jvm'"
      >
        PILLAR 2: JVM (6)
      </button>
      <button
        type="button"
        class="px-3.5 py-1.5 rounded-lg text-xs font-mono border ui-transition cursor-pointer"
        :class="selectedPillar === 'concurrency' ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8] font-bold' : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'"
        data-testid="pillar-tab-concurrency"
        @click="selectedPillar = 'concurrency'"
      >
        PILLAR 3: CONCURRENCY (7)
      </button>
    </section>

    <!-- Module Selector Carousel / Grid -->
    <section class="rounded-lg border border-[#1B2433] bg-[#101623] p-3 space-y-2" aria-label="Java Core Roadmap Modules">
      <div class="flex items-center justify-between text-xs font-mono px-1">
        <span class="text-[#94A3B8] uppercase">P0 Curriculum Roadmap</span>
        <span class="text-[11px] text-[#38BDF8]">
          Active: {{ currentModule.number }} — {{ currentModule.title }}
        </span>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Java Modules">
        <button
          v-for="mod in filteredModules"
          :key="mod.id"
          type="button"
          role="tab"
          :aria-selected="selectedModuleId === mod.id"
          :disabled="mod.status === 'LOCKED'"
          class="px-3 py-1.5 rounded-md ui-transition whitespace-nowrap text-xs font-mono border flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          :class="[
            selectedModuleId === mod.id
              ? 'bg-[#151D2C] text-[#38BDF8] border-[#38BDF8]/40 font-semibold'
              : mod.status === 'LOCKED'
              ? 'bg-[#0A0E17] text-[#64748B] border-[#1B2433]'
              : 'bg-[#151D2C] text-[#94A3B8] border-[#1B2433] hover:border-[#38BDF8]/30 hover:text-[#F1F5F9]',
          ]"
          :data-testid="`module-tab-${mod.id}`"
          @click="selectModule(mod)"
        >
          <Lock v-if="mod.status === 'LOCKED'" class="w-3 h-3 text-[#64748B]" />
          <CheckCircle2 v-else-if="learningStore.isJavaModuleCompleted(mod.id)" class="w-3 h-3 text-[#22C55E]" />
          <span class="font-semibold">{{ mod.number }}</span>
          <span>{{ mod.title }}</span>
          <span
            v-if="mod.status === 'LOCKED'"
            class="text-[9px] px-1 py-0.2 rounded bg-[#1B2433] text-[#64748B]"
          >
            LOCKED
          </span>
        </button>
      </div>
    </section>

    <!-- If Module is Active & Implemented (1.1, 1.2): Full 11-Stage Interactive Loop -->
    <div v-if="activeModuleContent" class="space-y-6" :data-testid="`module-${currentModule.id.replace('.', '-')}-content`">
      <!-- 11-Stage Senior Engineering Loop Navigation Bar -->
      <section class="rounded-lg border border-[#1B2433] bg-[#0A0E17] p-1.5 overflow-x-auto" aria-label="Learning Loop Stages">
        <div class="flex items-center gap-1 min-w-max" role="tablist" aria-label="11 Learning Stages">
          <button
            v-for="stage in stages"
            :key="stage.id"
            type="button"
            role="tab"
            :aria-selected="activeStage === stage.id"
            class="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-mono text-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            :class="[
              activeStage === stage.id
                ? 'bg-[#38BDF8] text-[#0A0E17] font-semibold'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151D2C]',
            ]"
            :data-testid="`stage-tab-${stage.id}`"
            @click="activeStage = stage.id"
          >
            <component :is="stage.icon" class="w-3.5 h-3.5" aria-hidden="true" />
            <span>{{ stage.label }}</span>
          </button>
        </div>
      </section>

      <!-- Main Stage Content Area -->
      <main
        class="rounded-lg border border-[#1B2433] bg-[#101623] p-6 space-y-6 min-h-[460px]"
        role="tabpanel"
        data-testid="stage-content-panel"
      >
        <!-- STAGE 1: LEARN -->
        <div v-if="activeStage === 'learn'" class="space-y-5" data-testid="stage-learn">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider">
              <BookOpen class="w-4 h-4" />
              <span>THEORY: {{ activeModuleContent.metadata.title }}</span>
            </div>
            <span class="text-xs font-mono text-[#94A3B8]">{{ activeModuleContent.learn.versionNotes }}</span>
          </div>

          <p class="text-sm text-[#CBD5E1] leading-relaxed font-sans">
            {{ activeModuleContent.learn.overview }}
          </p>

          <!-- Module 1.1 Specific Distinction -->
          <div v-if="activeModuleContent.learn.immutabilityDistinctions" class="p-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 space-y-2">
            <div class="flex items-center gap-2 text-xs font-mono font-bold text-[#F59E0B] uppercase">
              <AlertTriangle class="w-4 h-4" />
              <span>CRITICAL SENIOR DISTINCTION: SHALLOW VS DEEP IMMUTABILITY</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#CBD5E1]">
              <div class="p-3 bg-[#0B0E14] rounded-lg border border-[#1E293B]">
                <strong class="text-[#F8FAFC] block mb-1">Shallow Immutability (Record Guarantee):</strong>
                {{ activeModuleContent.learn.immutabilityDistinctions.shallow }}
              </div>
              <div class="p-3 bg-[#0B0E14] rounded-lg border border-[#1E293B]">
                <strong class="text-[#F8FAFC] block mb-1">Deep Immutability (Requires Design):</strong>
                {{ activeModuleContent.learn.immutabilityDistinctions.deep }}
              </div>
            </div>
            <p class="text-xs text-[#F59E0B] font-mono pt-1">
              ⚠️ {{ activeModuleContent.learn.immutabilityDistinctions.references }}
            </p>
          </div>

          <!-- Module 1.2 Specific Distinction -->
          <div v-if="activeModuleContent.learn.domainModelDistinctions" class="p-4 rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 space-y-2">
            <div class="flex items-center gap-2 text-xs font-mono font-bold text-[#38BDF8] uppercase">
              <ShieldCheck class="w-4 h-4" />
              <span>CLOSED HIERARCHIES & COMPILER-VERIFIED EXHAUSTIVENESS</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#CBD5E1]">
              <div class="p-3 bg-[#0B0E14] rounded-lg border border-[#1E293B]">
                <strong class="text-[#F8FAFC] block mb-1">Open Polymorphic Hierarchies:</strong>
                {{ activeModuleContent.learn.domainModelDistinctions.openHierarchy }}
              </div>
              <div class="p-3 bg-[#0B0E14] rounded-lg border border-[#1E293B]">
                <strong class="text-[#F8FAFC] block mb-1">Closed Algebraic Sum Types:</strong>
                {{ activeModuleContent.learn.domainModelDistinctions.closedHierarchy }}
              </div>
            </div>
            <p class="text-xs text-[#38BDF8] font-mono pt-1">
              💡 {{ activeModuleContent.learn.domainModelDistinctions.patternExhaustiveness }}
            </p>
          </div>

          <!-- Module 1.3 Specific Distinction -->
          <div v-if="activeModuleContent.learn.patternMatchingDistinctions" class="p-4 rounded-xl border border-[#A855F7]/30 bg-[#A855F7]/10 space-y-2">
            <div class="flex items-center gap-2 text-xs font-mono font-bold text-[#C084FC] uppercase">
              <Zap class="w-4 h-4" />
              <span>PATTERN MATCHING, RECORD DECONSTRUCTION & WHEN GUARDS</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#CBD5E1]">
              <div class="p-3 bg-[#0B0E14] rounded-lg border border-[#1E293B]">
                <strong class="text-[#F8FAFC] block mb-1">Type Pattern Matching:</strong>
                {{ activeModuleContent.learn.patternMatchingDistinctions.typePattern }}
              </div>
              <div class="p-3 bg-[#0B0E14] rounded-lg border border-[#1E293B]">
                <strong class="text-[#F8FAFC] block mb-1">Record Deconstruction:</strong>
                {{ activeModuleContent.learn.patternMatchingDistinctions.recordPattern }}
              </div>
              <div class="p-3 bg-[#0B0E14] rounded-lg border border-[#1E293B]">
                <strong class="text-[#F8FAFC] block mb-1">Guarded When Clauses:</strong>
                {{ activeModuleContent.learn.patternMatchingDistinctions.whenGuards }}
              </div>
              <div class="p-3 bg-[#0B0E14] rounded-lg border border-[#1E293B]">
                <strong class="text-[#F8FAFC] block mb-1">Null-Safe Switch Branches:</strong>
                {{ activeModuleContent.learn.patternMatchingDistinctions.nullHandling }}
              </div>
            </div>
          </div>

          <!-- Key Points Grid -->
          <div class="space-y-2">
            <h4 class="text-xs font-mono text-[#22C55E] uppercase font-bold tracking-wider">
              LANGUAGE SPECIFICATION GUARANTEES:
            </h4>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#94A3B8]">
              <li
                v-for="(point, i) in activeModuleContent.learn.keyPoints"
                :key="i"
                class="flex items-start gap-2 p-2.5 bg-[#151B28] rounded-lg border border-[#1E293B]"
              >
                <CheckCircle2 class="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                <span>{{ point }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- STAGE 2: BUILD -->
        <div v-if="activeStage === 'build'" class="space-y-4" data-testid="stage-build">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase font-bold">
              <Code2 class="w-4 h-4" />
              <span>BUILD LAB: {{ activeModuleContent.buildLab.title }}</span>
            </div>
            <span class="text-xs font-mono text-[#94A3B8]">{{ activeModuleContent.buildLab.filename }}</span>
          </div>

          <p class="text-xs text-[#CBD5E1]">
            {{ activeModuleContent.buildLab.description }}
          </p>

          <CodeBlock
            :code="activeModuleContent.buildLab.code"
            language="java"
            :filename="activeModuleContent.buildLab.filename"
            :title="activeModuleContent.buildLab.filename"
            :show-line-numbers="true"
          />

          <div class="p-4 bg-[#151B28] rounded-xl border border-[#1E293B] space-y-2">
            <div class="text-xs font-mono text-[#38BDF8] uppercase font-bold">
              Architectural Invariants & Guarantees:
            </div>
            <ul class="list-disc list-inside space-y-1 text-xs text-[#94A3B8]">
              <li v-for="(note, i) in activeModuleContent.buildLab.architecturalNotes" :key="i">{{ note }}</li>
            </ul>
          </div>
        </div>

        <!-- STAGE 3: BREAK -->
        <div v-if="activeStage === 'break'" class="space-y-4" data-testid="stage-break">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2 text-xs font-mono text-[#EF4444] uppercase font-bold">
              <Bug class="w-4 h-4" />
              <span>BREAK LAB: {{ activeModuleContent.breakLab.title }}</span>
            </div>
            <span class="text-xs font-mono text-[#94A3B8]">{{ activeModuleContent.breakLab.filename }}</span>
          </div>

          <div class="p-4 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 space-y-1 text-xs">
            <div class="font-bold text-[#EF4444] uppercase font-mono">Failure Mode:</div>
            <p class="text-[#F8FAFC] leading-relaxed">{{ activeModuleContent.breakLab.hazard }}</p>
          </div>

          <CodeBlock
            :code="activeModuleContent.breakLab.vulnerableCode"
            language="java"
            :filename="activeModuleContent.breakLab.filename"
            :title="activeModuleContent.breakLab.filename"
            :show-line-numbers="true"
          />

          <!-- Interactive Failure Lab Simulator -->
          <JavaFailureLab :module-id="selectedModuleId" @completed="handleFailureLabCompleted" />
        </div>

        <!-- STAGE 4: OBSERVE -->
        <div v-if="activeStage === 'observe'" class="space-y-4" data-testid="stage-observe">
          <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider border-b border-[#1E293B] pb-3">
            <Terminal class="w-4 h-4" />
            <span>OBSERVE & REPRODUCE: STEP-BY-STEP TRACE</span>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in activeModuleContent.observeDebug.steps"
              :key="item.step"
              class="p-4 rounded-xl border border-[#1E293B] bg-[#151B28] space-y-2"
            >
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-[#38BDF8] font-bold">STEP {{ item.step }}: {{ item.instruction }}</span>
              </div>
              <div class="text-xs text-[#CBD5E1] bg-[#0B0E14] p-3 rounded border border-[#1E293B] font-sans">
                <span class="text-[#22C55E] font-mono block mb-1">System Observation:</span>
                {{ item.expectedObservation }}
              </div>
              <div v-if="item.codeSnippet" class="p-2 bg-[#111622] rounded text-[11px] font-mono text-[#38BDF8]">
                <code>{{ item.codeSnippet }}</code>
              </div>
            </div>
          </div>
        </div>

        <!-- STAGE 5: DEBUG -->
        <div v-if="activeStage === 'debug'" class="space-y-4" data-testid="stage-debug">
          <div class="flex items-center gap-2 text-xs font-mono text-[#F59E0B] uppercase font-bold tracking-wider border-b border-[#1E293B] pb-3">
            <AlertTriangle class="w-4 h-4" />
            <span>DEBUG: ROOT CAUSE ANALYSIS</span>
          </div>

          <div class="p-5 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 space-y-2">
            <div class="text-xs font-mono font-bold text-[#F59E0B] uppercase">Root Cause Explanation:</div>
            <p class="text-xs text-[#CBD5E1] leading-relaxed font-sans">
              {{ activeModuleContent.observeDebug.debugInvestigation }}
            </p>
          </div>
        </div>

        <!-- STAGE 6: FIX -->
        <div v-if="activeStage === 'fix'" class="space-y-4" data-testid="stage-fix">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2 text-xs font-mono text-[#22C55E] uppercase font-bold">
              <ShieldCheck class="w-4 h-4" />
              <span>FIX LAB: {{ activeModuleContent.fixLab.title }}</span>
            </div>
            <span class="text-xs font-mono text-[#94A3B8]">{{ activeModuleContent.fixLab.filename }}</span>
          </div>

          <p class="text-xs text-[#CBD5E1]">
            {{ activeModuleContent.fixLab.remediation }}
          </p>

          <CodeBlock
            :code="activeModuleContent.fixLab.fixedCode"
            language="java"
            :filename="activeModuleContent.fixLab.filename"
            :title="activeModuleContent.fixLab.filename"
            :show-line-numbers="true"
          />

          <div class="p-4 bg-[#151B28] rounded-xl border border-[#1E293B] space-y-2">
            <div class="text-xs font-mono text-[#22C55E] uppercase font-bold">
              Engineering Remediation Nuances:
            </div>
            <ul class="list-disc list-inside space-y-1 text-xs text-[#94A3B8]">
              <li v-for="(nuance, i) in activeModuleContent.fixLab.copyOfNuances" :key="i">{{ nuance }}</li>
            </ul>
          </div>
        </div>

        <!-- STAGE 7: BENCHMARK -->
        <div v-if="activeStage === 'benchmark'" class="space-y-4" data-testid="stage-benchmark">
          <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider border-b border-[#1E293B] pb-3">
            <Zap class="w-4 h-4" />
            <span>BENCHMARK & JVM RUNTIME OPTIMIZATIONS</span>
          </div>

          <div class="p-4 rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-xs text-[#CBD5E1] space-y-1">
            <div class="text-[#38BDF8] font-mono font-bold uppercase">Engineering Rigor Notice:</div>
            <p>{{ activeModuleContent.benchmark.disclaimer }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div
              v-for="(point, i) in activeModuleContent.benchmark.points"
              :key="i"
              class="p-4 bg-[#151B28] rounded-xl border border-[#1E293B] text-xs space-y-1"
            >
              <span class="text-[#38BDF8] font-mono font-bold uppercase block">Optimization Fact {{ i + 1 }}</span>
              <p class="text-[#94A3B8] leading-relaxed">{{ point }}</p>
            </div>
          </div>
        </div>

        <!-- STAGE 8: DESIGN -->
        <div v-if="activeStage === 'design'" class="space-y-4" data-testid="stage-design">
          <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider border-b border-[#1E293B] pb-3">
            <Layers class="w-4 h-4" />
            <span>SENIOR DESIGN CHALLENGE: {{ activeModuleContent.design.title }}</span>
          </div>

          <div class="p-4 bg-[#151B28] rounded-xl border border-[#1E293B] space-y-2 text-xs">
            <div class="font-bold text-[#F8FAFC]">Scenario:</div>
            <p class="text-[#94A3B8]">{{ activeModuleContent.design.scenario }}</p>
          </div>

          <CodeBlock
            :code="activeModuleContent.design.sampleDesignCode"
            language="java"
            filename="DomainDesignModel.java"
            title="DomainDesignModel.java"
            :show-line-numbers="true"
          />

          <div class="space-y-3 pt-2">
            <div
              v-for="(qa, i) in activeModuleContent.design.architecturalQuestions"
              :key="i"
              class="p-4 rounded-xl border border-[#1E293B] bg-[#151B28] space-y-1.5 text-xs"
            >
              <div class="font-bold text-[#38BDF8]">Q{{ i + 1 }}: {{ qa.question }}</div>
              <p class="text-[#CBD5E1] leading-relaxed">{{ qa.answer }}</p>
            </div>
          </div>
        </div>

        <!-- STAGE 9: EXPLAIN (60s) -->
        <div v-if="activeStage === 'explain'" class="space-y-4" data-testid="stage-explain">
          <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider border-b border-[#1E293B] pb-3">
            <Mic class="w-4 h-4" />
            <span>60-SECOND EXECUTIVE EXPLANATION DRILL</span>
          </div>

          <div class="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
            <div class="text-xs font-mono text-[#38BDF8] uppercase font-bold">Prompt:</div>
            <h4 class="text-sm font-semibold text-[#F8FAFC]">
              "{{ activeModuleContent.explain60s.prompt }}"
            </h4>
          </div>

          <div class="p-5 bg-[#0B0E14] border border-[#38BDF8]/30 rounded-xl space-y-2">
            <div class="text-xs font-mono text-[#22C55E] uppercase font-bold">
              Staff Engineer Blueprint Answer (Practice out loud):
            </div>
            <p class="text-xs text-[#CBD5E1] leading-relaxed font-sans italic">
              "{{ activeModuleContent.explain60s.script }}"
            </p>
          </div>
        </div>

        <!-- STAGE 10: DEFEND -->
        <div v-if="activeStage === 'defend'" class="space-y-4" data-testid="stage-defend">
          <div class="flex items-center gap-2 text-xs font-mono text-[#F43F5E] uppercase font-bold tracking-wider border-b border-[#1E293B] pb-3">
            <ShieldAlert class="w-4 h-4" />
            <span>STAFF ENGINEER ARCHITECTURAL DEFENSE DRILLS</span>
          </div>

          <div class="space-y-3">
            <div
              v-for="(item, i) in activeModuleContent.staffDefense.questions"
              :key="i"
              class="p-4 rounded-xl border border-[#1E293B] bg-[#151B28] space-y-2 text-xs"
            >
              <div class="font-bold text-[#F8FAFC]">
                <span class="text-[#F43F5E] font-mono mr-1">Q{{ i + 1 }}:</span>
                {{ item.q }}
              </div>
              <p class="text-[#CBD5E1] leading-relaxed bg-[#0B0E14] p-3 rounded border border-[#1E293B]">
                <span class="text-[#22C55E] font-mono block mb-1">Defense Rationale:</span>
                {{ item.defense }}
              </p>
            </div>
          </div>
        </div>

        <!-- STAGE 11: ASSESS -->
        <div v-if="activeStage === 'assess'" class="space-y-4" data-testid="stage-assess">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2 text-xs font-mono text-[#22C55E] uppercase font-bold tracking-wider">
              <Award class="w-4 h-4" />
              <span>DETERMINISTIC KNOWLEDGE ASSESSMENT ({{ activeModuleContent.assessment.length }} QUESTIONS)</span>
            </div>
            <div class="text-xs font-mono text-[#94A3B8]">
              Status:
              <span :class="learningStore.isJavaModuleCompleted(selectedModuleId) ? 'text-[#22C55E] font-bold' : 'text-[#F59E0B]'">
                {{ learningStore.isJavaModuleCompleted(selectedModuleId) ? 'PASSED' : 'NOT PASSED' }}
              </span>
            </div>
          </div>

          <!-- Assessment Component -->
          <JavaCoreAssessment
            :module-id="selectedModuleId"
            :questions="activeModuleContent.assessment"
            :failure-lab-completed="isFailureLabCompleted"
            @completed="handleAssessmentCompleted"
          />
        </div>
      </main>
    </div>

    <!-- If Module is Locked (1.3 to 3.7) -->
    <div v-else class="p-8 rounded-xl border border-[#1E293B] bg-[#111622] text-center space-y-4" data-testid="module-locked-view">
      <div class="w-12 h-12 rounded-full mx-auto bg-[#1E293B] flex items-center justify-center text-[#64748B]">
        <Lock class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-bold text-[#F8FAFC]">
          {{ currentModule.number }} — {{ currentModule.title }}
        </h3>
        <p class="text-xs text-[#94A3B8] font-mono">
          Status: LOCKED / NOT_STARTED (Roadmap Specification Only)
        </p>
      </div>
      <p class="text-xs text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
        {{ currentModule.learningObjective }}
      </p>
      <div class="pt-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-[#38BDF8] text-[#020617] text-xs font-mono font-bold hover:bg-[#38BDF8]/90 cursor-pointer"
          @click="selectedModuleId = '1.1'"
        >
          RETURN TO ACTIVE MODULE 1.1
        </button>
      </div>
    </div>
  </div>
</template>
