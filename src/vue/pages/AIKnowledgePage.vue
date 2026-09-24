<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Cpu,
  Code2,
  Coffee,
  Database,
  Bot,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Award,
  Search,
  BookOpen,
  HelpCircle,
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Sparkles,
  Zap,
} from 'lucide-vue-next';
import PageHeader from '../components/PageHeader.vue';
import CodeBlock from '../components/ui/CodeBlock.vue';
import EmptyState from '../components/EmptyState.vue';
import { useLearningStore } from '../stores/learning';
import {
  AI_SENIOR_JAVA_ITEMS,
  AI_TRACKS_META,
  RAG_CONCEPTUAL_FLOW_STEPS,
  type AITrack,
  type AIDifficulty,
  type AIKnowledgeItem,
} from '../../data/aiSeniorJava';

const learningStore = useLearningStore();

// Track Filter
const selectedTrack = ref<AITrack | 'ALL'>('ALL');

// Difficulty Filter
const selectedDifficulty = ref<AIDifficulty | 'ALL'>('ALL');

// Search Query
const searchQuery = ref('');

// Expandable Card state (keyed by item id)
const expandedItemIds = ref<Record<string, boolean>>({
  'ai-fund-01': true, // Expand first by default
});

// Active Drill Tab per card: 'explain' | 'design' | 'break' | 'interview'
const activeDrillTabs = ref<Record<string, 'explain' | 'design' | 'break' | 'interview'>>({});

// Architecture diagram visibility — collapsed by default so the topic list leads
const showArchitectureDetails = ref(false);

// Track icon mapping
const trackIconMap = {
  fundamentals: Cpu,
  'llm-engineering': Code2,
  'java-integration': Coffee,
  rag: Database,
  agents: Bot,
  'system-design': Layers,
  evaluation: CheckCircle2,
  security: ShieldAlert,
  interview: Award,
};

// Filtered Knowledge Items
const filteredItems = computed<AIKnowledgeItem[]>(() => {
  return AI_SENIOR_JAVA_ITEMS.filter((item) => {
    // Track filter
    if (selectedTrack.value !== 'ALL' && item.track !== selectedTrack.value) {
      return false;
    }
    // Difficulty filter
    if (selectedDifficulty.value !== 'ALL' && item.difficulty !== selectedDifficulty.value) {
      return false;
    }
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchInsight = item.seniorInsight.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchInsight && !matchTags) {
        return false;
      }
    }
    return true;
  });
});

// Check if an item is completed in Pinia
function isItemCompleted(itemId: string): boolean {
  return learningStore.isAiTopicCompleted(itemId);
}

// Toggle completion in Pinia
function toggleItemCompletion(itemId: string): void {
  learningStore.toggleAiTopicCompletion(itemId);
}

// Expand / collapse card
function toggleCardExpansion(itemId: string): void {
  expandedItemIds.value[itemId] = !expandedItemIds.value[itemId];
}

// Card tab selector
function getCardTab(itemId: string): 'explain' | 'design' | 'break' | 'interview' {
  return activeDrillTabs.value[itemId] || 'explain';
}

function setCardTab(itemId: string, tab: 'explain' | 'design' | 'break' | 'interview'): void {
  activeDrillTabs.value[itemId] = tab;
}

// Reset filters
function clearFilters(): void {
  selectedTrack.value = 'ALL';
  selectedDifficulty.value = 'ALL';
  searchQuery.value = '';
}
</script>

