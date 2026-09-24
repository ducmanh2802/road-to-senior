<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
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

/**
 * Hero context comes from the real roadmap data for the active day — never a
 * hard-coded phase/theme string.
 */
const activeRoadmapDay = computed(
  () => store.roadmapDays.find((d) => d.dayNumber === store.currentDay) ?? null
);
const currentPhaseName = computed(() => activeRoadmapDay.value?.phaseName ?? 'Senior Java 180');
const activeDayTheme = computed(() => activeRoadmapDay.value?.theme ?? null);
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
      <!-- Today's status: one hero surface = orientation + single next action -->
      <section class="ui-panel p-5" aria-labelledby="command-center-heading">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div class="space-y-2 min-w-0">
            <span class="block text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
              {{ currentPhaseName }}
            </span>
            <h1
              id="command-center-heading"
              class="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight"
            >
              DAY {{ store.currentDay.toString().padStart(2, '0') }} · {{ store.daysRemaining }} Days Remaining
            </h1>
            <p v-if="activeDayTheme" class="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              Today's focus:
              <span class="text-[#F1F5F9] font-medium">{{ activeDayTheme }}</span>
            </p>
          </div>

          <!-- Recommended Next Action -->
          <div class="lg:w-80 w-full bg-[#0A0E17] border border-[#1B2433] rounded-lg p-3.5 shrink-0">
            <div class="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-[#38BDF8] uppercase tracking-wider">
              <Zap class="w-3 h-3" aria-hidden="true" />
              <span>Recommended action</span>
            </div>
            <div class="text-xs font-semibold text-[#F1F5F9] mt-1.5 truncate" data-testid="next-action-title">
              {{ store.nextAction.title }}
            </div>
            <div class="text-[11px] text-[#94A3B8] mt-0.5 truncate">
              {{ store.nextAction.description }}
            </div>
            <button
              type="button"
              class="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#38BDF8] text-[#0A0E17] text-xs font-semibold hover:bg-[#0284C7] focus-ring transition-colors cursor-pointer"
              data-testid="next-action-button"
              @click="navigate(store.nextAction.targetRoute)"
            >
              <span>{{ store.nextAction.actionLabel }}</span>
              <ArrowRight class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <!-- Engineering signal metrics: only counts derived from stored data -->
      <section aria-label="Engineering signal metrics">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="STREAK"
            :value="store.streak"
            sub-value="days"
            :icon="Flame"
            icon-color="text-[#F59E0B]"
            icon-bg="bg-[#F59E0B]/10 border-[#F59E0B]/30"
            data-testid="stat-streak"
          />

          <StatCard
            label="TIME TODAY"
            :value="formatStudyTime(store.studyTimeMinutes)"
            :icon="Clock"
            icon-color="text-[#38BDF8]"
            icon-bg="bg-[#38BDF8]/10 border-[#38BDF8]/30"
            data-testid="stat-time"
          />

          <StatCard
            label="TASKS DONE"
            :value="`${store.completedTasksCount} / ${store.totalTasksCount}`"
            :sub-value="`${taskCompletionPct}%`"
            :icon="CheckCircle2"
            icon-color="text-[#22C55E]"
            icon-bg="bg-[#22C55E]/10 border-[#22C55E]/30"
            data-testid="stat-tasks"
          />

          <StatCard
            label="REVIEWS DUE"
            :value="store.dueReviewsCount"
            sub-value="cards"
            :icon="Repeat"
            icon-color="text-[#F59E0B]"
            icon-bg="bg-[#F59E0B]/10 border-[#F59E0B]/30"
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
            interactive
            data-testid="stat-project"
            @click="navigate('/build/projects')"
          />
        </div>
      </section>

      <!-- Main grid: competency readiness (primary) + weak spot / incident lab (secondary) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2 cols: competency readiness -->
        <section class="lg:col-span-2 ui-panel p-5" aria-labelledby="competency-model-heading">
          <div class="pb-3 border-b border-[#1B2433]">
            <h2
              id="competency-model-heading"
              class="text-sm sm:text-base font-semibold text-[#F1F5F9] tracking-tight flex items-center gap-2"
            >
              <ShieldCheck class="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
              <span>Senior Competency Readiness Model</span>
            </h2>
            <p class="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
              Measured across 6 dimensions: Theory, Hands-on, Active Recall, Explanation, Debugging and Interview.
            </p>
          </div>

          <div class="divide-y divide-[#1B2433]" data-testid="competency-list">
            <div
              v-for="comp in store.competencies"
              :key="comp.name"
              class="py-3 last:pb-0"
              data-testid="competency-item"
            >
              <div class="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-xs font-mono font-semibold text-[#F1F5F9] tracking-wide truncate">
                    {{ comp.name }}
                  </span>
                  <span
                    class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-medium border"
                    :class="{
                      'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30': comp.level === 'Senior Ready',
                      'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30': comp.level === 'Advanced',
                      'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30': comp.level === 'Competent',
                      'bg-[#151D2C] text-[#94A3B8] border-[#1B2433]': comp.level === 'Novice',
                    }"
                  >
                    {{ comp.level }}
                  </span>
                </div>

                <div class="flex items-center gap-3 text-xs font-mono shrink-0">
                  <span class="text-[#64748B]">
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

        <!-- Right column: weak spot + incident lab -->
        <div class="space-y-6">
          <!-- Weakest dimension -->
          <section
            v-if="store.weakest"
            class="ui-panel p-5"
            aria-labelledby="weakest-dimension-heading"
            data-testid="weakest-dimension-card"
          >
            <div class="flex items-center gap-2 text-[11px] font-mono font-semibold text-[#F59E0B] uppercase tracking-wider">
              <AlertTriangle class="w-3.5 h-3.5" aria-hidden="true" />
              <span id="weakest-dimension-heading">Weakest dimension</span>
            </div>
            <h3 class="text-sm font-bold text-[#F1F5F9] mt-1.5">
              {{ store.weakest.topicTitle }}
            </h3>
            <p class="mt-2 text-xs text-[#94A3B8] leading-relaxed">
              Scored {{ store.weakest.score }}/5 on
              <span class="text-[#F59E0B] font-mono uppercase font-medium">{{ store.weakest.dimension }}</span>.
            </p>
            <p class="mt-1.5 text-xs text-[#94A3B8] leading-relaxed">
              {{ store.weakest.action }}
            </p>

            <button
              type="button"
              class="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-[#1B2433] bg-[#151D2C] text-xs font-semibold text-[#F1F5F9] hover:border-[#334155] hover:bg-[#1A2436] focus-ring transition-colors cursor-pointer"
              data-testid="drill-weak-button"
              @click="navigate('/learning')"
            >
              <span>Drill weakest dimension</span>
              <ArrowRight class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </section>

          <!-- Incident lab -->
          <section class="ui-panel p-5" aria-labelledby="incident-lab-heading">
            <div class="flex items-center gap-2 text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider">
              <Flame class="w-3.5 h-3.5 text-[#EF4444]" aria-hidden="true" />
              <span id="incident-lab-heading">Incident lab</span>
            </div>
            <h3 class="text-sm font-bold text-[#F1F5F9] mt-1.5">
              Break-the-system scenarios
            </h3>
            <p class="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Practise root cause analysis for connection-pool exhaustion, consumer rebalance storms and memory leaks.
            </p>
            <button
              type="button"
              class="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#EF4444] text-white text-xs font-semibold hover:bg-[#DC2626] focus-ring transition-colors cursor-pointer"
              data-testid="launch-incident-button"
              @click="navigate('/build/break-debug')"
            >
              <span>Open incident lab</span>
              <ArrowRight class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
