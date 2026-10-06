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
  TaskCategory,
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
import { ALL_MS_MODULES, ALL_MS_INCIDENTS } from '../../data/microservices';
import type { MsLoopStage } from '../../data/microservices/types';
import {
  createEmptyProgressRecord,
  computeTrackProgress,
  calculateMsCompetencies,
  isModuleComplete,
  normalizeMsProgressRecords,
  type MsModuleProgressRecord,
} from '../../engines/microservices';
import { JUDGMENT_SCENARIOS } from '../../data/judgmentScenarios';
import {
  computeJudgmentTrackProgress,
  evaluateJudgment,
  normalizeJudgmentRecords,
  selectJudgmentRemediation,
  type DecisionSubmission,
  type JudgmentAttemptRecord,
  type JudgmentEvaluation,
  type JudgmentScenario,
} from '../../engines/judgmentEngine';
import { evaluateCertification, type CertificationVerdict } from '../../engines/certificationEngine';

export const STORAGE_KEY = 'SENIOR_JAVA_180_STATE_V1';

export interface NextActionInfo {
  title: string;
  category: string;
  description: string;
  targetRoute: string;
  actionLabel: string;
}

export const useLearningStore = defineStore('learning', () => {
const completedAiTopicIds = ref<string[]>([]);
const completedEnglishItemIds = ref<string[]>([]);
const completedJavaModuleIds = ref<string[]>([]);

const javaModuleStageProgress = ref<Record<string, string[]>>({});
const javaModuleAssessmentScores = ref<Record<string, number>>({});
const msProgress = ref<Record<string, MsModuleProgressRecord>>({});
const judgmentRecords = ref<Record<string, JudgmentAttemptRecord>>({});
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
        // Evidence fields. These are ADDITIVE keys on the same
        // SENIOR_JAVA_180_STATE_V1 record — reading is version-tolerant
        // (absent => no evidence), so no destructive migration is required.
        completedAiTopicIds: completedAiTopicIds.value,
        completedEnglishItemIds: completedEnglishItemIds.value,
        completedJavaModuleIds: completedJavaModuleIds.value,
        javaModuleStageProgress: javaModuleStageProgress.value,
        javaModuleAssessmentScores: javaModuleAssessmentScores.value,
        msProgress: msProgress.value,
        judgmentRecords: judgmentRecords.value,
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
    msProgress.value = {};
    judgmentRecords.value = {};
    status.value = 'success';
    errorMessage.value = null;
    errorDetail.value = undefined;
    saveToStorage();
  }

  /**
   * Storage readers for evidence fields. They are deliberately tolerant:
   * a malformed or missing value yields "no evidence", never a fabricated
   * default. Reading is separated from validation on purpose so a corrupted
   * additive field can never take down the whole learner state.
   */
  function stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  }

  function stageProgressRecord(value: unknown): Record<string, string[]> {
    if (!value || typeof value !== 'object') return {};
    const result: Record<string, string[]> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, raw]) => {
      result[key] = stringArray(raw);
    });
    return result;
  }

  function scoreRecord(value: unknown): Record<string, number> {
    if (!value || typeof value !== 'object') return {};
    const result: Record<string, number> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, raw]) => {
      if (typeof raw === 'number' && Number.isFinite(raw)) result[key] = raw;
    });
    return result;
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

        // Evidence fields — read tolerantly. Absent key means "no evidence yet",
        // never a fabricated default score.
        completedAiTopicIds.value = stringArray(parsed.completedAiTopicIds);
        completedEnglishItemIds.value = stringArray(parsed.completedEnglishItemIds);
        completedJavaModuleIds.value = stringArray(parsed.completedJavaModuleIds);
        javaModuleStageProgress.value = stageProgressRecord(parsed.javaModuleStageProgress);
        javaModuleAssessmentScores.value = scoreRecord(parsed.javaModuleAssessmentScores);
        msProgress.value = normalizeMsProgressRecords(parsed.msProgress);
        judgmentRecords.value = normalizeJudgmentRecords(parsed.judgmentRecords);
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
        msProgress.value = {};
        judgmentRecords.value = {};
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
    // 0. Unresolved production incident in the Microservices track outranks
    //    everything: production truth before new theory.
    const openMsIncident = msOpenIncidents.value[0];
    if (openMsIncident) {
      return {
        title: `Triage ${openMsIncident.severity} incident: ${openMsIncident.title}`,
        category: 'INCIDENT_LAB',
        description: openMsIncident.symptomSummary,
        targetRoute: '/learning/microservices',
        actionLabel: 'Triage Incident',
      };
    }

    // 1. Check for unresolved P0 incidents
    const unresolvedP0 = incidents.value.find(
      (i) => i.status !== 'RESOLVED' && i.severity.startsWith('P0')
    );
    if (unresolvedP0) {
      return {
        title: 'Break The System Incident Active',
        category: 'INCIDENT_LAB',
        description: `Triage P0 incident: ${unresolvedP0.title}`,
        targetRoute: '/learning/microservices',
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
      description: 'Daily tasks complete! Run a 45-minute timed system design round and defend it out loud.',
      targetRoute: '/interview',
      actionLabel: 'Run Interview Round',
    };
  });

  // --- Microservices Engineering Track (Phase P0-W1: reachability remediation) ---
  //
  // This slice is the ONLY production caller of `src/engines/microservices.ts`.
  // Every write records real learner evidence and persists immediately.

  function getMsModuleRecord(moduleId: string): MsModuleProgressRecord | undefined {
    return msProgress.value[moduleId];
  }

  function ensureMsRecord(moduleId: string): MsModuleProgressRecord {
    const existing = msProgress.value[moduleId];
    if (existing) return existing;
    return createEmptyProgressRecord(moduleId, new Date().toISOString());
  }

  function commitMsRecord(
    moduleId: string,
    mutate: (record: MsModuleProgressRecord) => MsModuleProgressRecord
  ): void {
    const now = new Date().toISOString();
    const next = mutate(ensureMsRecord(moduleId));
    msProgress.value = {
      ...msProgress.value,
      [moduleId]: { ...next, updatedAt: now },
    };
    saveToStorage();
  }

  /** LOOP STAGE — records a completed engineering-loop stage. */
  function recordMsStage(moduleId: string, stage: MsLoopStage): void {
    commitMsRecord(moduleId, (record) =>
      record.stages.includes(stage) ? record : { ...record, stages: [...record.stages, stage] }
    );
  }

  function recordMsCodeLab(moduleId: string, labId: string): void {
    commitMsRecord(moduleId, (record) =>
      record.codeLabCompletions.includes(labId)
        ? record
        : {
            ...record,
            stages: record.stages.includes('code') ? record.stages : [...record.stages, 'code'],
            codeLabCompletions: [...record.codeLabCompletions, labId],
          }
    );
  }

  function recordMsFailureLab(moduleId: string, labId: string, passed: boolean): void {
    commitMsRecord(moduleId, (record) => ({
      ...record,
      stages: record.stages.includes('break') ? record.stages : [...record.stages, 'break'],
      failureLabAttempts: record.failureLabAttempts + 1,
      failureLabsPassed: passed
        ? Array.from(new Set([...record.failureLabsPassed, labId]))
        : record.failureLabsPassed,
    }));
  }

  function recordMsBenchmark(moduleId: string, title: string): void {
    commitMsRecord(moduleId, (record) => ({
      ...record,
      stages: record.stages.includes('benchmark') ? record.stages : [...record.stages, 'benchmark'],
      benchmarksCompleted: record.benchmarksCompleted.includes(title)
        ? record.benchmarksCompleted
        : [...record.benchmarksCompleted, title],
    }));
  }

  function recordMsDesign(moduleId: string, challengeId: string): void {
    commitMsRecord(moduleId, (record) => ({
      ...record,
      stages: record.stages.includes('design') ? record.stages : [...record.stages, 'design'],
      designsCompleted: record.designsCompleted.includes(challengeId)
        ? record.designsCompleted
        : [...record.designsCompleted, challengeId],
    }));
  }

  function recordMsIncident(moduleId: string, incidentId: string): void {
    commitMsRecord(moduleId, (record) => ({
      ...record,
      incidentsResolved: record.incidentsResolved.includes(incidentId)
        ? record.incidentsResolved
        : [...record.incidentsResolved, incidentId],
    }));
  }

  function recordMsAiChallenge(moduleId: string, prompt: string): void {
    commitMsRecord(moduleId, (record) => ({
      ...record,
      aiChallengesCompleted: record.aiChallengesCompleted.includes(prompt)
        ? record.aiChallengesCompleted
        : [...record.aiChallengesCompleted, prompt],
    }));
  }

  function recordMsHintUse(moduleId: string): void {
    commitMsRecord(moduleId, (record) => ({ ...record, hintsUsed: record.hintsUsed + 1 }));
  }

  /** EXPLANATION / DEFEND — self-scored against the module rubric (0-100). */
  function recordMsSelfScore(
    moduleId: string,
    stage: 'explain' | 'defend',
    scorePercent: number
  ): void {
    const clamped = Math.max(0, Math.min(100, Math.round(scorePercent)));
    commitMsRecord(moduleId, (record) => ({
      ...record,
      stages: record.stages.includes(stage) ? record.stages : [...record.stages, stage],
      ...(stage === 'explain' ? { explanationScore: clamped } : { defenseScore: clamped }),
    }));
  }

  /** ASSESS — records the graded score and pushes a weakness card when it fails. */
  function recordMsAssessmentScore(moduleId: string, scorePercent: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(scorePercent)));
    commitMsRecord(moduleId, (record) => ({
      ...record,
      stages: record.stages.includes('assess') ? record.stages : [...record.stages, 'assess'],
      assessmentScore: clamped,
      attempts: record.attempts + 1,
    }));
  }

