import { AI_SENIOR_JAVA_ITEMS } from '../../data/aiSeniorJava';
import { TECHNICAL_ENGLISH_ITEMS } from '../../data/technicalEnglish';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  LearningTask,
  TaskState,
  RoadmapDay,
  KnowledgeTopic,
  ReviewCard,
  ReviewGrade,
  DSAProblem,
  ProjectFeature,
  IncidentScenario,
  InterviewQuestion,
  CompetencyReadiness,
} from '../../types';
import { calculateSm2Review } from '../../engines/sm2';
import {
  INITIAL_ROADMAP_DAYS,
  INITIAL_TASKS,
  INITIAL_KNOWLEDGE_TOPICS,
  INITIAL_REVIEW_CARDS,
  INITIAL_DSA_PROBLEMS,
  INITIAL_PROJECT_FEATURES,
  INITIAL_INCIDENTS,
  INITIAL_INTERVIEW_QUESTIONS,
} from '../../data/seedData';
import { calculateCompetencies, findWeakestDimension } from '../../engines/competency';

export const STORAGE_KEY = 'SENIOR_JAVA_180_STATE_V1';

export interface NextActionInfo {
  title: string;
  category: string;
  description: string;
  targetRoute: string;
  actionLabel: string;
}

export const useLearningStore = defineStore('learning', () => {
  const currentDay = ref<number>(37);
  const streak = ref<number>(14);
  const studyTimeMinutes = ref<number>(142);

  const tasks = ref<LearningTask[]>([]);
  const roadmapDays = ref<RoadmapDay[]>([]);
  const knowledgeTopics = ref<KnowledgeTopic[]>([]);
  const reviewCards = ref<ReviewCard[]>([]);
  const dsaProblems = ref<DSAProblem[]>([]);
  const projectFeatures = ref<ProjectFeature[]>([]);
  const incidents = ref<IncidentScenario[]>([]);
  const interviewQuestions = ref<InterviewQuestion[]>([...INITIAL_INTERVIEW_QUESTIONS]);
  const completedAiTopicIds = ref<string[]>([]);
  const completedEnglishItemIds = ref<string[]>([]);
  // P0 Java Core Tracking: completed module IDs (only when assessment >= 80% and failure lab completed)
  const completedJavaModuleIds = ref<string[]>([]);
  // Record completed stages per module (e.g., '1.1': ['learn', 'build', 'break', 'observe', 'debug', 'fix', 'benchmark', 'design', 'explain', 'defend', 'assess'])
  const javaModuleStageProgress = ref<Record<string, string[]>>({});
  // Module assessment scores
  const javaModuleAssessmentScores = ref<Record<string, number>>({});

  const status = ref<'loading' | 'error' | 'empty' | 'success'>('loading');
  const errorMessage = ref<string | null>(null);
  const errorDetail = ref<string | undefined>(undefined);

  function saveToStorage(): void {
    try {
      const payload = {
        currentDay: currentDay.value,
        streak: streak.value,
        studyTimeMinutes: studyTimeMinutes.value,
        tasks: tasks.value,
        roadmapDays: roadmapDays.value,
        knowledgeTopics: knowledgeTopics.value,
        reviewCards: reviewCards.value,
        dsaProblems: dsaProblems.value,
        projectFeatures: projectFeatures.value,
        incidents: incidents.value,
        interviewQuestions: interviewQuestions.value,
        completedAiTopicIds: completedAiTopicIds.value,
        completedEnglishItemIds: completedEnglishItemIds.value,
        completedJavaModuleIds: completedJavaModuleIds.value,
        javaModuleStageProgress: javaModuleStageProgress.value,
        javaModuleAssessmentScores: javaModuleAssessmentScores.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  function resetToDemo(): void {
    currentDay.value = 37;
    streak.value = 14;
    studyTimeMinutes.value = 142;
    tasks.value = [...INITIAL_TASKS];
    roadmapDays.value = [...INITIAL_ROADMAP_DAYS];
    knowledgeTopics.value = [...INITIAL_KNOWLEDGE_TOPICS];
    reviewCards.value = [...INITIAL_REVIEW_CARDS];
    dsaProblems.value = [...INITIAL_DSA_PROBLEMS];
    projectFeatures.value = [...INITIAL_PROJECT_FEATURES];
    incidents.value = [...INITIAL_INCIDENTS];
    interviewQuestions.value = [...INITIAL_INTERVIEW_QUESTIONS];
    completedAiTopicIds.value = [];
    completedEnglishItemIds.value = [];
    completedJavaModuleIds.value = [];
    javaModuleStageProgress.value = {};
    javaModuleAssessmentScores.value = {};
    status.value = 'success';
    errorMessage.value = null;
    errorDetail.value = undefined;
    saveToStorage();
  }

  function loadFromStorage(): void {
    status.value = 'loading';
    errorMessage.value = null;
    errorDetail.value = undefined;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        currentDay.value = typeof parsed.currentDay === 'number' ? parsed.currentDay : 37;
        streak.value = typeof parsed.streak === 'number' ? parsed.streak : 14;
        studyTimeMinutes.value = typeof parsed.studyTimeMinutes === 'number' ? parsed.studyTimeMinutes : 142;
        tasks.value = Array.isArray(parsed.tasks) ? parsed.tasks : [...INITIAL_TASKS];
        roadmapDays.value = Array.isArray(parsed.roadmapDays) ? parsed.roadmapDays : [...INITIAL_ROADMAP_DAYS];
        knowledgeTopics.value = Array.isArray(parsed.knowledgeTopics) ? parsed.knowledgeTopics : [...INITIAL_KNOWLEDGE_TOPICS];
        reviewCards.value = Array.isArray(parsed.reviewCards) ? parsed.reviewCards : [...INITIAL_REVIEW_CARDS];
        dsaProblems.value = Array.isArray(parsed.dsaProblems) ? parsed.dsaProblems : [...INITIAL_DSA_PROBLEMS];
        projectFeatures.value = Array.isArray(parsed.projectFeatures) ? parsed.projectFeatures : [...INITIAL_PROJECT_FEATURES];
        incidents.value = Array.isArray(parsed.incidents) ? parsed.incidents : [...INITIAL_INCIDENTS];
        interviewQuestions.value = Array.isArray(parsed.interviewQuestions)
          ? parsed.interviewQuestions
          : [...INITIAL_INTERVIEW_QUESTIONS];
        completedAiTopicIds.value = Array.isArray(parsed.completedAiTopicIds) ? parsed.completedAiTopicIds : [];
        completedEnglishItemIds.value = Array.isArray(parsed.completedEnglishItemIds) ? parsed.completedEnglishItemIds : [];
        completedJavaModuleIds.value = Array.isArray(parsed.completedJavaModuleIds) ? parsed.completedJavaModuleIds : [];
        javaModuleStageProgress.value = (parsed.javaModuleStageProgress && typeof parsed.javaModuleStageProgress === 'object') ? parsed.javaModuleStageProgress : {};
        javaModuleAssessmentScores.value = (parsed.javaModuleAssessmentScores && typeof parsed.javaModuleAssessmentScores === 'object') ? parsed.javaModuleAssessmentScores : {};
      } else {
        // Initialize from seed
        currentDay.value = 37;
        streak.value = 14;
        studyTimeMinutes.value = 142;
        tasks.value = [...INITIAL_TASKS];
        roadmapDays.value = [...INITIAL_ROADMAP_DAYS];
        knowledgeTopics.value = [...INITIAL_KNOWLEDGE_TOPICS];
        reviewCards.value = [...INITIAL_REVIEW_CARDS];
        dsaProblems.value = [...INITIAL_DSA_PROBLEMS];
        projectFeatures.value = [...INITIAL_PROJECT_FEATURES];
        incidents.value = [...INITIAL_INCIDENTS];
        interviewQuestions.value = [...INITIAL_INTERVIEW_QUESTIONS];
        completedAiTopicIds.value = [];
        completedEnglishItemIds.value = [];
        completedJavaModuleIds.value = [];
        javaModuleStageProgress.value = {};
        javaModuleAssessmentScores.value = {};
        saveToStorage();
      }

      if (tasks.value.length === 0 && knowledgeTopics.value.length === 0 && reviewCards.value.length === 0) {
        status.value = 'empty';
      } else {
        status.value = 'success';
      }
    } catch (err) {
      status.value = 'error';
      errorMessage.value = 'Failed to load learning state from local storage.';
      errorDetail.value = err instanceof Error ? err.stack || err.message : String(err);
    }
  }

  // Initialize immediately
  loadFromStorage();

  // ---- Task actions (mirror LearningContext.tsx semantics) ----

  /**
   * Create a task for the current roadmap day. New tasks start in TODO state;
   * `state`/`id`/`dayNumber` are owned by the store, not the caller.
   */
  function addTask(
    task: Pick<LearningTask, 'title' | 'description' | 'category' | 'estimatedMinutes'> &
      Partial<Pick<LearningTask, 'dayNumber' | 'state' | 'notes' | 'codeSnippet' | 'externalLink'>>
  ): LearningTask {
    const newTask: LearningTask = {
      ...task,
      id: 'task-' + Date.now(),
      dayNumber: task.dayNumber ?? currentDay.value,
      state: task.state ?? 'TODO',
    };
    tasks.value = [newTask, ...tasks.value];
    saveToStorage();
    return newTask;
  }

  function setTaskState(taskId: string, state: TaskState): void {
    tasks.value = tasks.value.map(t => {
      if (t.id !== taskId) return t;
      const isNowCompleted = state === 'COMPLETED';
      return {
        ...t,
        state,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      };
    });
    saveToStorage();
  }

  function updateTaskNotes(taskId: string, notes: string): void {
    tasks.value = tasks.value.map(t => (t.id === taskId ? { ...t, notes } : t));
    saveToStorage();
  }

  /**
   * Record a graded review: applies the deterministic SM-2 engine
   * (src/engines/sm2.ts) and appends to the card history. Mirrors
   * LearningContext.tsx recordReviewAnswer semantics.
   */
  function recordReviewAnswer(cardId: string, grade: ReviewGrade, durationSec: number): void {
    reviewCards.value = reviewCards.value.map(card => {
      if (card.id !== cardId) return card;
      const sm2Result = calculateSm2Review(card, grade);
      return {
        ...card,
        ...sm2Result,
        history: [
          ...card.history,
          {
            date: sm2Result.lastReviewedAt,
            grade,
            durationSec,
          },
        ],
      };
    });
    saveToStorage();
  }

  /**
   * Create a due-now review card from a mistake (e.g. failed interview
   * question). Mirrors LearningContext.tsx createReviewCardFromMistake.
   */
  function createReviewCardFromMistake(question: string, expectedAnswer: string, category: string): void {
    const newCard: ReviewCard = {
      id: 'card-err-' + Date.now(),
      category: category.toUpperCase(),
      question,
      expectedAnswer,
      intervalDays: 1,
      repetitionCount: 0,
      easeFactor: 2.2,
      nextReviewAt: new Date().toISOString(),
      history: [],
    };
    reviewCards.value = [newCard, ...reviewCards.value];
    saveToStorage();
  }

  // Derived state
  const daysRemaining = computed(() => Math.max(0, 180 - currentDay.value));

  const completedTasksCount = computed(
    () => tasks.value.filter((t) => t.state === 'COMPLETED').length
  );
  const totalTasksCount = computed(() => tasks.value.length);

  const dueReviewsCount = computed(() => {
    const now = new Date();
    return reviewCards.value.filter((c) => new Date(c.nextReviewAt) <= now).length;
  });

  const solvedDsaCount = computed(
    () => dsaProblems.value.filter((p) => p.attempts > 0).length
  );
  const masteredDsaCount = computed(
    () => dsaProblems.value.filter((p) => p.mastered).length
  );

  const projectProgressPercent = computed(() => {
    let totalStages = 0;
    let completedStages = 0;
    projectFeatures.value.forEach((f) => {
      Object.values(f.stages).forEach((val) => {
        totalStages++;
        if (val) completedStages++;
      });
    });
    return totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  });

  const competencies = computed<CompetencyReadiness[]>(() =>
    calculateCompetencies(knowledgeTopics.value)
  );

  const weakest = computed(() => findWeakestDimension(knowledgeTopics.value));

  const nextAction = computed<NextActionInfo>(() => {
    // 1. Check for unresolved P0 incidents
    const unresolvedP0 = incidents.value.find(
      (i) => i.status !== 'RESOLVED' && i.severity.startsWith('P0')
    );
    if (unresolvedP0) {
      return {
        title: 'Break The System Incident Active',
        category: 'INCIDENT_LAB',
        description: `Triage P0 incident: ${unresolvedP0.title}`,
        targetRoute: '/build/break-debug',
        actionLabel: 'Triage Incident',
      };
    }

    // 2. Check overdue review cards
    const now = new Date();
    const dueReviews = reviewCards.value.filter((c) => new Date(c.nextReviewAt) <= now);
    if (dueReviews.length > 0) {
      return {
        title: `${dueReviews.length} Spaced Repetition Cards Due`,
        category: 'REVIEW',
        description: 'Complete active recall flashcards to reinforce memory retention.',
        targetRoute: '/review',
        actionLabel: 'Start Spaced Review',
      };
    }

    // 3. Check for weakest knowledge dimension
    const weak = weakest.value;
    if (weak && weak.score <= 2) {
      return {
        title: `Remediate Weak Dimension: ${weak.dimension.toUpperCase()}`,
        category: 'KNOWLEDGE',
        description: `${weak.topicTitle} is lagging on ${weak.dimension}. Recommended: ${weak.action}`,
        targetRoute: '/learning',
        actionLabel: 'Strengthen Concept',
      };
    }

    // 4. In-progress or next TODO task
    const activeTask =
      tasks.value.find((t) => t.state === 'IN_PROGRESS') ||
      tasks.value.find((t) => t.state === 'TODO');
    if (activeTask) {
      return {
        title: `Day ${currentDay.value} Core Task: ${activeTask.title}`,
        category: activeTask.category,
        description: activeTask.description,
        targetRoute: '/learning/java',
        actionLabel: 'Continue Task',
      };
    }

    return {
      title: 'Practice System Design or Mock Interview',
      category: 'INTERVIEW',
      description: 'Daily tasks complete! Run a 45-minute timed System Design architecture round.',
      targetRoute: '/learning/system-design',
      actionLabel: 'Launch System Design',
    };
  });

  function setCurrentDay(day: number): void {
    if (day >= 1 && day <= 180) {
      currentDay.value = day;
      saveToStorage();
    }
  }

  function exportDataAsJson(): string {
    const data = {
      currentDay: currentDay.value,
      streak: streak.value,
      studyTimeMinutes: studyTimeMinutes.value,
      tasks: tasks.value,
      roadmapDays: roadmapDays.value,
      knowledgeTopics: knowledgeTopics.value,
      reviewCards: reviewCards.value,
      dsaProblems: dsaProblems.value,
      projectFeatures: projectFeatures.value,
      incidents: incidents.value,
      completedAiTopicIds: completedAiTopicIds.value,
      completedEnglishItemIds: completedEnglishItemIds.value,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  function importDataFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return false;
      }
      if (typeof parsed.currentDay === 'number' && parsed.currentDay >= 1 && parsed.currentDay <= 180) {
        currentDay.value = parsed.currentDay;
      }
      if (typeof parsed.streak === 'number') streak.value = parsed.streak;
      if (typeof parsed.studyTimeMinutes === 'number') studyTimeMinutes.value = parsed.studyTimeMinutes;
      if (Array.isArray(parsed.tasks)) tasks.value = parsed.tasks;
      if (Array.isArray(parsed.roadmapDays)) roadmapDays.value = parsed.roadmapDays;
      if (Array.isArray(parsed.knowledgeTopics)) knowledgeTopics.value = parsed.knowledgeTopics;
      if (Array.isArray(parsed.reviewCards)) reviewCards.value = parsed.reviewCards;
      if (Array.isArray(parsed.dsaProblems)) dsaProblems.value = parsed.dsaProblems;
      if (Array.isArray(parsed.projectFeatures)) projectFeatures.value = parsed.projectFeatures;
      if (Array.isArray(parsed.incidents)) incidents.value = parsed.incidents;
      if (Array.isArray(parsed.completedAiTopicIds)) completedAiTopicIds.value = parsed.completedAiTopicIds;
      if (Array.isArray(parsed.completedEnglishItemIds)) completedEnglishItemIds.value = parsed.completedEnglishItemIds;

      status.value = 'success';
      errorMessage.value = null;
      errorDetail.value = undefined;
      saveToStorage();
      return true;
    } catch {
      return false;
    }
  }

  const aiCompletedCount = computed(() => completedAiTopicIds.value.length);
  const aiTotalCount = computed(() => AI_SENIOR_JAVA_ITEMS.length);
  const aiProgressPercent = computed(() => {
    if (aiTotalCount.value === 0) return 0;
    return Math.round((aiCompletedCount.value / aiTotalCount.value) * 100);
  });

  function isAiTopicCompleted(topicId: string): boolean {
    return completedAiTopicIds.value.includes(topicId);
  }

  function toggleAiTopicCompletion(topicId: string): void {
    if (completedAiTopicIds.value.includes(topicId)) {
      completedAiTopicIds.value = completedAiTopicIds.value.filter((id) => id !== topicId);
    } else {
      completedAiTopicIds.value = [...completedAiTopicIds.value, topicId];
    }
    saveToStorage();
  }

  const englishCompletedCount = computed(() => completedEnglishItemIds.value.length);
  const englishTotalCount = computed(() => TECHNICAL_ENGLISH_ITEMS.length);
  const englishProgressPercent = computed(() => {
    if (englishTotalCount.value === 0) return 0;
    return Math.round((englishCompletedCount.value / englishTotalCount.value) * 100);
  });

  function isEnglishItemCompleted(itemId: string): boolean {
    return completedEnglishItemIds.value.includes(itemId);
  }

  function toggleEnglishItemCompletion(itemId: string): void {
    if (completedEnglishItemIds.value.includes(itemId)) {
      completedEnglishItemIds.value = completedEnglishItemIds.value.filter((id) => id !== itemId);
    } else {
      completedEnglishItemIds.value = [...completedEnglishItemIds.value, itemId];
    }
    saveToStorage();
  }

  // --- P0 Java Core Progress Logic ---
  const javaCompletedCount = computed(() => completedJavaModuleIds.value.length);
  const javaTotalCount = computed(() => 20); // 7 Language + 6 JVM + 7 Concurrency
  const javaProgressPercent = computed(() => {
    return Math.round((javaCompletedCount.value / javaTotalCount.value) * 100);
  });

  function isJavaModuleCompleted(moduleId: string): boolean {
    return completedJavaModuleIds.value.includes(moduleId);
  }

  function getModuleStagesCompleted(moduleId: string): string[] {
    return javaModuleStageProgress.value[moduleId] || [];
  }

  function recordJavaModuleStage(moduleId: string, stage: string): void {
    const existing = javaModuleStageProgress.value[moduleId] || [];
    if (!existing.includes(stage)) {
      javaModuleStageProgress.value = {
        ...javaModuleStageProgress.value,
        [moduleId]: [...existing, stage],
      };
      saveToStorage();
    }
  }

  function recordJavaAssessmentScore(moduleId: string, scorePercent: number, failureLabPassed: boolean): boolean {
    javaModuleAssessmentScores.value = {
      ...javaModuleAssessmentScores.value,
      [moduleId]: scorePercent,
    };

    // Strict completion standard: >= 80% AND mandatory failure-lab completion
    const stages = javaModuleStageProgress.value[moduleId] || [];
    const hasPassedBreakLab = stages.includes('break') || failureLabPassed;

    if (scorePercent >= 80 && hasPassedBreakLab) {
      if (!completedJavaModuleIds.value.includes(moduleId)) {
        completedJavaModuleIds.value = [...completedJavaModuleIds.value, moduleId];
      }
      saveToStorage();
      return true;
    }
    saveToStorage();
    return false;
  }

  return {
    currentDay,
    completedAiTopicIds,
    aiCompletedCount,
    aiTotalCount,
    aiProgressPercent,
    isAiTopicCompleted,
    toggleAiTopicCompletion,
    completedEnglishItemIds,
    englishCompletedCount,
    englishTotalCount,
    englishProgressPercent,
    isEnglishItemCompleted,
    toggleEnglishItemCompletion,
    completedJavaModuleIds,
    javaModuleStageProgress,
    javaModuleAssessmentScores,
    javaCompletedCount,
    javaTotalCount,
    javaProgressPercent,
    isJavaModuleCompleted,
    getModuleStagesCompleted,
    recordJavaModuleStage,
    recordJavaAssessmentScore,
    streak,
    studyTimeMinutes,
    tasks,
    roadmapDays,
    knowledgeTopics,
    reviewCards,
    dsaProblems,
    projectFeatures,
    incidents,
    interviewQuestions,
    status,
    errorMessage,
    errorDetail,
    loadFromStorage,
    resetToDemo,
    saveToStorage,
    setCurrentDay,
    exportDataAsJson,
    importDataFromJson,
    addTask,
    setTaskState,
    updateTaskNotes,
    recordReviewAnswer,
    createReviewCardFromMistake,
    daysRemaining,
    completedTasksCount,
    totalTasksCount,
    dueReviewsCount,
    solvedDsaCount,
    masteredDsaCount,
    projectProgressPercent,
    competencies,
    weakest,
    nextAction,
  };
});
