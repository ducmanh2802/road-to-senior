<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Activity,
  Zap,
  ArrowRight,
  Flame,
  Clock,
  CheckCircle2,
  Repeat,
  Binary,
  FolderGit2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import StatCard from '../components/StatCard.vue';
import ProgressBar from '../components/ProgressBar.vue';
import LoadingSkeleton from '../components/LoadingSkeleton.vue';
import ErrorState from '../components/ErrorState.vue';
import EmptyState from '../components/EmptyState.vue';

const router = useRouter();
const store = useLearningStore();

function formatStudyTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function navigate(to: string): void {
  router.push(to);
}

const taskCompletionPct = computed(() =>
  store.totalTasksCount > 0
    ? Math.round((store.completedTasksCount / store.totalTasksCount) * 100)
    : 0
);
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- 1. LOADING STATE -->
    <div v-if="store.status === 'loading'" class="space-y-6" data-testid="dashboard-loading">
      <div class="ui-panel p-6">
        <LoadingSkeleton variant="rect" height="120px" />
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div v-for="i in 6" :key="i" class="ui-panel p-4">
          <LoadingSkeleton variant="text" :rows="3" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 ui-panel p-6">
          <LoadingSkeleton variant="rect" height="240px" />
        </div>
        <div class="space-y-4">
          <div class="ui-panel p-6">
            <LoadingSkeleton variant="rect" height="110px" />
          </div>
          <div class="ui-panel p-6">
            <LoadingSkeleton variant="rect" height="110px" />
          </div>
        </div>
      </div>
    </div>

    <!-- 2. ERROR STATE -->
    <div v-else-if="store.status === 'error'" class="py-12">
      <ErrorState
        :message="store.errorMessage ?? 'An error occurred loading the Command Center.'"
        :detail="store.errorDetail"
        retry-label="Reload State"
        @retry="store.loadFromStorage"
      />
    </div>

    <!-- 3. EMPTY STATE -->
    <div v-else-if="store.status === 'empty'" class="py-12">
      <EmptyState
        title="No learning data found"
        description="No curriculum or learning progress found in local storage. Start your 180-day journey by loading initial content."
        action-label="Load Demo Data"
        @action="store.resetToDemo"
      />
    </div>

    <!-- 4. SUCCESS / MAIN DASHBOARD -->
    <div v-else class="space-y-6" data-testid="command-center-content">
      <!-- 5-Second System Status Card -->
      <section class="ui-panel p-5 border-[#1E293B]" aria-labelledby="system-status-heading">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
              <Activity class="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
              <span id="system-status-heading">5-SECOND SYSTEM STATUS</span>
              <span class="inline-flex items-center rounded border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#38BDF8]">
                Phase 2: Spring Boot 3 & Microservices
              </span>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
              DAY {{ store.currentDay.toString().padStart(2, '0') }} · {{ store.daysRemaining }} Days Remaining
            </h1>
            <p class="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              Today's core target: <span class="text-[#F8FAFC] font-medium">CompletableFuture Asynchronous Pipelines & @Transactional Pitfalls</span>.
            </p>
          </div>

          <!-- Recommended Next Action Box -->
          <div class="lg:w-80 w-full bg-[#0B0E14] border border-[#1E293B] rounded-lg p-3.5 flex flex-col justify-between shrink-0">
            <div class="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span class="uppercase font-semibold text-[#38BDF8] flex items-center gap-1">
                <Zap class="w-3 h-3 text-[#38BDF8]" aria-hidden="true" />
                RECOMMENDED ACTION
              </span>
              <span class="text-[#94A3B8]">PRIORITY #1</span>
            </div>
            <div class="text-xs font-semibold text-[#F8FAFC] mt-1.5 truncate" data-testid="next-action-title">
              {{ store.nextAction.title }}
            </div>
            <div class="text-[11px] text-[#94A3B8] mt-0.5 truncate">
              {{ store.nextAction.description }}
            </div>
            <button
              type="button"
              class="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#38BDF8] text-[#0B0E14] text-xs font-semibold hover:bg-[#0EA5E9] focus-ring transition-colors cursor-pointer"
              data-testid="next-action-button"
              @click="navigate(store.nextAction.targetRoute)"
            >
              <span>{{ store.nextAction.actionLabel }}</span>
              <ArrowRight class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <!-- Engineering Signal Metrics -->
      <section aria-label="Engineering Signal Metrics">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="STREAK"
            :value="store.streak"
            sub-value="days"
            :icon="Flame"
            icon-color="text-[#F59E0B]"
            icon-bg="bg-[#F59E0B]/10 border-[#F59E0B]/30"
            :trend="{ value: 'Active flow', direction: 'up' }"
            data-testid="stat-streak"
          />

          <StatCard
            label="TIME TODAY"
            :value="formatStudyTime(store.studyTimeMinutes)"
            :icon="Clock"
            icon-color="text-[#38BDF8]"
            icon-bg="bg-[#38BDF8]/10 border-[#38BDF8]/30"
            :trend="{ value: 'Hands-on focus', direction: 'neutral' }"
            data-testid="stat-time"
          />

          <StatCard
            label="DAILY TASKS"
            :value="`${store.completedTasksCount} / ${store.totalTasksCount}`"
            :icon="CheckCircle2"
            icon-color="text-[#22C55E]"
            icon-bg="bg-[#22C55E]/10 border-[#22C55E]/30"
            :trend="{
              value: `${taskCompletionPct}% done`,
              direction: store.completedTasksCount === store.totalTasksCount && store.totalTasksCount > 0 ? 'up' : 'neutral',
            }"
            data-testid="stat-tasks"
          />

          <StatCard
            label="REVIEWS DUE"
            :value="store.dueReviewsCount"
            sub-value="cards"
            :icon="Repeat"
            icon-color="text-[#F59E0B]"
            icon-bg="bg-[#F59E0B]/10 border-[#F59E0B]/30"
            :trend="{
              value: 'Spaced recall',
              direction: store.dueReviewsCount > 0 ? 'down' : 'up',
            }"
            interactive
            data-testid="stat-reviews"
            @click="navigate('/review')"
          />

          <StatCard
            label="DSA MASTERED"
            :value="store.masteredDsaCount"
            :sub-value="`/ ${store.solvedDsaCount}`"
            :icon="Binary"
            icon-color="text-[#38BDF8]"
            icon-bg="bg-[#38BDF8]/10 border-[#38BDF8]/30"
            :trend="{ value: 'Pattern recall', direction: 'up' }"
            interactive
            data-testid="stat-dsa"
            @click="navigate('/learning')"
          />

          <StatCard
            label="PROJECT"
            :value="`${store.projectProgressPercent}%`"
            :icon="FolderGit2"
            icon-color="text-[#22C55E]"
            icon-bg="bg-[#22C55E]/10 border-[#22C55E]/30"
            :trend="{ value: '7 Services', direction: 'up' }"
            interactive
            data-testid="stat-project"
            @click="navigate('/build/projects')"
          />
        </div>
      </section>

      <!-- Main Grid: Competency Readiness + Weakest Area / Incidents -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2 Cols: Competency Readiness Model -->
        <section class="lg:col-span-2 ui-panel p-5" aria-labelledby="competency-model-heading">
          <div class="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[#1E293B]">
            <div>
              <h2 id="competency-model-heading" class="text-sm sm:text-base font-semibold text-[#F8FAFC] tracking-tight flex items-center gap-2">
                <ShieldCheck class="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
                <span>Senior Competency Readiness Model</span>
              </h2>
              <p class="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                Evaluated across 6 dimensions: Theory, Hands-on, Active Recall, Explanation, Debugging & Interview.
              </p>
            </div>
            <span class="inline-flex items-center rounded border border-[#1E293B] bg-[#0B0E14] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#64748B]">
              REAL SIGNALS
            </span>
          </div>

          <div class="space-y-3.5 mt-4" data-testid="competency-list">
            <div
              v-for="comp in store.competencies"
              :key="comp.name"
              class="bg-[#0B0E14] border border-[#1E293B] rounded-lg p-3.5"
              data-testid="competency-item"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-semibold text-[#F8FAFC] tracking-wide">
                    {{ comp.name }}
                  </span>
                  <span
                    class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-medium"
                    :class="{
                      'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30': comp.level === 'Senior Ready',
                      'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30': comp.level === 'Advanced',
                      'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30': comp.level === 'Competent',
                      'bg-[#151B28] text-[#94A3B8] border border-[#1E293B]': comp.level === 'Novice',
                    }"
                  >
                    {{ comp.level }}
                  </span>
                </div>

                <div class="flex items-center gap-3 text-xs font-mono">
                  <span class="text-[#94A3B8]">
                    Weakest: <span class="text-[#F59E0B] capitalize font-medium">{{ comp.weakestDimension }}</span>
                  </span>
                  <span class="text-[#38BDF8] font-bold">{{ comp.score }}%</span>
                </div>
              </div>

              <ProgressBar
                :value="comp.score"
                :variant="comp.score >= 80 ? 'success' : comp.score >= 60 ? 'primary' : 'warning'"
                size="sm"
                :label="`${comp.name} readiness`"
              />
            </div>
          </div>
        </section>

        <!-- Right 1 Col: Weakest Area Alert & Incident Quick Launch -->
        <div class="space-y-4">
          <!-- Weakest Dimension Radar Callout -->
          <section
            v-if="store.weakest"
            class="ui-panel p-5 border-[#F59E0B]/40 bg-[#111622]"
            aria-labelledby="weakest-dimension-heading"
            data-testid="weakest-dimension-card"
          >
            <div class="flex items-center gap-2 text-xs font-mono font-semibold text-[#F59E0B] uppercase mb-2">
              <AlertTriangle class="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              <span id="weakest-dimension-heading">IDENTIFIED WEAKEST DIMENSION</span>
            </div>
            <h3 class="text-sm font-bold text-[#F8FAFC]">
              {{ store.weakest.topicTitle }}
            </h3>
            <div class="mt-2 text-xs text-[#94A3B8] leading-relaxed">
              Dimension: <span class="text-[#F59E0B] font-mono uppercase font-bold">{{ store.weakest.dimension }}</span> ({{ store.weakest.score }}/5).
              <p class="mt-1 text-[#E5E7EB]">
                {{ store.weakest.action }}
              </p>
            </div>

            <button
              type="button"
              class="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-[#1E293B] bg-[#151B28] text-xs font-semibold text-[#F8FAFC] hover:bg-[#1E293B] focus-ring transition-colors cursor-pointer"
              data-testid="drill-weak-button"
              @click="navigate('/learning')"
            >
              <span>Drill Weak Dimension</span>
              <ArrowRight class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </section>

          <!-- Incident Lab Chaos Quick Box -->
          <section class="ui-panel p-5 border-[#EF4444]/30" aria-labelledby="incident-lab-heading">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2 text-xs font-mono font-semibold text-[#EF4444] uppercase">
                <Flame class="w-4 h-4 text-[#EF4444]" aria-hidden="true" />
                <span id="incident-lab-heading">INCIDENT LAB</span>
              </div>
              <span class="inline-flex items-center rounded border border-[#EF4444]/30 bg-[#EF4444]/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#EF4444]">
                CHAOS READY
              </span>
            </div>
            <div class="text-xs font-semibold text-[#F8FAFC]">
              Break The System Scenarios
            </div>
            <p class="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Practice root cause analysis for HikariCP pool exhaustion, Kafka rebalance storms, and memory leaks.
            </p>
            <button
              type="button"
              class="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#EF4444] text-white text-xs font-semibold hover:bg-[#DC2626] focus-ring transition-colors cursor-pointer"
              data-testid="launch-incident-button"
              @click="navigate('/build/break-debug')"
            >
              <span>Launch Incident Lab</span>
              <ArrowRight class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