<template>
  <div class="max-w-5xl mx-auto pb-16 space-y-6">
    <!-- Header -->
    <PageHeader
      title="AI Knowledge Foundation"
      description="Modern AI systems architecture, enterprise LLM integration with Spring Boot & Java 25, RAG pipelines, autonomous agents, and staff interview defense."
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <div
            data-testid="ai-progress-badge"
            class="px-2.5 py-1 rounded border border-[#1E293B] bg-[#111622] flex items-center gap-1.5 text-xs font-mono"
          >
            <span class="text-[#64748B]">PROGRESS:</span>
            <span class="text-[#38BDF8] font-bold">{{ learningStore.aiCompletedCount }}</span>
            <span class="text-[#475569]">/</span>
            <span class="text-[#94A3B8]">{{ learningStore.aiTotalCount }}</span>
            <span class="text-[#22C55E] text-[10px] ml-1">({{ learningStore.aiProgressPercent }}%)</span>
          </div>
          <span
            data-testid="ai-runtime-badge"
            class="px-2 py-0.5 rounded text-[10px] font-mono border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]"
          >
            Spring Boot 4.1 + Java 25
          </span>
        </div>
      </template>
    </PageHeader>

    <!-- Track Quick-Filter Bar -->
    <div
      role="tablist"
      aria-label="AI Tracks"
      data-testid="track-filter-tabs"
      class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 border-b border-[#1E293B]"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="selectedTrack === 'ALL'"
        data-testid="track-tab-ALL"
        class="px-3 py-1.5 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5"
        :class="selectedTrack === 'ALL' ? 'bg-[#38BDF8] text-[#0B0E14] font-bold' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'"
        @click="selectedTrack = 'ALL'"
      >
        <span>All Tracks ({{ AI_SENIOR_JAVA_ITEMS.length }})</span>
      </button>

      <button
        v-for="track in AI_TRACKS_META"
        :key="track.id"
        type="button"
        role="tab"
        :aria-selected="selectedTrack === track.id"
        :data-testid="`track-tab-${track.id}`"
        class="px-3 py-1.5 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5"
        :class="selectedTrack === track.id ? 'bg-[#38BDF8] text-[#0B0E14] font-bold' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'"
        @click="selectedTrack = track.id"
      >
        <component :is="trackIconMap[track.id]" class="w-3.5 h-3.5" aria-hidden="true" />
        <span>{{ track.shortLabel }}</span>
      </button>
    </div>

    <!-- Search & Secondary Filters Controls -->
    <div class="ui-panel p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="text"
          data-testid="ai-search-input"
          placeholder="Search AI concepts, Spring Boot patterns, RAG, pgvector, prompt injection…"
          aria-label="Search AI knowledge curriculum"
          class="w-full pl-9 pr-3 py-1.5 bg-[#0B0E14] border border-[#1E293B] rounded text-xs text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#38BDF8]"
        />
      </div>

      <!-- Difficulty Selector -->
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-[11px] font-mono text-[#64748B] uppercase">Difficulty:</span>
        <select
          v-model="selectedDifficulty"
          data-testid="difficulty-filter-select"
          aria-label="Filter by difficulty"
          class="px-2.5 py-1.5 bg-[#0B0E14] border border-[#1E293B] rounded text-xs text-[#E5E7EB] font-mono focus:outline-none focus:border-[#38BDF8]"
        >
          <option value="ALL">All Levels</option>
          <option value="MID">Mid Engineer</option>
          <option value="SENIOR">Senior Engineer</option>
          <option value="STAFF">Staff / Principal</option>
        </select>
      </div>
    </div>

    <!-- Architectural reference: collapsed by default (topic list leads) -->
    <section
      data-testid="architecture-diagram-section"
      class="ui-panel p-4 sm:p-5 space-y-3"
      aria-label="Enterprise AI architecture reference"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-2 min-w-0">
          <Layers class="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />
          <div class="min-w-0">
            <h2 class="text-sm font-semibold text-[#F1F5F9] tracking-tight">
              Enterprise AI Gateway & Microservice Topology
            </h2>
            <p class="text-[11px] text-[#64748B] mt-0.5">
              Reference topology and the end-to-end RAG lifecycle used across the tracks below.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="text-xs font-mono text-[#94A3B8] hover:text-[#F1F5F9] flex items-center gap-1 focus-ring shrink-0 cursor-pointer"
          :aria-expanded="showArchitectureDetails"
          aria-label="Toggle architecture reference"
          @click="showArchitectureDetails = !showArchitectureDetails"
        >
          <span>{{ showArchitectureDetails ? 'Hide' : 'Show' }}</span>
          <ChevronUp v-if="showArchitectureDetails" class="w-3.5 h-3.5" aria-hidden="true" />
          <ChevronDown v-else class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <!-- Conceptual architecture diagram -->
      <div v-show="showArchitectureDetails" class="pt-2 space-y-4">
        <div class="p-3.5 rounded bg-[#0B0E14] border border-[#1E293B] font-mono text-xs text-[#38BDF8] overflow-x-auto leading-relaxed">
          <pre data-testid="architecture-topology-ascii">
Client (Web / Mobile / Internal Service)
  ↓ [JWT Auth + Quota Bucket Check]
AI Gateway (Rate Limiting, Semantic Cache, Prompt Registry)
  ↓
Model Adapter (Ports &amp; Adapters, Virtual Threads, Resilience4j)
  ├── LLM Provider (Primary / Fallback Router: Claude / GPT / Bedrock)
  ├── Prompt Registry (Versioned System Directives &amp; Delimiter Guards)
  ├── RAG Service (pgvector Hybrid Search + BM25 + Cross-Encoder Rerank)
  └── Tool Execution Service (Governed Sandbox, Idempotency Token)
          ↓
      Domain Services (Order, Inventory, Risk, Portfolio)
          ↓
      Databases / Kafka Audit Event Log
          </pre>
        </div>

        <!-- RAG Ingestion & Query Lifecycle Flow -->
        <div class="border-t border-[#1E293B] pt-3">
          <h3 class="text-xs font-bold font-mono text-[#94A3B8] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Zap class="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
            End-to-End RAG Lifecycle (11-Stage Pipeline)
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div
              v-for="st in RAG_CONCEPTUAL_FLOW_STEPS"
              :key="st.step"
              class="p-2 rounded border border-[#1E293B] bg-[#0B0E14]/60 text-xs font-mono"
            >
              <div class="flex items-center gap-1.5 text-[#38BDF8] font-bold">
                <span>Stage {{ st.step }}:</span>
                <span class="text-[#E5E7EB]">{{ st.name }}</span>
              </div>
              <p class="text-[11px] text-[#94A3B8] mt-1 leading-normal">
                {{ st.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <EmptyState
      v-if="filteredItems.length === 0"
      title="No matching AI curriculum topics"
      description="No topics match your current filter and search criteria. Try clearing filters to see the complete curriculum."
      action-label="Clear All Filters"
      @action="clearFilters"
    />

    <!-- Knowledge Cards List -->
    <div v-else class="space-y-4" data-testid="ai-knowledge-list">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        :data-testid="`ai-card-${item.id}`"
        class="ui-panel border border-[#1E293B] bg-[#111622] rounded-lg ui-transition"
        :class="{ 'border-[#38BDF8]/40 ring-1 ring-[#38BDF8]/20': isItemCompleted(item.id) }"
      >
        <!-- Card Header Banner -->
        <div class="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-[#1B2433]">
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border"
                :class="{
                  'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30': item.difficulty === 'MID',
                  'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30': item.difficulty === 'SENIOR',
                  'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30': item.difficulty === 'STAFF',
                }"
              >
                {{ item.difficulty }}
              </span>

              <span class="text-xs font-mono text-[#64748B] flex items-center gap-1">
                <component :is="trackIconMap[item.track]" class="w-3 h-3 text-[#38BDF8]" aria-hidden="true" />
                {{ item.track.toUpperCase() }}
              </span>

              <span
                v-if="isItemCompleted(item.id)"
                class="px-2 py-0.5 rounded text-[10px] font-mono bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1 font-semibold"
              >
                <Check class="w-3 h-3" aria-hidden="true" />
                COMPLETED
              </span>
            </div>

            <h3 class="text-base sm:text-lg font-bold text-[#F1F5F9] tracking-tight">
              {{ item.title }}
            </h3>

            <p class="text-xs text-[#94A3B8] leading-relaxed">
              {{ item.summary }}
            </p>
          </div>

          <!-- Card Actions (Toggle Completed + Expand) -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              :data-testid="`toggle-complete-${item.id}`"
              :aria-label="isItemCompleted(item.id) ? `Mark ${item.title} as incomplete` : `Mark ${item.title} as completed`"
              class="px-2.5 py-1.5 rounded-md text-xs font-mono border transition-colors flex items-center gap-1.5 focus-ring cursor-pointer"
              :class="isItemCompleted(item.id)
                ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E] hover:bg-[#22C55E]/25'
                : 'bg-[#151D2C] border-[#1B2433] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#38BDF8]/40'"
              @click="toggleItemCompletion(item.id)"
            >
              <Check class="w-3.5 h-3.5" aria-hidden="true" />
              <span class="hidden sm:inline">{{ isItemCompleted(item.id) ? 'Completed' : 'Mark Complete' }}</span>
            </button>

            <button
              type="button"
              :data-testid="`toggle-expand-${item.id}`"
              :aria-label="expandedItemIds[item.id] ? `Collapse ${item.title}` : `Expand ${item.title}`"
              class="p-1.5 rounded text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#151D2C] focus-ring cursor-pointer"
              @click="toggleCardExpansion(item.id)"
            >
              <ChevronUp v-if="expandedItemIds[item.id]" class="w-4 h-4" aria-hidden="true" />
              <ChevronDown v-else class="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Expanded Card Body -->
        <div v-if="expandedItemIds[item.id]" :data-testid="'card-body-' + item.id" class="p-4 sm:p-5 space-y-5">
          <!-- 4 Interactive Drill Tabs -->
          <div
            role="tablist"
            :aria-label="`Drills for ${item.title}`"
            class="flex items-center gap-1 border-b border-[#1E293B] pb-1 overflow-x-auto"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="getCardTab(item.id) === 'explain'"
              :data-testid="`tab-explain-${item.id}`"
              class="px-3 py-1.5 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5"
              :class="getCardTab(item.id) === 'explain' ? 'bg-[#1E293B] text-[#38BDF8] font-bold border border-[#38BDF8]/30' : 'text-[#64748B] hover:text-[#94A3B8]'"
              @click="setCardTab(item.id, 'explain')"
            >
              <BookOpen class="w-3.5 h-3.5" aria-hidden="true" />
              <span>1. Explain Like Senior Java</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="getCardTab(item.id) === 'design'"
              :data-testid="`tab-design-${item.id}`"
              class="px-3 py-1.5 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5"
              :class="getCardTab(item.id) === 'design' ? 'bg-[#1E293B] text-[#38BDF8] font-bold border border-[#38BDF8]/30' : 'text-[#64748B] hover:text-[#94A3B8]'"
              @click="setCardTab(item.id, 'design')"
            >
              <FileCode2 class="w-3.5 h-3.5" aria-hidden="true" />
              <span>2. Code & Design Pattern</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="getCardTab(item.id) === 'break'"
              :data-testid="`tab-break-${item.id}`"
              class="px-3 py-1.5 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5"
              :class="getCardTab(item.id) === 'break' ? 'bg-[#1E293B] text-[#EF4444] font-bold border border-[#EF4444]/30' : 'text-[#64748B] hover:text-[#94A3B8]'"
              @click="setCardTab(item.id, 'break')"
            >
              <Activity class="w-3.5 h-3.5" aria-hidden="true" />
              <span>3. Failure Mode Drill</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="getCardTab(item.id) === 'interview'"
              :data-testid="`tab-interview-${item.id}`"
              class="px-3 py-1.5 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5"
              :class="getCardTab(item.id) === 'interview' ? 'bg-[#1E293B] text-[#F59E0B] font-bold border border-[#F59E0B]/30' : 'text-[#64748B] hover:text-[#94A3B8]'"
              @click="setCardTab(item.id, 'interview')"
            >
              <HelpCircle class="w-3.5 h-3.5" aria-hidden="true" />
              <span>4. Interview Question</span>
            </button>
          </div>

          <!-- Tab 1: Explain Like Senior Java -->
          <div
            v-if="getCardTab(item.id) === 'explain'"
            :data-testid="`view-explain-${item.id}`"
            class="space-y-4"
          >
            <div class="p-3.5 rounded bg-[#0B0E14] border border-[#1E293B] space-y-2">
              <div class="flex items-center gap-2 text-xs font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                <Sparkles class="w-3.5 h-3.5" aria-hidden="true" />
                Senior Engineering Mental Model
              </div>
              <p class="text-xs text-[#E5E7EB] leading-relaxed">
                {{ item.seniorInsight }}
              </p>
            </div>

            <div class="p-3.5 rounded bg-[#0B0E14] border border-[#1E293B] space-y-2">
              <div class="flex items-center gap-2 text-xs font-mono text-[#22C55E] font-bold uppercase tracking-wider">
                <Coffee class="w-3.5 h-3.5" aria-hidden="true" />
                Java Enterprise Connection
              </div>
              <p class="text-xs text-[#E5E7EB] leading-relaxed">
                {{ item.javaConnection }}
              </p>
            </div>
          </div>

          <!-- Tab 2: Code & Design Exercise -->
          <div
            v-else-if="getCardTab(item.id) === 'design'"
            :data-testid="`view-design-${item.id}`"
            class="space-y-4"
          >
            <p class="text-xs text-[#94A3B8] italic">
              {{ item.example.description }}
            </p>

            <CodeBlock
              :code="item.example.code"
              :language="item.example.language"
              :filename="item.example.filename"
              show-line-numbers
            />

            <div class="p-3 rounded border border-[#1E293B] bg-[#0B0E14] text-xs font-mono text-[#94A3B8]">
              <span class="text-[#38BDF8] font-semibold">Hands-On Design Prompt:</span>
              <p class="mt-1 text-[#E5E7EB]">{{ item.practicePrompt }}</p>
            </div>
          </div>

          <!-- Tab 3: Failure Mode Drill -->
          <div
            v-else-if="getCardTab(item.id) === 'break'"
            :data-testid="`view-break-${item.id}`"
            class="space-y-3"
          >
            <div class="text-xs font-mono text-[#EF4444] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert class="w-4 h-4" aria-hidden="true" />
              Critical Production Failure Modes &amp; Postmortem Hazards
            </div>

            <ul class="space-y-2">
              <li
                v-for="(fail, fIdx) in item.failureModes"
                :key="fIdx"
                class="p-2.5 rounded border border-[#EF4444]/20 bg-[#EF4444]/5 text-xs text-[#E5E7EB] flex items-start gap-2"
              >
                <span class="text-[#EF4444] font-mono font-bold shrink-0">[{{ fIdx + 1 }}]</span>
                <span class="leading-relaxed">{{ fail }}</span>
              </li>
            </ul>
          </div>

          <!-- Tab 4: Interview Question -->
          <div
            v-else-if="getCardTab(item.id) === 'interview'"
            :data-testid="`view-interview-${item.id}`"
            class="space-y-3"
          >
            <div class="p-3.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/30 space-y-2">
              <div class="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-bold uppercase tracking-wider">
                <HelpCircle class="w-3.5 h-3.5" aria-hidden="true" />
                Staff Technical Interview Question
              </div>
              <p class="text-sm font-semibold text-[#F8FAFC] leading-snug">
                "{{ item.interviewQuestion }}"
              </p>
            </div>

            <div class="p-3 rounded bg-[#0B0E14] border border-[#1E293B] text-xs space-y-1.5">
              <span class="font-mono text-[#94A3B8] font-semibold">Evaluation Rubric &amp; Answer Strategy:</span>
              <p class="text-[#E5E7EB] leading-relaxed">
                Senior candidates should address this by articulating: 1) System constraints and SLAs, 2) Trade-offs between memory, latency, and cost, 3) Decoupled Ports &amp; Adapters architecture, and 4) Graceful failure mitigation.
              </p>
            </div>
          </div>

          <!-- Tags Footer -->
          <div class="flex items-center gap-2 pt-2 border-t border-[#1E293B] flex-wrap">
            <span class="text-[10px] font-mono text-[#64748B]">TAGS:</span>
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0B0E14] border border-[#1E293B] text-[#94A3B8]"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
