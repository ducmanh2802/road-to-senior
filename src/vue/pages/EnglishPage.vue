<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Languages,
  Coffee,
  Leaf,
  Network,
  Database,
  Layers,
  AlertOctagon,
  Cpu,
  GitPullRequest,
  Award,
  Mic,
  Search,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Volume2,
  AlertTriangle,
  FileCode2,
  HelpCircle,
  BookOpen,
} from 'lucide-vue-next';
import PageHeader from '../components/PageHeader.vue';
import CodeBlock from '../components/CodeBlock.vue';
import EmptyState from '../components/EmptyState.vue';
import EnglishQuiz from '../components/EnglishQuiz.vue';
import { useLearningStore } from '../stores/learning';
import {
  TECHNICAL_ENGLISH_ITEMS,
  ENGLISH_SECTIONS_META,
  type EnglishSectionId,
  type EnglishDifficulty,
  type TechnicalEnglishItem,
} from '../../data/technicalEnglish';

const learningStore = useLearningStore();

// Section Filter
const selectedSection = ref<EnglishSectionId | 'ALL'>('ALL');

// View Mode: 'curriculum' | 'quiz'
const isQuizMode = ref(false);

// Difficulty Filter
const selectedDifficulty = ref<EnglishDifficulty | 'ALL'>('ALL');

// Search Query
const searchQuery = ref('');

// Expandable Card state (keyed by item id)
const expandedItemIds = ref<Record<string, boolean>>({
  'eng-java-01': true, // Expand first item by default
});

// Active drill tab per card: 'senior' | 'practice' | 'mistake' | 'vietnamese'
const activeDrillTabs = ref<Record<string, 'senior' | 'practice' | 'mistake' | 'vietnamese'>>({});

// Section icon mapping
const sectionIconMap = {
  'java-core': Coffee,
  'spring-boot': Leaf,
  'rest-distributed': Network,
  'database-jpa': Database,
  'kafka-redis': Layers,
  'debugging-incident': AlertOctagon,
  'system-design': Cpu,
  'code-review': GitPullRequest,
  'senior-interview': Award,
  'daily-drill': Mic,
};

// Filtered English items
const filteredItems = computed<TechnicalEnglishItem[]>(() => {
  return TECHNICAL_ENGLISH_ITEMS.filter((item) => {
    // Section filter
    if (selectedSection.value !== 'ALL' && item.section !== selectedSection.value) {
      return false;
    }
    // Difficulty filter
    if (selectedDifficulty.value !== 'ALL' && item.difficulty !== selectedDifficulty.value) {
      return false;
    }
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchTerm = item.term.toLowerCase().includes(q);
      const matchTopic = item.topic.toLowerCase().includes(q);
      const matchPlain = item.plainEnglishExplanation.toLowerCase().includes(q);
      const matchSenior = item.seniorExplanation.toLowerCase().includes(q);
      const matchPrompt = item.speakingPrompt.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTerm && !matchTopic && !matchPlain && !matchSenior && !matchPrompt && !matchTags) {
        return false;
      }
    }
    return true;
  });
});

function toggleExpand(itemId: string) {
  expandedItemIds.value[itemId] = !expandedItemIds.value[itemId];
}

function setDrillTab(itemId: string, tab: 'senior' | 'practice' | 'mistake' | 'vietnamese') {
  activeDrillTabs.value[itemId] = tab;
}

function getDrillTab(itemId: string): 'senior' | 'practice' | 'mistake' | 'vietnamese' {
  return activeDrillTabs.value[itemId] || 'senior';
}