const msModules = ALL_MS_MODULES;

  const msCompletedModuleIds = computed<string[]>(() =>
    msModules
      .filter((module) => isModuleComplete(module, msProgress.value[module.id]))
      .map((module) => module.id)
  );

  const msTrackProgress = computed(() =>
    computeTrackProgress(msModules, msProgress.value, msCompletedModuleIds.value)
  );

  const msCompetencies = computed<CompetencyReadiness[]>(() =>
    calculateMsCompetencies(msModules, msProgress.value)
  );

  const msOpenIncidents = computed(() => {
    const resolved = new Set(Object.values(msProgress.value).flatMap((r) => r.incidentsResolved));
    return ALL_MS_INCIDENTS.filter((incident) => !resolved.has(incident.id));
  });

  const msProgressPercent = computed(() => msTrackProgress.value.percent);

  // --- Phase A — Engineering Judgment -----------------------------------
  //
  // The store owns the *record*; the engine owns the *evaluation*. A record
  // only exists once the learner has actually submitted a decision.

  const judgmentScenarios: readonly JudgmentScenario[] = JUDGMENT_SCENARIOS;

  const judgmentProgress = computed(() =>
    computeJudgmentTrackProgress(JUDGMENT_SCENARIOS, judgmentRecords.value)
  );

  const judgmentRemediation = computed(() =>
    selectJudgmentRemediation(JUDGMENT_SCENARIOS, judgmentRecords.value)
  );

  /**
   * Records one decision attempt. Returns the full evaluation so the UI can
   * show the audit trail. Persisted immediately.
   */
  function submitJudgment(scenarioId: string, submission: DecisionSubmission): JudgmentEvaluation {
    const scenario = JUDGMENT_SCENARIOS.find((item) => item.id === scenarioId);
    if (!scenario) {
      throw new Error(`Unknown judgment scenario: ${scenarioId}`);
    }
    const evaluation = evaluateJudgment(scenario, submission);
    const record: JudgmentAttemptRecord = {
      scenarioId,
      level: evaluation.level,
      score: evaluation.score,
      correctDecision: evaluation.correctDecision,
      confidence: submission.confidence,
      calibrationVerdict: evaluation.calibrationVerdict,
      calibrationError: evaluation.calibrationError,
      attemptedAt: new Date().toISOString(),
    };
    judgmentRecords.value = { ...judgmentRecords.value, [scenarioId]: record };
    saveToStorage();
    return evaluation;
  }

