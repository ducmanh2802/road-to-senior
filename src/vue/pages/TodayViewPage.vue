<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-[#F8FAFC]">Today</h2>
      <Button variant="primary" size="sm" @click="isAddingTask = true">
        <Plus /> Create Task
      </Button>
    </div>

    <!-- Filter Buttons -->
    <div class="flex gap-2">
      <Button
        v-for="cat in filterCategories"
        :key="cat"
        :variant="filterCategory === cat ? 'primary' : 'ghost'"
        size="sm"
        @click="filterCategory = cat"
      >
        {{ cat }}
      </Button>
    </div>

    <!-- Add Task Modal -->
    <Modal :is-open="isAddingTask" title="Create New Task" @close="isAddingTask = false">
      <form @submit.prevent="handleCreateTask">
        <Input label="Title" v-model="newTaskTitle" required />
        <Textarea label="Description" v-model="newTaskDesc" :rows="3" />
        <Select label="Category" v-model="newTaskCategory">
          <option v-for="c in allCategories" :key="c" :value="c">{{ c }}</option>
        </Select>
        <div class="flex justify-end gap-2 pt-2 border-t border-[#1E293B]">
          <Button variant="ghost" size="sm" @click="isAddingTask = false">Cancel</Button>
          <Button type="submit" variant="primary" size="sm" :icon="Plus">Create Task</Button>
        </div>
      </form>
    </Modal>

    <!-- Task List -->
    <div v-if="filteredTasks.length === 0">
      <EmptyState
        title="No tasks match filter"
        description="There are no engineering tasks found for this category today. Create a custom task or reset your filter."
        action-label="Reset Filter"
        @action="filterCategory = 'ALL'"
      />
    </div>
    <div v-else class="space-y-3">
      <Card
        v-for="task in filteredTasks"
        :key="task.id"
        :variant="'default'"
        :padding="'none'"
        :class="cardClass(task)"
      >
        <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex items-start gap-3 flex-1">
            <button
              @click="handleCompleteTask(task.id)"
              :title="task.state === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Complete'"
              class="w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer"
              :class="task.state === 'COMPLETED' ? 'bg-[#22C55E] border-[#22C55E] text-[#0B0E14]' : 'border-[#334155] hover:border-[#38BDF8] text-transparent'"
            >
              <Check class="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <Badge :variant="categoryMeta(task.category).variant" size="sm">{{ categoryMeta(task.category).label }}</Badge>
                <StatusIndicator :status="task.state" size="sm" />
                <span class="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                  <Clock class="w-3 h-3" />{{ task.estimatedMinutes }} min
                </span>
              </div>

              <h3 :class="['text-sm font-semibold', task.state === 'COMPLETED' ? 'line-through text-[#94A3B8]' : 'text-[#F8FAFC]']">
                {{ task.title }}
              </h3>
              <p class="text-xs text-[#94A3B8] mt-0.5 line-clamp-2 leading-relaxed">
                {{ task.description }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end md:self-center shrink-0">
            <template v-if="task.state !== 'COMPLETED'">
              <Button
                v-if="task.state !== 'IN_PROGRESS'"
                size="sm"
                variant="outline"
                :icon="Play"
                @click="handleStartTask(task.id)"
              >Start</Button>
              <Button
                v-else
                size="sm"
                variant="success"
                :icon="Check"
                @click="handleCompleteTask(task.id)"
              >Complete</Button>
              <IconButton size="sm" variant="secondary" :icon="FastForward" label="Skip for today" @click="handleSkipTask(task.id)" />
            </template>
            <IconButton size="sm" variant="secondary" :icon="FileEdit" label="Edit engineering notes" @click="openNoteEditor(task.id, task.notes)" />
            <IconButton
              size="sm"
              variant="secondary"
              :icon="expandedTaskId === task.id ? ChevronUp : ChevronDown"
              :label="expandedTaskId === task.id ? 'Collapse' : 'Expand'"
              @click="toggleExpand(task.id)"
            />
          </div>
        </div>
        <div v-if="expandedTaskId === task.id" class="p-4 pt-0 border-t border-[#1E293B]/60 mt-2 space-y-3 bg-[#0B0E14]/30">
          <div v-if="task.codeSnippet" class="mt-3">
            <CodeBlock :code="task.codeSnippet" language="java" filename="VirtualThreadAsyncService.java" :showLineNumbers="true" />
          </div>
          <div v-if="task.notes && editingNotesTaskId !== task.id" class="p-3 bg-[#0B0E14] border border-[#1E293B] rounded text-xs">
            <div class="text-[10px] font-mono text-[#94A3B8] uppercase font-semibold mb-1">ENGINEERING NOTES</div>
            <p class="text-[#E5E7EB] whitespace-pre-wrap font-sans leading-relaxed">{{ task.notes }}</p>
          </div>
          <div v-else-if="editingNotesTaskId === task.id" class="space-y-2 mt-2">
            <Textarea label="EDIT NOTES" :rows="3" v-model="noteText" placeholder="Log your implementation observations, edge cases, or profiling results..." />
            <div class="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" @click="cancelEditNotes">Cancel</Button>
              <Button variant="primary" size="sm" @click="saveNotes(task.id)">Save Notes</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Play, Check, FastForward, FileEdit, ChevronUp, ChevronDown, Clock } from 'lucide-vue-next';
import { useLearningStore } from '../stores/learning';
import Button from '../components/ui/Button.vue';
import Modal from '../components/ui/Modal.vue';
import Card from '../components/ui/Card.vue';
import Badge from '../components/ui/Badge.vue';
import IconButton from '../components/ui/IconButton.vue';
import CodeBlock from '../components/ui/CodeBlock.vue';
import Textarea from '../components/ui/Textarea.vue';
import Input from '../components/ui/Input.vue';
import Select from '../components/ui/Select.vue';
import EmptyState from '../components/EmptyState.vue';
import StatusIndicator from '../components/ui/StatusIndicator.vue';
import type { TaskCategory, TaskState } from '../../types';

const store = useLearningStore();

// UI state
const filterCategory = ref<'ALL' | TaskCategory>('ALL');
const expandedTaskId = ref<string | null>(null);
const editingNotesTaskId = ref<string | null>(null);
const noteText = ref('');

// New task modal state
const isAddingTask = ref(false);
const newTaskTitle = ref('');
const newTaskDesc = ref('');
const newTaskCategory = ref<TaskCategory>('JAVA');

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
const filterCategories: Array<'ALL' | TaskCategory> = ['ALL', ...allCategories];

const filteredTasks = computed(() => {
  if (filterCategory.value === 'ALL') return store.tasks;
  return store.tasks.filter(t => t.category === filterCategory.value);
});

function cardClass(task: TaskStateHolder): string {
  if (task.state === 'COMPLETED') return 'border-[#22C55E]/30 opacity-80';
  if (task.state === 'IN_PROGRESS') return 'border-[#38BDF8]/50 shadow-md shadow-[#38BDF8]/5';
  return 'border-[#1E293B]';
}

interface TaskStateHolder {
  state: TaskState;
}

function categoryMeta(cat: TaskCategory): { variant: 'info' | 'warning' | 'success' | 'danger' | 'default' | 'primary' | 'purple' | 'cyan' | 'pink'; label: string } {
  const map: Record<TaskCategory, { variant: 'info' | 'warning' | 'success' | 'danger' | 'default' | 'primary' | 'purple' | 'cyan' | 'pink'; label: string }> = {
    JAVA: { variant: 'primary', label: 'Java' },
    HANDS_ON: { variant: 'cyan', label: 'Hands-on' },
    DSA: { variant: 'purple', label: 'DSA' },
    SYSTEM_DESIGN: { variant: 'info', label: 'System Design' },
    SPRING: { variant: 'success', label: 'Spring' },
    MICROSERVICES: { variant: 'warning', label: 'Microservices' },
    CLAUDE_CODE: { variant: 'pink', label: 'Claude Code' },
    ENGLISH: { variant: 'default', label: 'English' },
    REVIEW: { variant: 'danger', label: 'Review' },
  };
  return map[cat] ?? { variant: 'default', label: cat };
}

function handleStartTask(id: string): void {
  store.setTaskState(id, 'IN_PROGRESS');
}
function handleCompleteTask(id: string): void {
  const task = store.tasks.find(t => t.id === id);
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
function openNoteEditor(taskId: string, currentNotes: string | undefined): void {
  editingNotesTaskId.value = taskId;
  noteText.value = currentNotes ?? '';
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
    title: newTaskTitle.value,
    description: newTaskDesc.value,
    category: newTaskCategory.value,
    estimatedMinutes: 30,
  });
  newTaskTitle.value = '';
  newTaskDesc.value = '';
  newTaskCategory.value = 'JAVA';
  isAddingTask.value = false;
}
</script>

<style scoped>
/* Rely on design system */
</style>