function clearFilters() {
  selectedSection.value = 'ALL';
  selectedDifficulty.value = 'ALL';
  searchQuery.value = '';
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12" data-testid="english-page">
    <!-- Top Header -->
    <PageHeader
      title="Technical English for Senior Java"
      description="Master precision technical vocabulary, explain distributed architectures, conduct blameless incident reviews, and defend high-stakes system design choices in fluent English."
    >
      <template #actions>
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111622] border border-[#1E293B] text-xs font-mono"
          data-testid="english-progress-badge"
        >
          <span class="text-[#64748B]">PROGRESS:</span>
          <span class="text-[#38BDF8] font-bold">
            {{ learningStore.englishCompletedCount }} / {{ learningStore.englishTotalCount }}
          </span>
          <span class="text-[#94A3B8]">({{ learningStore.englishProgressPercent }}%)</span>
        </div>
        <div
          class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-xs font-mono text-[#38BDF8]"
          data-testid="english-track-badge"
        >
          <Languages class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Professional Communication</span>
        </div>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all shadow-sm"
          :class="[
            isQuizMode
              ? 'bg-[#0B0E14] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#151B28]'
              : 'bg-[#38BDF8] text-[#0B0E14] hover:bg-[#38BDF8]/90'
          ]"
          data-testid="toggle-quiz-mode-btn"
          @click="isQuizMode = !isQuizMode"
        >
          <HelpCircle v-if="!isQuizMode" class="w-3.5 h-3.5" />
          <BookOpen v-else class="w-3.5 h-3.5" />
          <span>{{ isQuizMode ? 'Vocabulary Mode' : 'Quiz Mode (5 Qs)' }}</span>
        </button>
      </template>
    </PageHeader>

    <!-- Quiz Mode View -->
    <EnglishQuiz
      v-if="isQuizMode"
      @exit="isQuizMode = false"
    />

    <!-- Curriculum Mode View -->
    <template v-else>
      <!-- Communication Loop & Fluency Banner -->
      <section
        class="rounded-lg border border-[#1E293B] bg-gradient-to-r from-[#111622] via-[#0E1522] to-[#111622] p-4 sm:p-5"
        aria-label="Technical English Fluency Framework"
      >
      <div class="flex items-center justify-between gap-4 flex-wrap mb-3">
        <div class="flex items-center gap-2">
          <Volume2 class="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
          <h2 class="text-xs font-mono font-bold text-[#E2E8F0] uppercase tracking-wider">
            Senior Technical Communication Loop
          </h2>
        </div>
        <div class="text-[11px] font-mono text-[#64748B]">
          LEARN → EXPLAIN → DEFEND → INTERVIEW
        </div>
      </div>
      <p class="text-xs text-[#94A3B8] leading-relaxed max-w-4xl">
        At the Senior and Staff level, technical capability is judged by your ability to articulate trade-offs, lead war-rooms, and convey complex failure modes concisely. This curriculum transforms passive reading knowledge into active speaking drills and structured defense patterns.
      </p>
    </section>

    <!-- Search & Filter Bar -->
    <section
      class="rounded-lg border border-[#1E293B] bg-[#111622] p-4 space-y-4"
      aria-label="Curriculum Filter Controls"
    >
      <!-- Search Input + Difficulty Filter -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by term, keyword, failure mode, or concept (e.g., 'virtual threads', 'idempotency', 'STAR')..."
            aria-label="Search English topics"
            class="w-full pl-9 pr-3 py-2 rounded bg-[#0B0E14] border border-[#1E293B] text-xs text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-colors"
            data-testid="search-input"
          />
        </div>
        <div class="flex items-center gap-2">
          <label for="difficulty-select" class="text-xs font-mono text-[#64748B] whitespace-nowrap">
            DIFFICULTY:
          </label>
          <select
            id="difficulty-select"
            v-model="selectedDifficulty"
            aria-label="Filter by difficulty"
            class="px-2.5 py-2 rounded bg-[#0B0E14] border border-[#1E293B] text-xs font-mono text-[#E2E8F0] focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]"
            data-testid="difficulty-filter-select"
          >
            <option value="ALL">ALL LEVELS ({{ TECHNICAL_ENGLISH_ITEMS.length }})</option>
            <option value="MID">MID TIER</option>
            <option value="SENIOR">SENIOR TIER</option>
            <option value="STAFF">STAFF / PRINCIPAL</option>
          </select>
        </div>
      </div>

      <!-- Section Filter Tabs -->
      <div class="flex flex-wrap gap-1.5 pt-1 border-t border-[#1B2433]" role="tablist" aria-label="Section tabs">
        <button
          type="button"
          role="tab"
          :aria-selected="selectedSection === 'ALL'"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer"
          :class="[
            selectedSection === 'ALL'
              ? 'bg-[#38BDF8] text-[#0A0E17] font-semibold'
              : 'bg-[#0A0E17] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151D2C] border border-[#1B2433]'
          ]"
          data-testid="section-tab-ALL"
          @click="selectedSection = 'ALL'"
        >
          <span>ALL</span>
          <span class="text-[10px] opacity-75">({{ TECHNICAL_ENGLISH_ITEMS.length }})</span>
        </button>

        <button
          v-for="section in ENGLISH_SECTIONS_META"
          :key="section.id"
          type="button"
          role="tab"
          :aria-selected="selectedSection === section.id"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-colors"
          :class="[
            selectedSection === section.id
              ? 'bg-[#38BDF8] text-[#0B0E14] font-bold shadow-sm'
              : 'bg-[#0B0E14] text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#151B28] border border-[#1E293B]'
          ]"
          :data-testid="`section-tab-${section.id}`"
          @click="selectedSection = section.id"
        >
          <component
            :is="sectionIconMap[section.id]"
            class="w-3.5 h-3.5"
            aria-hidden="true"
          />
          <span>{{ section.shortLabel }}</span>
        </button>
      </div>
    </section>

    <!-- Empty State -->
    <div v-if="filteredItems.length === 0" class="pt-4">
      <EmptyState
        title="No English Topics Match Your Filter"
        description="Try adjusting your search query, selecting 'ALL' sections, or clearing the difficulty level."
        action-label="Reset Filters"
        data-testid="empty-state"
        @action="clearFilters"
      />
    </div>

    <!-- Learning Card Grid -->
    <div v-else class="space-y-4" role="feed" aria-label="Technical English learning items">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        class="rounded-lg border border-[#1E293B] bg-[#111622] overflow-hidden transition-all duration-150"
        :data-testid="`english-card-${item.id}`"
      >
        <!-- Card Header / Summary Bar -->
        <div
          class="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-[#151B28]/80 transition-colors"
          @click="toggleExpand(item.id)"
        >
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <!-- Icon -->
            <div
              class="w-9 h-9 rounded bg-[#0B0E14] border border-[#1E293B] flex items-center justify-center text-[#38BDF8] shrink-0 mt-0.5"
            >
              <component :is="sectionIconMap[item.section]" class="w-4 h-4" aria-hidden="true" />
            </div>

            <!-- Title & Metadata -->
            <div class="space-y-1 flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-[#F8FAFC] tracking-tight">
                  {{ item.term }}
                </h3>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold"
                  :class="[
                    item.difficulty === 'STAFF'
                      ? 'bg-[#A855F7]/15 text-[#C084FC] border border-[#A855F7]/30'
                      : item.difficulty === 'SENIOR'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                      : 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30'
                  ]"
                >
                  {{ item.difficulty }}
                </span>
                <span class="px-2 py-0.5 rounded bg-[#1E293B] text-[10px] font-mono text-[#94A3B8]">
                  LOOP: {{ item.relatedStage }}
                </span>
              </div>
              <p class="text-xs text-[#94A3B8] font-mono">
                Topic: <span class="text-[#E2E8F0]">{{ item.topic }}</span>
              </p>
              <p class="text-xs text-[#CBD5E1] leading-relaxed pt-0.5 line-clamp-2">
                {{ item.plainEnglishExplanation }}
              </p>
            </div>
          </div>

          <!-- Actions & Expand Button -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Complete Checkbox Button -->
            <button
              type="button"
              class="p-1.5 rounded border transition-colors focus-ring"
              :class="[
                learningStore.isEnglishItemCompleted(item.id)
                  ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
                  : 'bg-[#0B0E14] text-[#64748B] border-[#1E293B] hover:text-[#94A3B8]'
              ]"
              :aria-label="`Mark ${item.term} as ${learningStore.isEnglishItemCompleted(item.id) ? 'incomplete' : 'completed'}`"
              :data-testid="`toggle-complete-${item.id}`"
              @click.stop="learningStore.toggleEnglishItemCompletion(item.id)"
            >
              <Check v-if="learningStore.isEnglishItemCompleted(item.id)" class="w-4 h-4" />
              <CheckCircle2 v-else class="w-4 h-4" />
            </button>

            <!-- Expand Toggle -->
            <button
              type="button"
              class="p-1.5 rounded bg-[#0B0E14] border border-[#1E293B] text-[#94A3B8] hover:text-[#E2E8F0] focus-ring"
              :aria-label="`Toggle details for ${item.term}`"
              :data-testid="`toggle-expand-${item.id}`"
            >
              <ChevronUp v-if="expandedItemIds[item.id]" class="w-4 h-4" />
              <ChevronDown v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Expanded Drill Details -->
        <div
          v-if="expandedItemIds[item.id]"
          class="border-t border-[#1E293B] bg-[#0B0E14]/70 p-4 sm:p-5 space-y-5"
          :data-testid="`english-details-${item.id}`"
        >
          <!-- Key Phrases Bar -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[11px] font-mono text-[#64748B]">KEY VOCABULARY PHRASES:</span>
            <span
              v-for="phrase in item.keyPhrases"
              :key="phrase"
              class="px-2 py-0.5 rounded bg-[#151B28] border border-[#1E293B] text-[11px] font-mono text-[#38BDF8]"
            >
              {{ phrase }}
            </span>
          </div>

          <!-- Drill Tabs Selection -->
          <div class="flex items-center gap-1.5 border-b border-[#1E293B] pb-2 overflow-x-auto custom-scrollbar" role="tablist" :aria-label="`Drill tabs for ${item.term}`">
            <button
              type="button"
              role="tab"
              :aria-selected="getDrillTab(item.id) === 'senior'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap"
              :class="[
                getDrillTab(item.id) === 'senior'
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-bold'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#151B28]'
              ]"
              :data-testid="`drill-tab-senior-${item.id}`"
              @click="setDrillTab(item.id, 'senior')"
            >
              <Sparkles class="w-3.5 h-3.5" aria-hidden="true" />
              <span>1. Explain as Senior Java</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="getDrillTab(item.id) === 'practice'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap"
              :class="[
                getDrillTab(item.id) === 'practice'
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-bold'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#151B28]'
              ]"
              :data-testid="`drill-tab-practice-${item.id}`"
              @click="setDrillTab(item.id, 'practice')"
            >
              <Mic class="w-3.5 h-3.5" aria-hidden="true" />
              <span>2. Practice Speaking Prompt</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="getDrillTab(item.id) === 'mistake'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap"
              :class="[
                getDrillTab(item.id) === 'mistake'
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-bold'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#151B28]'
              ]"
              :data-testid="`drill-tab-mistake-${item.id}`"
              @click="setDrillTab(item.id, 'mistake')"
            >
              <AlertTriangle class="w-3.5 h-3.5" aria-hidden="true" />
              <span>3. Common Mistake & Reality</span>
            </button>

            <button
              type="button"
              role="tab"
              :aria-selected="getDrillTab(item.id) === 'vietnamese'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap"
              :class="[
                getDrillTab(item.id) === 'vietnamese'
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-bold'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#151B28]'
              ]"
              :data-testid="`drill-tab-vietnamese-${item.id}`"
              @click="setDrillTab(item.id, 'vietnamese')"
            >
              <MessageSquare class="w-3.5 h-3.5" aria-hidden="true" />
              <span>4. Vietnamese Support Note</span>
            </button>
          </div>

          <!-- Tab 1: Senior Explanation & Example Sentence -->
          <div
            v-if="getDrillTab(item.id) === 'senior'"
            class="space-y-4"
            :data-testid="`drill-content-senior-${item.id}`"
          >
            <div class="space-y-2">
              <div class="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Senior-Level Technical Explanation:</span>
              </div>
              <p class="text-xs text-[#E2E8F0] leading-relaxed bg-[#111622] p-3.5 rounded border border-[#1E293B]">
                {{ item.seniorExplanation }}
              </p>
            </div>

            <div class="space-y-2">
              <div class="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
                Production Meeting Context Example Sentence:
              </div>
              <blockquote class="text-xs italic text-[#CBD5E1] bg-[#151B28] p-3 rounded border-l-2 border-[#38BDF8]">
                "{{ item.exampleSentence }}"
              </blockquote>
            </div>

            <!-- Optional Code Snippet -->
            <div v-if="item.codeSnippet" class="space-y-2 pt-1">
              <div class="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <FileCode2 class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Architectural Pattern Reference:</span>
              </div>
              <CodeBlock
                :code="item.codeSnippet.code"
                :language="item.codeSnippet.language"
                :title="item.codeSnippet.description"
                :show-line-numbers="true"
              />
            </div>
          </div>

          <!-- Tab 2: Practice Speaking Prompt -->
          <div
            v-if="getDrillTab(item.id) === 'practice'"
            class="space-y-4"
            :data-testid="`drill-content-practice-${item.id}`"
          >
            <div class="rounded-lg border border-[#38BDF8]/30 bg-[#0E1522] p-4 space-y-3">
              <div class="flex items-center gap-2 text-[#38BDF8] text-xs font-mono font-bold uppercase tracking-wider">
                <Mic class="w-4 h-4" aria-hidden="true" />
                <span>Verbal Speaking Challenge</span>
              </div>
              <p class="text-sm font-medium text-[#F8FAFC] leading-relaxed">
                {{ item.speakingPrompt }}
              </p>
              <div class="pt-2 border-t border-[#1E293B] text-xs text-[#94A3B8] space-y-1">
                <p class="font-mono text-[11px] text-[#64748B]">DRILL TIPS:</p>
                <ul class="list-disc list-inside space-y-0.5">
                  <li>Speak aloud slowly and clearly for 60 to 90 seconds.</li>
                  <li>Incorporate at least two of the key vocabulary phrases listed above.</li>
                  <li>State the problem first, your engineering rationale second, and the measurable outcome third.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Tab 3: Common Mistake & Reality -->
          <div
            v-if="getDrillTab(item.id) === 'mistake'"
            class="space-y-3"
            :data-testid="`drill-content-mistake-${item.id}`"
          >
            <div class="rounded-lg border border-[#EF4444]/30 bg-[#160B0F]/60 p-4 space-y-2">
              <div class="flex items-center gap-2 text-[#F87171] text-xs font-mono font-bold uppercase tracking-wider">
                <AlertTriangle class="w-4 h-4" aria-hidden="true" />
                <span>Common Misconception vs Engineering Reality</span>
              </div>
              <p class="text-xs text-[#FCA5A5] leading-relaxed">
                {{ item.commonMistake }}
              </p>
            </div>
          </div>

          <!-- Tab 4: Vietnamese Support Note -->
          <div
            v-if="getDrillTab(item.id) === 'vietnamese'"
            class="space-y-3"
            :data-testid="`drill-content-vietnamese-${item.id}`"
          >
            <div class="rounded-lg border border-[#F59E0B]/30 bg-[#19150B]/60 p-4 space-y-2">
              <div class="flex items-center gap-2 text-[#FBBF24] text-xs font-mono font-bold uppercase tracking-wider">
                <MessageSquare class="w-4 h-4" aria-hidden="true" />
                <span>Ghi chú chuyên môn & thuật ngữ tiếng Việt</span>
              </div>
              <p class="text-xs text-[#FDE68A] leading-relaxed">
                {{ item.vietnameseSupportNote }}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
    </template>
  </div>
</template>
