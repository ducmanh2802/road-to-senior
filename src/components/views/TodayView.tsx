import React, { useState } from 'react';
import { 
  Play, 
  Check, 
  FastForward, 
  FileEdit, 
  Plus, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { TaskCategory, TaskState } from '../../types';
import { 
  Button, 
  IconButton, 
  Badge, 
  BadgeVariant, 
  Card, 
  CardHeader, 
  CardTitle, 
  Input, 
  Textarea, 
  Select, 
  CodeBlock,
  Modal,
  StatusIndicator,
  EmptyState
} from '../ui';

interface TodayViewProps {
  onNavigate: (view: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ onNavigate }) => {
  const { currentDay, tasks, setTaskState, addTask, updateTaskNotes } = useLearning();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>('task-1');
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  
  // New task form state
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('JAVA');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskMinutes, setNewTaskMinutes] = useState<number>(30);

  const dayTasks = tasks.filter(t => t.dayNumber === currentDay || !t.dayNumber);

  const filteredTasks = dayTasks.filter(t => {
    if (filterCategory === 'ALL') return true;
    return t.category === filterCategory;
  });

  const completedCount = dayTasks.filter(t => t.state === 'COMPLETED').length;
  const inProgressCount = dayTasks.filter(t => t.state === 'IN_PROGRESS').length;

  const handleStartTask = (id: string) => {
    setTaskState(id, 'IN_PROGRESS');
    setExpandedTaskId(id);
  };

  const handleCompleteTask = (id: string) => {
    setTaskState(id, 'COMPLETED');
  };

  const handleSkipTask = (id: string) => {
    setTaskState(id, 'SKIPPED');
  };

  const handleOpenNote = (id: string, existingNote?: string) => {
    setEditingNotesTaskId(id);
    setNoteText(existingNote || '');
  };

  const handleSaveNote = (id: string) => {
    updateTaskNotes(id, noteText);
    setEditingNotesTaskId(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      dayNumber: currentDay,
      title: newTaskTitle,
      category: newTaskCategory,
      description: newTaskDesc,
      estimatedMinutes: newTaskMinutes,
      state: 'TODO'
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddingTask(false);
  };

  const getCategoryBadgeVariant = (cat: TaskCategory): { label: string; variant: BadgeVariant } => {
    const badges: Record<TaskCategory, { label: string; variant: BadgeVariant }> = {
      JAVA: { label: 'JAVA 21', variant: 'primary' },
      HANDS_ON: { label: 'HANDS-ON', variant: 'success' },
      DSA: { label: 'DSA', variant: 'primary' },
      SYSTEM_DESIGN: { label: 'SYSTEM DESIGN', variant: 'warning' },
      SPRING: { label: 'SPRING BOOT', variant: 'success' },
      MICROSERVICES: { label: 'MICROSERVICES', variant: 'warning' },
      CLAUDE_CODE: { label: 'CLAUDE CODE', variant: 'info' },
      ENGLISH: { label: 'TECH ENGLISH', variant: 'info' },
      REVIEW: { label: 'SPACED REVIEW', variant: 'warning' }
    };
    return badges[cat] || { label: cat, variant: 'default' };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Day Mission Header */}
      <Card variant="default" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
              <Zap className="w-4 h-4 text-[#38BDF8]" />
              <span>MISSION CONTROL · DAY {currentDay.toString().padStart(2, '0')} / 180</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight mt-1">
              Async Order Pipelines, Sliding Window & Transaction Proxy Lab
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Execute each engineering block in sequence. Practice hands-on code execution before active recall.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="md"
              icon={Plus}
              onClick={() => setIsAddingTask(true)}
            >
              Add Custom Task
            </Button>
          </div>
        </div>

        {/* Progress summary bar & Category Filter */}
        <div className="mt-5 pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-[#94A3B8]">
              Completed: <strong className="text-[#22C55E]">{completedCount}</strong> / {dayTasks.length}
            </span>
            <span className="text-[#94A3B8]">
              In Progress: <strong className="text-[#38BDF8]">{inProgressCount}</strong>
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {['ALL', 'JAVA', 'HANDS_ON', 'DSA', 'SYSTEM_DESIGN', 'ENGLISH', 'CLAUDE_CODE', 'REVIEW'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#38BDF8] text-[#0B0E14] font-bold'
                    : 'bg-[#0B0E14] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Task Creation Modal */}
      <Modal
        isOpen={isAddingTask}
        onClose={() => setIsAddingTask(false)}
        title="Create Engineering Task"
        subtitle={`Day ${currentDay} Sprint Item`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Build CompletableFuture Error Isolation Pipeline"
            required
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              value={newTaskCategory}
              onChange={e => setNewTaskCategory(e.target.value as TaskCategory)}
              options={[
                { value: 'JAVA', label: 'Java 21 & JVM' },
                { value: 'HANDS_ON', label: 'Hands-on Lab' },
                { value: 'DSA', label: 'DSA Practice' },
                { value: 'SYSTEM_DESIGN', label: 'System Design' },
                { value: 'SPRING', label: 'Spring Boot 3' },
                { value: 'MICROSERVICES', label: 'Microservices & Kafka' },
                { value: 'CLAUDE_CODE', label: 'Claude Code Agent' },
                { value: 'ENGLISH', label: 'Tech English' },
                { value: 'REVIEW', label: 'Spaced Review' },
              ]}
            />

            <Input
              label="Estimated Duration (Minutes)"
              type="number"
              min={5}
              max={240}
              value={newTaskMinutes}
              onChange={e => setNewTaskMinutes(Number(e.target.value))}
            />
          </div>

          <Textarea
            label="Description & Architectural Focus"
            placeholder="Describe the learning objective, profiling target, or engineering deliverable..."
            rows={3}
            value={newTaskDesc}
            onChange={e => setNewTaskDesc(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingTask(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks match filter"
          description="There are no engineering tasks found for this category today. Create a custom task or reset your filter."
          action={{ label: 'Reset Filter', onClick: () => setFilterCategory('ALL') }}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
          const isExpanded = expandedTaskId === task.id;
          const isEditingNotes = editingNotesTaskId === task.id;
          const categoryMeta = getCategoryBadgeVariant(task.category);

          return (
            <Card
              key={task.id}
              variant="default"
              padding="none"
              className={`transition-all overflow-hidden ${
                task.state === 'COMPLETED' 
                  ? 'border-[#22C55E]/30 opacity-80' 
                  : task.state === 'IN_PROGRESS'
                  ? 'border-[#38BDF8]/50 shadow-md shadow-[#38BDF8]/5'
                  : 'border-[#1E293B]'
              }`}
            >
              {/* Task Header Bar */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="pt-0.5">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                        task.state === 'COMPLETED'
                          ? 'bg-[#22C55E] border-[#22C55E] text-[#0B0E14]'
                          : 'border-[#334155] hover:border-[#38BDF8] text-transparent'
                      }`}
                      title={task.state === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Complete'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant={categoryMeta.variant} size="sm">
                        {categoryMeta.label}
                      </Badge>
                      <StatusIndicator status={task.state} size="sm" />
                      <span className="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes} min
                      </span>
                    </div>

                    <h3 className={`text-sm font-semibold ${task.state === 'COMPLETED' ? 'line-through text-[#94A3B8]' : 'text-[#F8FAFC]'}`}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>

                {/* Task Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {task.state !== 'COMPLETED' && (
                    <>
                      {task.state !== 'IN_PROGRESS' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Play}
                          onClick={() => handleStartTask(task.id)}
                        >
                          Start
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          icon={Check}
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Complete
                        </Button>
                      )}

                      <IconButton
                        size="sm"
                        variant="secondary"
                        icon={FastForward}
                        label="Skip for today"
                        onClick={() => handleSkipTask(task.id)}
                      />
                    </>
                  )}

                  <IconButton
                    size="sm"
                    variant="secondary"
                    icon={FileEdit}
                    label="Edit engineering notes"
                    onClick={() => handleOpenNote(task.id, task.notes)}
                  />

                  <IconButton
                    size="sm"
                    variant="secondary"
                    icon={isExpanded ? ChevronUp : ChevronDown}
                    label={isExpanded ? 'Collapse' : 'Expand'}
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  />
                </div>
              </div>

              {/* Expandable Body: Code Snippet & Notes */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-[#1E293B]/60 mt-2 space-y-3 bg-[#0B0E14]/30">
                  {task.codeSnippet && (
                    <div className="mt-3">
                      <CodeBlock
                        code={task.codeSnippet}
                        language="java"
                        filename="VirtualThreadAsyncService.java"
                        showLineNumbers
                      />
                    </div>
                  )}

                  {/* Notes display */}
                  {task.notes && !isEditingNotes && (
                    <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded text-xs">
                      <div className="text-[10px] font-mono text-[#94A3B8] uppercase font-semibold mb-1">
                        ENGINEERING NOTES
                      </div>
                      <p className="text-[#E5E7EB] whitespace-pre-wrap font-sans leading-relaxed">
                        {task.notes}
                      </p>
                    </div>
                  )}

                  {/* Notes Editor */}
                  {isEditingNotes && (
                    <div className="space-y-2 mt-2">
                      <Textarea
                        label="EDIT NOTES"
                        rows={3}
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="Log your implementation observations, edge cases, or profiling results..."
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNotesTaskId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveNote(task.id)}
                        >
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
};

