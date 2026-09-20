<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLearningStore } from '../stores/learning';
import type { TaskState, TaskCategory, LearningTask } from '../../types';
import PageHeader from '../components/PageHeader.vue';
import EmptyState from '../components/EmptyState.vue';
import Modal from '../components/Modal.vue';
import {
  Plus,
  Play,
  Check,
  FastForward,
  FileEdit,
  ChevronUp,
  ChevronDown,
  Clock,
} from 'lucide-vue-next';

export type TaskStatusFilter = 'ALL' | TaskState;

const store = useLearningStore();

// Status filters based directly on domain TaskState
const filterStatuses: TaskStatusFilter[] = [
  'ALL',
  'TODO',
  'IN_PROGRESS',
  'COMPLETED',
  'SKIPPED',
];

const statusFilter = ref<TaskStatusFilter>('ALL');
const expandedTaskId = ref<string | null>(null);
const editingNotesTaskId = ref<string | null>(null);
const noteText = ref('');

// New task modal state
const isAddingTask = ref(false);
const newTaskTitle = ref('');
const newTaskDesc = ref('');
const newTaskMinutes = ref(30);
const newTaskCategory = ref<TaskCategory>('HANDS_ON');

const allCategories: TaskCategory[] = [
  'JAVA',
  'HANDS_ON',
  'DSA',
  'SYSTEM_DESIGN',
  'SPRING',
  'MICROSERVICES',
  'CLAUDE_CODE',
  'ENGLISH',
  'REVIEW',
];

const filteredTasks = computed<LearningTask[]>(() => {
  if (statusFilter.value === 'ALL') return store.tasks;
  return store.tasks.filter((t) => t.state === statusFilter.value);
});

function categoryBadgeClass(cat: TaskCategory): string {
  const map: Record<TaskCategory, string> = {
    JAVA: 'border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]',
    HANDS_ON: 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]',
    DSA: 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]',
    SYSTEM_DESIGN: 'border-[#A855F7]/30 bg-[#A855F7]/10 text-[#A855F7]',
    SPRING: 'border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]',
    MICROSERVICES: 'border-[#6366F1]/30 bg-[#6366F1]/10 text-[#6366F1]',
    CLAUDE_CODE: 'border-[#EC4899]/30 bg-[#EC4899]/10 text-[#EC4899]',
    ENGLISH: 'border-[#14B8A6]/30 bg-[#14B8A6]/10 text-[#14B8A6]',
    REVIEW: 'border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]',
  };
  return map[cat] || 'border-[#1E293B] bg-[#1E293B]/20 text-[#94A3B8]';
}

function stateBadgeClass(state: TaskState): string {
  const map: Record<TaskState, string> = {
    TODO: 'border-[#334155] bg-[#334155]/20 text-[#94A3B8]',
    IN_PROGRESS: 'border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]',
    COMPLETED: 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]',
    SKIPPED: 'border-[#64748B]/30 bg-[#64748B]/10 text-[#64748B]',
    OVERDUE: 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]',
  };
  return map[state] || 'border-[#1E293B] text-[#94A3B8]';
}

function stateDotClass(state: TaskState): string {
  const map: Record<TaskState, string> = {
    TODO: 'bg-[#64748B]',
    IN_PROGRESS: 'bg-[#38BDF8] animate-pulse',
    COMPLETED: 'bg-[#22C55E]',
    SKIPPED: 'bg-[#64748B]',
    OVERDUE: 'bg-[#EF4444]',
  };
  return map[state] || 'bg-[#64748B]';
}

function handleStartTask(id: string): void {
  store.setTaskState(id, 'IN_PROGRESS');
}

function handleCompleteTask(id: string): void {
  const task = store.tasks.find((t) => t.id === id);
  if (task?.state === 'COMPLETED') {
    store.setTaskState(id, 'IN_PROGRESS');
  } else {
    store.setTaskState(id, 'COMPLETED');
  }
}

function handleSkipTask(id: string): void {
  store.setTaskState(id, 'SKIPPED');
}

function toggleExpand(id: string): void {
  expandedTaskId.value = expandedTaskId.value === id ? null : id;
}

