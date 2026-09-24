<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';
import EmptyState from '../components/EmptyState.vue';
import {
  Coffee,
  Leaf,
  Layers,
  Cpu,
  Binary,
  Award,
  Search,
  X,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
} from 'lucide-vue-next';

interface PhaseMeta {
  number: number;
  name: string;
  range: string;
  icon: typeof Coffee;
  desc: string;
}

const phases: PhaseMeta[] = [
  {
    number: 1,
    name: 'Phase 1: Core Java & Concurrency',
    range: 'Days 1–30',
    icon: Coffee,
    desc: 'OOP, JVM Memory, GC, volatile, CompletableFuture, Virtual Threads & Performance',
  },
  {
    number: 2,
    name: 'Phase 2: Spring Boot 3 Deep Dive',
    range: 'Days 31–60',
    icon: Leaf,
    desc: 'IoC, AOP Proxies, @Transactional, Security 6, JPA N+1, Testcontainers & Observability',
  },
  {
    number: 3,
    name: 'Phase 3: Microservices & Event-Driven',
    range: 'Days 61–100',
    icon: Layers,
    desc: 'Kafka Partitioning, Consumer Groups, Outbox Pattern, Saga Orchestrator & Redlock',
  },
  {
    number: 4,
    name: 'Phase 4: System Design at Scale',
    range: 'Days 101–125',
    icon: Cpu,
    desc: 'CAP Theorem, Sharding, Consistent Hashing, Rate Limiting & High-Availability',
  },
  {
    number: 5,
    name: 'Phase 5: DSA Patterns & Speed',
    range: 'Days 126–150',
    icon: Binary,
    desc: 'Sliding Window, Monotonic Stack, Graphs, Topological Sort & Hard DP',
  },
  {
    number: 6,
    name: 'Phase 6: Senior Interview Mastery',
    range: 'Days 151–180',
    icon: Award,
    desc: 'Live System Design, Incident Triaging, Concurrency Grilling, Behavioral STAR & Mock Screens',
  },
];

const store = useLearningStore();
const router = useRouter();

const selectedPhase = ref<number>(0); // 0 = all
const searchQuery = ref<string>('');
const selectedDayDetail = ref<number | null>(store.currentDay || 37);

const filteredDays = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return store.roadmapDays.filter((d) => {
    const matchesPhase = selectedPhase.value === 0 || d.phaseNumber === selectedPhase.value;
    if (!matchesPhase) return false;
    if (!query) return true;
    return (
      d.theme.toLowerCase().includes(query) ||
      d.coreConcepts.some((c) => c.toLowerCase().includes(query)) ||
      d.dayNumber.toString() === query
    );
  });
});

const activeDayObj = computed(() => {
  if (selectedDayDetail.value !== null) {
    const found = store.roadmapDays.find((d) => d.dayNumber === selectedDayDetail.value);
    if (found) return found;
  }
  return store.roadmapDays.find((d) => d.dayNumber === store.currentDay) || store.roadmapDays[0];
});

function selectPhase(phaseNumber: number): void {
  selectedPhase.value = phaseNumber;
}

function selectDay(dayNumber: number): void {
  selectedDayDetail.value = dayNumber;
}

function resetFilters(): void {
  searchQuery.value = '';
  selectedPhase.value = 0;
}

