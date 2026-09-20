<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  Calendar,
  Database,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import PageHeader from '../components/PageHeader.vue';

const store = useLearningStore();

const dayInput = ref<number>(store.currentDay);
const dayFeedback = ref<string | null>(null);

const importJsonText = ref<string>('');
const importStatus = ref<string | null>(null);
const importSuccess = ref<boolean>(false);

const resetFeedback = ref<string | null>(null);

watch(
  () => store.currentDay,
  (newDay) => {
    dayInput.value = newDay;
  }
);

function handleUpdateDay(): void {
  if (dayInput.value >= 1 && dayInput.value <= 180) {
    store.setCurrentDay(dayInput.value);
    dayFeedback.value = `Active day updated to Day ${dayInput.value}.`;
    setTimeout(() => {
      dayFeedback.value = null;
    }, 3000);
  }
}

function handleExport(): void {
  const jsonStr = store.exportDataAsJson();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `senior-java-180-backup-day${store.currentDay}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleImport(): void {
  try {
    const success = store.importDataFromJson(importJsonText.value);
    if (success) {
      importSuccess.value = true;
      importStatus.value = 'Successfully restored state from JSON!';
      importJsonText.value = '';
    } else {
      importSuccess.value = false;
      importStatus.value = 'Failed to parse JSON. Please check format.';
    }
  } catch {
    importSuccess.value = false;
    importStatus.value = 'Invalid JSON payload.';
  }
}

function handleReset(): void {
  store.resetToDemo();
  dayInput.value = 37;
  resetFeedback.value = 'All data reset to factory demo baseline (Day 37).';
  setTimeout(() => {
    resetFeedback.value = null;
  }, 4000);
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    <PageHeader
      title="Settings & Local Storage Engine"
      description="All progress is safely persisted in your browser's LocalStorage. Export your state anytime or adjust simulation parameters."
      badge="Configuration & Recovery"
    />

    <!-- Active Day Override -->
    <div class="rounded-lg border border-[#1E293B] bg-[#111622] p-5 space-y-3" data-testid="settings-day-card">
      <h2 class="text-base font-bold text-[#E5E7EB] flex items-center gap-2">
        <Calendar class="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
        <span>Active Day Override</span>
      </h2>
      <p class="text-xs text-[#94A3B8]">
        Switch your active workspace to any day between 1 and 180.
      </p>

      <form class="flex flex-wrap items-center gap-3 font-mono text-xs pt-1" @submit.prevent="handleUpdateDay">
        <div class="w-28">
          <input
            v-model.number="dayInput"
            type="number"
            min="1"
            max="180"
            class="w-full rounded bg-[#0B0E14] border border-[#1E293B] px-3 py-1.5 text-xs font-mono text-white focus-ring"
            aria-label="Active Day Input"
          />
        </div>
        <button
          type="submit"
          class="rounded bg-[#38BDF8] px-3.5 py-1.5 text-xs font-mono font-semibold text-[#0B0E14] hover:bg-[#0284C7] focus-ring"
        >
          Update Day
        </button>
        <span
          v-if="dayFeedback"
          class="text-xs font-mono text-[#22C55E] flex items-center gap-1.5"
          data-testid="day-feedback"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          {{ dayFeedback }}
        </span>
      </form>
    </div>

    <!-- Data Backup & State Migration -->
    <div class="rounded-lg border border-[#1E293B] bg-[#111622] p-5 space-y-4" data-testid="settings-backup-card">
      <h2 class="text-base font-bold text-[#E5E7EB] flex items-center gap-2">
        <Database class="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
        <span>Data Backup & State Migration</span>
      </h2>

      <div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-3.5 py-2 text-xs font-mono font-semibold text-[#38BDF8] hover:bg-[#38BDF8]/20 focus-ring"
          @click="handleExport"
        >
          <Download class="w-4 h-4" aria-hidden="true" />
          <span>Export Full State (JSON)</span>
        </button>
      </div>

      <!-- Import JSON Box -->
      <div class="space-y-3 pt-3 border-t border-[#1E293B] font-mono text-xs">
        <label for="import-json-input" class="block text-[11px] text-[#94A3B8] font-bold">
          RESTORE STATE FROM JSON BACKUP:
        </label>
        <textarea
          id="import-json-input"
          v-model="importJsonText"
          rows="4"
          placeholder="Paste your JSON backup payload here..."
          class="w-full rounded bg-[#0B0E14] border border-[#1E293B] p-3 text-xs font-mono text-white placeholder-[#64748B] focus-ring"
        />

        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span
              v-if="importStatus"
              class="text-xs font-mono"
              :class="importSuccess ? 'text-[#22C55E]' : 'text-[#EF4444]'"
              data-testid="import-status"
            >
              {{ importStatus }}
            </span>
          </div>

          <button
            type="button"
            :disabled="!importJsonText.trim()"
            class="rounded bg-[#22C55E] px-3.5 py-1.5 text-xs font-mono font-semibold text-[#0B0E14] hover:bg-[#16A34A] disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
            @click="handleImport"
          >
            Restore State
          </button>
        </div>
      </div>
    </div>

    <!-- Factory Reset -->
    <div class="rounded-lg border border-[#EF4444]/30 bg-[#111622] p-5 space-y-3" data-testid="settings-reset-card">
      <h2 class="text-base font-bold text-[#EF4444] flex items-center gap-2">
        <AlertTriangle class="w-4 h-4" aria-hidden="true" />
        <span>Factory Demo Reset</span>
      </h2>
      <p class="text-xs text-[#94A3B8]">
        Reset all study sessions, cards, DSA problems, and task states back to initial pristine seed data.
      </p>

      <div class="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded bg-[#EF4444] px-3.5 py-2 text-xs font-mono font-semibold text-white hover:bg-[#DC2626] focus-ring"
          @click="handleReset"
        >
          <RotateCcw class="w-4 h-4" aria-hidden="true" />
          <span>Reset All Data to Demo Baseline</span>
        </button>
        <span
          v-if="resetFeedback"
          class="text-xs font-mono text-[#F59E0B]"
          data-testid="reset-feedback"
        >
          {{ resetFeedback }}
        </span>
      </div>
    </div>
  </div>
</template>