function openNoteEditor(task: LearningTask): void {
  editingNotesTaskId.value = task.id;
  noteText.value = task.notes ?? '';
}

function cancelEditNotes(): void {
  editingNotesTaskId.value = null;
  noteText.value = '';
}

function saveNotes(id: string): void {
  store.updateTaskNotes(id, noteText.value);
  editingNotesTaskId.value = null;
}

function handleCreateTask(): void {
  if (!newTaskTitle.value.trim()) return;
  store.addTask({
    title: newTaskTitle.value.trim(),
    description: newTaskDesc.value.trim(),
    category: newTaskCategory.value,
    estimatedMinutes: newTaskMinutes.value || 30,
    state: 'TODO',
  });
  newTaskTitle.value = '';
  newTaskDesc.value = '';
  newTaskMinutes.value = 30;
  newTaskCategory.value = 'HANDS_ON';
  isAddingTask.value = false;
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-12">
    <!-- Page Header -->
    <PageHeader
      title="Today's Engineering Execution"
      description="Daily execution for Senior Java 180: Core Java, hands-on architecture, DSA drills, and system design tasks."
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-[#38BDF8] text-[#0B0E14] hover:bg-[#0EA5E9] transition-colors cursor-pointer"
          @click="isAddingTask = true"
        >
          <Plus class="w-3.5 h-3.5" /> Create Task
        </button>
      </template>
    </PageHeader>

    <!-- Task Status Filter Buttons -->
    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filter tasks by status">
      <button
        v-for="status in filterStatuses"
        :key="status"
        type="button"
        :class="[
          'px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer',
          statusFilter === status
            ? 'bg-[#38BDF8] text-[#0B0E14] font-semibold'
            : 'bg-[#111622] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
        ]"
        @click="statusFilter = status"
      >
        {{ status }}
      </button>
    </div>

    <!-- Task List -->
    <div v-if="filteredTasks.length === 0">
      <EmptyState
        title="No tasks match filter"
        description="There are no engineering tasks found for this status today. Create a custom task or reset your filter."
        action-label="Reset Filter"
        @action="statusFilter = 'ALL'"
      />
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        :class="[
          'ui-panel p-4 transition-all duration-150 rounded-lg',
          task.state === 'COMPLETED' ? 'border-[#22C55E]/30 opacity-80' : 'border-[#1E293B]',
          task.state === 'IN_PROGRESS' ? 'border-[#38BDF8]/50 shadow-md shadow-[#38BDF8]/5' : ''
        ]"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex items-start gap-3 flex-1">
            <button
              type="button"
              @click="handleCompleteTask(task.id)"
              :title="task.state === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Complete'"
              :aria-label="task.state === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Complete'"
              class="w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0"
              :class="task.state === 'COMPLETED' ? 'bg-[#22C55E] border-[#22C55E] text-[#0B0E14]' : 'border-[#334155] hover:border-[#38BDF8] text-transparent'"
            >
              <Check class="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  class="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono font-semibold"
                  :class="categoryBadgeClass(task.category)"
                >
                  {{ task.category }}
                </span>
                <span
                  class="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-mono font-medium"
                  :class="stateBadgeClass(task.state)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="stateDotClass(task.state)"></span>
                  {{ task.state }}
                </span>
                <span class="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                  <Clock class="w-3 h-3" />{{ task.estimatedMinutes }} min
                </span>
              </div>

              <h3 :class="['text-sm font-semibold', task.state === 'COMPLETED' ? 'line-through text-[#94A3B8]' : 'text-[#F8FAFC]']">
                {{ task.title }}
              </h3>
              <p class="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                {{ task.description }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end md:self-center shrink-0">
            <template v-if="task.state !== 'COMPLETED'">
              <button
                v-if="task.state !== 'IN_PROGRESS'"
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20 transition-colors cursor-pointer"
                @click="handleStartTask(task.id)"
              >
                <Play class="w-3 h-3" /> Start
              </button>
              <button
                v-else
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors cursor-pointer"
                @click="handleCompleteTask(task.id)"
              >
                <Check class="w-3 h-3" /> Complete
              </button>
              <button
                type="button"
                class="p-1.5 rounded border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
                title="Skip for today"
                aria-label="Skip for today"
                @click="handleSkipTask(task.id)"
              >
                <FastForward class="w-3.5 h-3.5" />
              </button>
            </template>
            <button
              type="button"
              class="p-1.5 rounded border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
              title="Edit engineering notes"
              aria-label="Edit engineering notes"
              @click="openNoteEditor(task)"
            >
              <FileEdit class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="p-1.5 rounded border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
              :title="expandedTaskId === task.id ? 'Collapse' : 'Expand'"
              :aria-label="expandedTaskId === task.id ? 'Collapse' : 'Expand'"
              @click="toggleExpand(task.id)"
            >
              <ChevronUp v-if="expandedTaskId === task.id" class="w-3.5 h-3.5" />
              <ChevronDown v-else class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Expanded Code Snippet & Notes -->
        <div v-if="expandedTaskId === task.id" class="pt-3 mt-3 border-t border-[#1E293B]/60 space-y-3">
          <div v-if="task.codeSnippet" class="mt-1">
            <div class="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] bg-[#0B0E14] px-3 py-1.5 rounded-t border border-b-0 border-[#1E293B]">
              <span>Reference Implementation</span>
            </div>
            <pre class="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-b text-xs font-mono text-[#38BDF8] overflow-x-auto whitespace-pre"><code>{{ task.codeSnippet }}</code></pre>
          </div>
          <div v-if="task.notes && editingNotesTaskId !== task.id" class="p-3 bg-[#0B0E14] border border-[#1E293B] rounded text-xs">
            <div class="text-[10px] font-mono text-[#94A3B8] uppercase font-semibold mb-1">ENGINEERING NOTES</div>
            <p class="text-[#E5E7EB] whitespace-pre-wrap font-sans leading-relaxed">{{ task.notes }}</p>
          </div>
          <div v-else-if="editingNotesTaskId === task.id" class="space-y-2">
            <label class="block text-[10px] font-mono text-[#94A3B8] uppercase font-semibold">EDIT NOTES</label>
            <textarea
              v-model="noteText"
              rows="3"
              placeholder="Log your implementation observations, edge cases, or profiling results..."
              class="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-[#1E293B] rounded text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-hidden"
            ></textarea>
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                class="px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                @click="cancelEditNotes"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded text-xs font-medium bg-[#38BDF8] text-[#0B0E14] hover:bg-[#0EA5E9] transition-colors cursor-pointer"
                @click="saveNotes(task.id)"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Task Modal -->
    <Modal v-if="isAddingTask" title="Create New Task" @close="isAddingTask = false">
      <form @submit.prevent="handleCreateTask" class="space-y-4">
        <div>
          <label class="block text-xs font-mono font-medium text-[#94A3B8] mb-1">Title *</label>
          <input
            v-model="newTaskTitle"
            type="text"
            required
            placeholder="e.g. Implement Kafka Idempotent Producer"
            class="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-[#1E293B] rounded text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-hidden"
          />
        </div>
        <div>
          <label class="block text-xs font-mono font-medium text-[#94A3B8] mb-1">Description</label>
          <textarea
            v-model="newTaskDesc"
            rows="3"
            placeholder="Task context, requirements, and validation steps..."
            class="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-[#1E293B] rounded text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-hidden"
          ></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-mono font-medium text-[#94A3B8] mb-1">Category</label>
            <select
              v-model="newTaskCategory"
              class="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-[#1E293B] rounded text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-hidden"
            >
              <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-mono font-medium text-[#94A3B8] mb-1">Est. Minutes</label>
            <input
              v-model.number="newTaskMinutes"
              type="number"
              min="5"
              max="240"
              step="5"
              class="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-[#1E293B] rounded text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-hidden"
            />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#1E293B]">
          <button
            type="button"
            class="px-3 py-1.5 rounded text-xs text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] transition-colors cursor-pointer"
            @click="isAddingTask = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#38BDF8] text-[#0B0E14] hover:bg-[#0EA5E9] transition-colors cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5" /> Create Task
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>