// --- Phase Z — Senior Engineering Certification -----------------------
  //
  // Pure derivation: no score is stored, none is hardcoded. Recomputed from
  // the persisted evidence on every access.

  const certification = computed<CertificationVerdict>(() =>
    evaluateCertification({
      msModules: ALL_MS_MODULES,
      msProgress: msProgress.value,
      judgmentRecords: judgmentRecords.value,
      javaCompletedModuleIds: completedJavaModuleIds.value,
      javaModuleStageProgress: javaModuleStageProgress.value,
      completedEnglishItemIds: completedEnglishItemIds.value,
      completedEnglishTotal: TECHNICAL_ENGLISH_ITEMS.length,
      completedAiTopicIds: completedAiTopicIds.value,
      completedAiTotal: AI_SENIOR_JAVA_ITEMS.length,
      knowledgeTopicCount: knowledgeTopics.value.length,
      masteredKnowledgeTopicCount: knowledgeTopics.value.filter((topic) => topic.status === 'MASTERED').length,
      judgmentScenarioTotal: JUDGMENT_SCENARIOS.length,
    })
  );

  function setTaskState(taskId: string, state: TaskState): void {
    tasks.value = tasks.value.map((t) => {
      if (t.id === taskId) {
        const isNowCompleted = state === 'COMPLETED';
        return {
          ...t,
          state,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    saveToStorage();
  }

  function addTask(taskData: {
    title: string;
    description?: string;
    category?: TaskCategory;
    estimatedMinutes?: number;
    state?: TaskState;
    dayNumber?: number;
    notes?: string;
    codeSnippet?: string;
    externalLink?: string;
  }): LearningTask {
    const newTask: LearningTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dayNumber: taskData.dayNumber ?? currentDay.value,
      title: taskData.title,
      category: taskData.category ?? 'HANDS_ON',
      description: taskData.description ?? '',
      estimatedMinutes: taskData.estimatedMinutes ?? 30,
      state: taskData.state ?? 'TODO',
      notes: taskData.notes,
      codeSnippet: taskData.codeSnippet,
      externalLink: taskData.externalLink,
    };
    tasks.value = [newTask, ...tasks.value];
    saveToStorage();
    return newTask;
  }

  function updateTaskNotes(taskId: string, notes: string): void {
    tasks.value = tasks.value.map((t) => (t.id === taskId ? { ...t, notes } : t));
    saveToStorage();
  }




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
      completedJavaModuleIds: completedJavaModuleIds.value,
      javaModuleStageProgress: javaModuleStageProgress.value,
      javaModuleAssessmentScores: javaModuleAssessmentScores.value,
      msProgress: msProgress.value,
      judgmentRecords: judgmentRecords.value,
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
      if (Array.isArray(parsed.completedJavaModuleIds)) completedJavaModuleIds.value = parsed.completedJavaModuleIds;
      if (parsed.javaModuleStageProgress && typeof parsed.javaModuleStageProgress === 'object') {
        javaModuleStageProgress.value = stageProgressRecord(parsed.javaModuleStageProgress);
      }
      if (parsed.javaModuleAssessmentScores && typeof parsed.javaModuleAssessmentScores === 'object') {
        javaModuleAssessmentScores.value = scoreRecord(parsed.javaModuleAssessmentScores);
      }
      if (parsed.msProgress && typeof parsed.msProgress === 'object') {
        msProgress.value = normalizeMsProgressRecords(parsed.msProgress);
      }
      if (parsed.judgmentRecords && typeof parsed.judgmentRecords === 'object') {
        judgmentRecords.value = normalizeJudgmentRecords(parsed.judgmentRecords);
      }

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
    exportDataAsJson,
    importDataFromJson,
    saveToStorage,
    addTask,
    setTaskState,
    setCurrentDay,
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
    msModules,
    msProgress,
    msCompletedModuleIds,
    msTrackProgress,
    msProgressPercent,
    msCompetencies,
    msOpenIncidents,
    getMsModuleRecord,
    recordMsStage,
    recordMsCodeLab,
    recordMsFailureLab,
    recordMsBenchmark,
    recordMsDesign,
    recordMsIncident,
    recordMsAiChallenge,
    recordMsHintUse,
    recordMsSelfScore,
    recordMsAssessmentScore,
    judgmentScenarios,
    judgmentRecords,
    judgmentProgress,
    judgmentRemediation,
    submitJudgment,
    certification,
  };
});
