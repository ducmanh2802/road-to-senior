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
import Button from '../components/ui/Button.vue';
import Input from '../components/ui/Input.vue';
import Textarea from '../components/ui/Textarea.vue';

const store = useLearningStore();

const dayInput = ref<string>(String(store.currentDay));
const dayFeedback = ref<string | null>(null);

const importJsonText = ref<string>('');
const importStatus = ref<string | null>(null);
const importSuccess = ref<boolean>(false);

const resetFeedback = ref<string | null>(null);

watch(
  () => store.currentDay,
  (newDay) => {
    dayInput.value = String(newDay);
  }
);

function handleUpdateDay(): void {
  const parsed = Number.parseInt(dayInput.value, 10);
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 180) {
    store.setCurrentDay(parsed);
    dayInput.value = String(parsed);
    dayFeedback.value = `Active day updated to Day ${parsed}.`;
    setTimeout(() => {
      dayFeedback.value = null;
    }, 3000);
  } else {
    dayInput.value = String(store.currentDay);
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
  dayInput.value = String(37);
  resetFeedback.value = 'All data reset to factory demo baseline (Day 37).';
  setTimeout(() => {
    resetFeedback.value = null;
  }, 4000);
}
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto pb-12">
    <PageHeader
      title="Settings"
      description="All progress lives in this browser's local storage. Export a backup before switching machines, restore a previous snapshot, or reset everything back to the starter state."
    />

    <div class="ui-panel divide-y divide-[#1B2433]">
      <!-- Active day -->
      <section class="p-5 space-y-3" data-testid="settings-day-card">
        <div>
          <h2 class="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
            <Calendar class="w-4 h-4 text-[#64748B]" aria-hidden="true" />
            <span>Active day</span>
          </h2>
          <p class="text-xs text-[#94A3B8] mt-1 leading-relaxed">
            Move the workspace to any day between 1 and 180. The roadmap, Today view and Command Center all follow this value.
          </p>
        </div>

        <form class="flex flex-wrap items-end gap-3" @submit.prevent="handleUpdateDay">
          <div class="w-28">
            <Input
              :model-value="dayInput"
              type="number"
              label="Day"
              @update:model-value="dayInput = $event"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">Set active day</Button>
          <span
            v-if="dayFeedback"
            class="text-xs text-[#22C55E] inline-flex items-center gap-1.5 pb-2"
            data-testid="day-feedback"
          >
            <CheckCircle2 class="w-3.5 h-3.5" aria-hidden="true" />
            {{ dayFeedback }}
          </span>
        </form>
      </section>

      <!-- Backup / restore -->
      <section class="p-5 space-y-4" data-testid="settings-backup-card">
        <div>
          <h2 class="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
            <Database class="w-4 h-4 text-[#64748B]" aria-hidden="true" />
            <span>Backup & restore</span>
          </h2>
          <p class="text-xs text-[#94A3B8] mt-1 leading-relaxed">
            Export writes the full state (tasks, roadmap, cards, progress) to a JSON file. Restoring replaces the current state with the pasted payload.
          </p>
        </div>

        <Button variant="secondary" size="md" :icon="Download" @click="handleExport">
          Export Full State (JSON)
        </Button>

        <div class="space-y-3 pt-3 border-t border-[#1B2433]">
          <Textarea
            v-model="importJsonText"
            label="Restore from JSON backup"
            helper-text="Paste a backup payload produced by Export. Nothing changes until you press Restore."
            :rows="4"
            mono
            placeholder="Paste your JSON backup payload here…"
          />

          <div class="flex flex-wrap items-center justify-between gap-3">
            <span
              v-if="importStatus"
              class="text-xs"
              :class="importSuccess ? 'text-[#22C55E]' : 'text-[#EF4444]'"
              role="status"
              data-testid="import-status"
            >
              {{ importStatus }}
            </span>
            <span v-else class="text-[11px] text-[#64748B]">Restoring replaces your current state.</span>

            <Button
              variant="success"
              size="md"
              :disabled="!importJsonText.trim()"
              @click="handleImport"
            >
              Restore State
            </Button>
          </div>
        </div>
      </section>

      <!-- Destructive reset -->
      <section class="p-5 space-y-3" data-testid="settings-reset-card">
        <div>
          <h2 class="text-sm font-semibold text-[#EF4444] flex items-center gap-2">
            <AlertTriangle class="w-4 h-4" aria-hidden="true" />
            <span>Reset to starter state</span>
          </h2>
          <p class="text-xs text-[#94A3B8] mt-1 leading-relaxed">
            Discards every task state, review schedule and drill result, and reloads the starter content at day 37. This cannot be undone.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <Button variant="danger" size="md" :icon="RotateCcw" @click="handleReset">
            Reset All Data to Demo Baseline
          </Button>
          <span
            v-if="resetFeedback"
            class="text-xs text-[#F59E0B]"
            role="status"
            data-testid="reset-feedback"
          >
            {{ resetFeedback }}
          </span>
        </div>
      </section>
    </div>
  </div>
</template>