function handleSetCurrentDay(dayNumber: number): void {
  store.setCurrentDay(dayNumber);
  void router.push('/today');
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12" data-testid="roadmap-page">
    <!-- Canonical Page Header -->
    <PageHeader
      title="180-Day Architect Curriculum"
      description="6 structured phases designed to build deep runtime mastery, distributed consistency, and senior engineering rigor."
    >
      <template #actions>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <!-- Active Day Badge -->
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 shrink-0"
            data-testid="current-day-badge"
          >
            <span class="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span>Day {{ store.currentDay }} of 180 Active</span>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#64748B]">
              <Search class="w-3.5 h-3.5" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search concepts or day..."
              class="w-full pl-8 pr-7 py-1.5 bg-[#151B28] border border-[#1E293B] rounded-md text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-none transition-colors"
              data-testid="search-input"
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
        </div>
      </template>
    </PageHeader>

    <!-- Phase Filter Bar -->
    <div class="bg-[#101623] border border-[#1B2433] rounded-lg p-3">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        <button
          type="button"
          data-testid="phase-filter-0"
          :class="[
            'p-2.5 rounded-md text-left border transition-all text-xs font-mono cursor-pointer',
            selectedPhase === 0
              ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 font-semibold shadow-sm'
              : 'bg-[#151D2C] text-[#94A3B8] border-[#1B2433] hover:border-[#334155] hover:text-[#F1F5F9]',
          ]"
          @click="selectPhase(0)"
        >
          <div class="font-bold">ALL PHASES</div>
          <div class="text-[10px] text-[#64748B]">180 Days</div>
        </button>

        <button
          v-for="p in phases"
          :key="p.number"
          type="button"
          :data-testid="`phase-filter-${p.number}`"
          :class="[
            'p-2.5 rounded-md text-left border transition-all text-xs font-mono cursor-pointer',
            selectedPhase === p.number
              ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 font-semibold shadow-sm'
              : 'bg-[#151D2C] text-[#94A3B8] border-[#1B2433] hover:border-[#334155] hover:text-[#F1F5F9]',
          ]"
          @click="selectPhase(p.number)"
        >
          <div class="flex items-center gap-1.5 truncate">
            <component :is="p.icon" class="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span class="truncate font-bold">P{{ p.number }}</span>
          </div>
          <div class="text-[10px] text-[#64748B] truncate">{{ p.range }}</div>
        </button>
      </div>
    </div>

    <!-- Main Roadmap Split View: List on Left, Day Detail Drawer on Right -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Timeline list of days -->
      <div class="lg:col-span-2 space-y-3">
        <EmptyState
          v-if="filteredDays.length === 0"
          :icon="Search"
          title="No days match filter"
          description="No curriculum days found for this search or phase filter. Try resetting your query."
          action-label="Reset Search & Phase"
          data-testid="empty-days"
          @action="resetFilters"
        />

        <div
          v-for="day in filteredDays"
          :key="day.dayNumber"
          :data-testid="`day-card-${day.dayNumber}`"
          :class="[
            'cursor-pointer rounded-lg p-4 transition-all border select-none',
            day.dayNumber === store.currentDay
              ? 'bg-[#101623] border-[#38BDF8]/60 ring-1 ring-[#38BDF8]/30 shadow-md'
              : day.dayNumber === selectedDayDetail
              ? 'bg-[#101623] border-[#38BDF8]/40 shadow-sm'
              : 'bg-[#101623] border-[#1B2433] hover:border-[#334155]',
          ]"
          @click="selectDay(day.dayNumber)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <div class="pt-0.5 shrink-0">
                <CheckCircle2
                  v-if="day.completed || day.dayNumber < store.currentDay"
                  class="w-5 h-5 text-[#22C55E]"
                  data-testid="status-completed"
                />
                <div
                  v-else-if="day.dayNumber === store.currentDay"
                  class="w-5 h-5 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8] flex items-center justify-center text-[10px] font-mono font-bold text-[#38BDF8]"
                  data-testid="status-active"
                >
                  {{ day.dayNumber }}
                </div>
                <Circle
                  v-else
                  class="w-5 h-5 text-[#64748B]"
                  data-testid="status-pending"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1.5 text-[10px] font-mono text-[#64748B]">
                  <span>DAY {{ String(day.dayNumber).padStart(2, '0') }}</span>
                  <span class="text-[#334155]" aria-hidden="true">·</span>
                  <span class="truncate">{{ day.phaseName }}</span>
                  <span v-if="day.dayNumber === store.currentDay" class="text-[#38BDF8]">Current</span>
                  <span v-else-if="day.completed" class="text-[#22C55E]">Completed</span>
                </div>

                <h3 class="text-sm font-semibold text-[#F1F5F9] leading-snug">
                  {{ day.theme }}
                </h3>

                <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-[#64748B]">
                  <span v-for="(concept, idx) in day.coreConcepts" :key="idx">
                    {{ concept }}
                  </span>
                </div>
              </div>
            </div>

            <div class="self-center shrink-0 text-[#64748B]">
              <ChevronRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Deep Day Blueprint Drawer -->
      <div v-if="activeDayObj" class="lg:sticky lg:top-20 space-y-4 h-fit">
        <div
          class="p-5 space-y-4 bg-[#111622] border border-[#38BDF8]/30 rounded-lg shadow-lg"
          data-testid="day-detail-drawer"
        >
          <div class="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div>
              <span class="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                DAY {{ activeDayObj.dayNumber }} SPECIFICATION
              </span>
              <div class="text-xs font-mono text-[#94A3B8] mt-1.5">
                {{ activeDayObj.phaseName }}
              </div>
            </div>
            <span
              v-if="activeDayObj.dayNumber === store.currentDay"
              class="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              Active Today
            </span>
          </div>

          <h2 class="text-base font-bold text-[#F8FAFC] leading-snug">
            {{ activeDayObj.theme }}
          </h2>

          <!-- Blueprint Modules -->
          <div class="space-y-2.5 font-mono text-xs">
            <div class="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
              <div class="text-[10px] text-[#22C55E] uppercase font-bold tracking-wider">
                HANDS-ON GOAL
              </div>
              <p class="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                {{ activeDayObj.handsOnGoal }}
              </p>
            </div>

            <div class="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
              <div class="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider">
                DSA PATTERN
              </div>
              <p class="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                {{ activeDayObj.dsaFocus }}
              </p>
            </div>

            <div v-if="activeDayObj.systemDesignFocus" class="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
              <div class="text-[10px] text-[#F59E0B] uppercase font-bold tracking-wider">
                SYSTEM DESIGN
              </div>
              <p class="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                {{ activeDayObj.systemDesignFocus }}
              </p>
            </div>

            <div v-if="activeDayObj.englishFocus" class="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
              <div class="text-[10px] text-[#60A5FA] uppercase font-bold tracking-wider">
                TECHNICAL ENGLISH
              </div>
              <p class="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                {{ activeDayObj.englishFocus }}
              </p>
            </div>

            <div v-if="activeDayObj.claudeCodeFocus" class="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
              <div class="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider">
                CLAUDE CODE AGENT
              </div>
              <p class="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                {{ activeDayObj.claudeCodeFocus }}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="switch-workspace-button"
            class="w-full py-2.5 px-4 rounded-md font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors bg-[#38BDF8] text-[#0B0E14] hover:bg-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] cursor-pointer"
            @click="handleSetCurrentDay(activeDayObj.dayNumber)"
          >
            <span>Switch Workspace to Day {{ activeDayObj.dayNumber }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
