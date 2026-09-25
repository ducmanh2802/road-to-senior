/**
 * Microservices Engineering Track — deterministic engine.
 *
 * Framework-agnostic (no Vue imports) so it is unit-testable and reusable by
 * the Pinia store, the UI and the test suites. It reuses the existing
 * competency primitives (`evaluateTopicDimensions`, `CompetencyReadiness`)
 * instead of introducing a second competency model.
 */

import type { CompetencyReadiness } from '../types';
import { evaluateTopicDimensions } from './competency';
import type {
  MsCompetencyDimension,
  MsLoopStage,
  MsModule,
  MsModuleStatus,
  MsPhaseId,
  MsAssessmentQuestion,
} from '../data/microservices/types';

export const MS_LOOP_STAGES: MsLoopStage[] = [
  'learn',
  'code',
  'break',
  'observe',
  'debug',
  'fix',
  'benchmark',
  'design',
  'explain',
  'defend',
  'assess',
  'review',
];

export const MS_STAGE_LABELS: Record<MsLoopStage, string> = {
  learn: 'LEARN',
  code: 'CODE',
  break: 'BREAK',
  observe: 'OBSERVE',
  debug: 'DEBUG',
  fix: 'FIX',
  benchmark: 'BENCHMARK',
  design: 'DESIGN',
  explain: 'EXPLAIN',
  defend: 'DEFEND',
  assess: 'ASSESS',
  review: 'REVIEW',
};

/** Pass standard shared with the existing Java track: ≥80% + failure lab done. */
export const MS_PASS_THRESHOLD_PERCENT = 80;

/** Progress for a single module. One record per module — no second state model. */
export interface MsModuleProgressRecord {
  moduleId: string;
  stages: MsLoopStage[];
  startedAt?: string;
  updatedAt?: string;
  completedAt?: string;
  attempts: number;
  hintsUsed: number;
  codeLabCompletions: string[];
  benchmarksCompleted: string[];
  designsCompleted: string[];
  failureLabsPassed: string[];
  failureLabAttempts: number;
  incidentsResolved: string[];
  assessmentScore?: number;
  explanationScore?: number;
  defenseScore?: number;
}

export function createEmptyProgressRecord(moduleId: string, nowIso: string): MsModuleProgressRecord {
  return {
    moduleId,
    stages: [],
    startedAt: nowIso,
    updatedAt: nowIso,
    attempts: 0,
    hintsUsed: 0,
    codeLabCompletions: [],
    benchmarksCompleted: [],
    designsCompleted: [],
    failureLabsPassed: [],
    failureLabAttempts: 0,
    incidentsResolved: [],
  };
}

/**
 * Module status is derived, never stored twice:
 * LOCKED (missing prerequisite) → NOT_STARTED → IN_PROGRESS → COMPLETED.
 */
export function getModuleStatus(
  module: MsModule,
  record: MsModuleProgressRecord | undefined,
  completedModuleIds: readonly string[]
): MsModuleStatus {
  const unlocked = module.prerequisites.every((p) => completedModuleIds.includes(p));
  if (!unlocked) return 'LOCKED';
  if (completedModuleIds.includes(module.id)) return 'COMPLETED';
  if (!record) return 'NOT_STARTED';
  const touched =
    record.stages.length > 0 ||
    record.attempts > 0 ||
    record.assessmentScore !== undefined ||
    record.codeLabCompletions.length > 0;
  return touched ? 'IN_PROGRESS' : 'NOT_STARTED';
}

export function isModuleUnlocked(module: MsModule, completedModuleIds: readonly string[]): boolean {
  return module.prerequisites.every((p) => completedModuleIds.includes(p));
}

/** The first module a learner should be working on (skips locked and completed). */
export function findActiveModule(
  modules: readonly MsModule[],
  completedModuleIds: readonly string[],
  progress: Record<string, MsModuleProgressRecord>
): MsModule | null {
  const inProgress = modules.find(
    (m) =>
      isModuleUnlocked(m, completedModuleIds) &&
      !completedModuleIds.includes(m.id) &&
      getModuleStatus(m, progress[m.id], completedModuleIds) === 'IN_PROGRESS'
  );
  if (inProgress) return inProgress;
  return (
    modules.find(
      (m) =>
        isModuleUnlocked(m, completedModuleIds) && getModuleStatus(m, progress[m.id], completedModuleIds) === 'NOT_STARTED'
    ) ?? null
  );
}

export interface MsTrackProgress {
  completed: number;
  total: number;
  percent: number;
  byPhase: { phase: MsPhaseId; completed: number; total: number; percent: number }[];
  failureLabsPassed: number;
  failureLabsTotal: number;
  benchmarksCompleted: number;
  benchmarksTotal: number;
  designsCompleted: number;
  designsTotal: number;
  incidentsResolved: number;
  hintsUsed: number;
  attempts: number;
}

export function computeTrackProgress(
  modules: readonly MsModule[],
  progress: Record<string, MsModuleProgressRecord>,
  completedModuleIds: readonly string[]
): MsTrackProgress {
  const phases: MsPhaseId[] = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'];
  const records = Object.values(progress);

  const byPhase = phases.map((phase) => {
    const phaseModules = modules.filter((m) => m.phase === phase);
    const completed = phaseModules.filter((m) => completedModuleIds.includes(m.id)).length;
    return {
      phase,
      completed,
      total: phaseModules.length,
      percent: phaseModules.length === 0 ? 0 : Math.round((completed / phaseModules.length) * 100),
    };
  });

  const completed = modules.filter((m) => completedModuleIds.includes(m.id)).length;

  return {
    completed,
    total: modules.length,
    percent: modules.length === 0 ? 0 : Math.round((completed / modules.length) * 100),
    byPhase,
    failureLabsPassed: records.reduce((acc, r) => acc + r.failureLabsPassed.length, 0),
    failureLabsTotal: modules.reduce((acc, m) => acc + m.failureLabs.length, 0),
    benchmarksCompleted: records.reduce((acc, r) => acc + r.benchmarksCompleted.length, 0),
    benchmarksTotal: modules.filter((m) => m.benchmark).length,
    designsCompleted: records.reduce((acc, r) => acc + r.designsCompleted.length, 0),
    designsTotal: modules.filter((m) => m.architectureChallenge).length,
    incidentsResolved: records.reduce((acc, r) => acc + r.incidentsResolved.length, 0),
    hintsUsed: records.reduce((acc, r) => acc + r.hintsUsed, 0),
    attempts: records.reduce((acc, r) => acc + r.attempts, 0),
  };
}

export const MS_COMPETENCY_DIMENSIONS: MsCompetencyDimension[] = [
  'architecture',
  'implementation',
  'distributed-systems',
  'reliability',
  'data',
  'performance',
  'observability',
  'kubernetes',
  'debugging',
  'communication',
  'system-design',
  'production-engineering',
];

export function msDimensionLabel(dimension: string): string {
  return dimension
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function clamp1to5(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value * 100) / 100));
}

/** Maps real lab evidence onto the existing 6 mastery dimensions. */
export function deriveMasteryDimensions(record: MsModuleProgressRecord | undefined) {
  if (!record) {
    return { theory: 1, handsOn: 1, recall: 1, explanation: 1, debugging: 1, interview: 1 };
  }
  const has = (stage: MsLoopStage) => record.stages.includes(stage);

  const theory = 1 + (has('learn') ? 1.5 : 0) + (has('explain') ? 1 : 0.5);
  const handsOn =
    1 +
    Math.min(2, record.codeLabCompletions.length) +
    (has('code') ? 0.5 : 0) +
    (has('fix') ? 0.5 : 0);
  const recall = record.assessmentScore !== undefined ? 1 + record.assessmentScore / 25 : 1;
  const explanation = record.explanationScore !== undefined ? 1 + record.explanationScore / 25 : 1;
  const debugging =
    1 + Math.min(2, record.failureLabsPassed.length) + (record.failureLabAttempts > 0 ? 0.5 : 0);
  const interview = record.defenseScore !== undefined ? 1 + record.defenseScore / 25 : 1;

  return {
    theory: clamp1to5(theory),
    handsOn: clamp1to5(handsOn),
    recall: clamp1to5(recall),
    explanation: clamp1to5(explanation),
    debugging: clamp1to5(debugging),
    interview: clamp1to5(interview),
  };
}

/** Mastery average (1-5) of one module, evidence-based. */
export function moduleMasteryAverage(record: MsModuleProgressRecord | undefined): number {
  if (!record) return 1;
  return evaluateTopicDimensions(deriveMasteryDimensions(record), {
    theory: 1,
    handsOn: 1,
    recall: 1,
    explanation: 1,
    debugging: 1,
    interview: 1,
  }).averageScore;
}

function moduleDimensions(module: MsModule): MsCompetencyDimension[] {
  const dims = new Set<MsCompetencyDimension>();
  module.conceptExercises.forEach((e) => dims.add(e.dimension));
  module.defenseQuestions.forEach((q) => dims.add(q.dimension));
  module.failureLabs.forEach((l) => dims.add(l.dimension));
  return [...dims];
}

/**
 * The 12 Microservices competency dimensions, derived through the existing
 * competency evaluation logic (`evaluateTopicDimensions`) — one engine, not two.
 */
export function calculateMsCompetencies(
  modules: readonly MsModule[],
  progress: Record<string, MsModuleProgressRecord>
): CompetencyReadiness[] {
  return MS_COMPETENCY_DIMENSIONS.map((dimension) => {
    const contributors = modules.filter((m) => moduleDimensions(m).includes(dimension));
    if (contributors.length === 0) {
      return {
        name: msDimensionLabel(dimension),
        score: 0,
        totalTopics: 0,
        masteredTopics: 0,
        weakestDimension: 'theory',
        level: 'Novice' as const,
      };
    }

    let total = 0;
    let mastered = 0;
    const dimTotals = { theory: 0, handsOn: 0, recall: 0, explanation: 0, debugging: 0, interview: 0 };

    contributors.forEach((module) => {
      const dims = deriveMasteryDimensions(progress[module.id]);
      const evaluation = evaluateTopicDimensions(dims, {
        theory: 1,
        handsOn: 1,
        recall: 1,
        explanation: 1,
        debugging: 1,
        interview: 1,
      });
      total += evaluation.averageScore;
      if (evaluation.status === 'MASTERED') mastered++;
      dimTotals.theory += dims.theory;
      dimTotals.handsOn += dims.handsOn;
      dimTotals.recall += dims.recall;
      dimTotals.explanation += dims.explanation;
      dimTotals.debugging += dims.debugging;
      dimTotals.interview += dims.interview;
    });

    const percent = Math.min(100, Math.max(0, Math.round((total / (contributors.length * 5)) * 100)));

    let weakest = 'theory';
    let min = Infinity;
    (Object.entries(dimTotals) as [string, number][]).forEach(([key, value]) => {
      if (value < min) {
        min = value;
        weakest = key;
      }
    });

    let level: CompetencyReadiness['level'] = 'Novice';
    if (percent >= 85) level = 'Senior Ready';
    else if (percent >= 70) level = 'Advanced';
    else if (percent >= 50) level = 'Competent';

    return {
      name: msDimensionLabel(dimension),
      score: percent,
      totalTopics: contributors.length,
      masteredTopics: mastered,
      weakestDimension: weakest,
      level,
    };
  });
}

export interface MsAssessmentResult {
  correctCount: number;
  total: number;
  scorePercent: number;
  passed: boolean;
  weakQuestionIds: string[];
}

/** Deterministic grading — no AI grading, no invented partial credit. */
export function scoreMsAssessment(
  questions: readonly MsAssessmentQuestion[],
  answers: Record<number, number>
): MsAssessmentResult {
  let correctCount = 0;
  const weakQuestionIds: string[] = [];

  questions.forEach((question, index) => {
    if (answers[index] === question.correctIndex) {
      correctCount++;
    } else {
      weakQuestionIds.push(question.id);
    }
  });

  const total = questions.length;
  const scorePercent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return {
    correctCount,
    total,
    scorePercent,
    passed: scorePercent >= MS_PASS_THRESHOLD_PERCENT,
    weakQuestionIds,
  };
}

/** Applicable loop stages for a module (labs that do not exist are not required). */
export function applicableStages(module: MsModule): MsLoopStage[] {
  return MS_LOOP_STAGES.filter((stage) => {
    if (stage === 'code') return module.codeLabs.length > 0;
    if (stage === 'break') return module.failureLabs.length > 0;
    if (stage === 'benchmark') return Boolean(module.benchmark);
    if (stage === 'design') return Boolean(module.architectureChallenge);
    return true;
  });
}

export function stageProgressPercent(
  module: MsModule,
  record: MsModuleProgressRecord | undefined
): number {
  const applicable = applicableStages(module);
  if (applicable.length === 0) return 0;
  const done = applicable.filter((stage) => record?.stages.includes(stage)).length;
  return Math.round((done / applicable.length) * 100);
}

export function isModuleComplete(
  module: MsModule,
  record: MsModuleProgressRecord | undefined
): boolean {
  if (!record) return false;
  const requiredStages = applicableStages(module).filter((stage) => stage !== 'review');
  const stagesDone = requiredStages.every((stage) => record.stages.includes(stage));
  const failureLabsDone =
    module.failureLabs.length === 0 ||
    module.failureLabs.every((lab) => record.failureLabsPassed.includes(lab.id));
  const assessmentDone = (record.assessmentScore ?? 0) >= MS_PASS_THRESHOLD_PERCENT;
  return stagesDone && failureLabsDone && assessmentDone;
}

/** Lowest-scoring competency dimension with evidence (or null when untouched). */
export function findWeakestMsCompetency(
  competencies: readonly CompetencyReadiness[]
): CompetencyReadiness | null {
  const scored = competencies.filter((c) => c.totalTopics > 0);
  if (scored.length === 0) return null;
  return scored.reduce((weakest, current) => (current.score < weakest.score ? current : weakest), scored[0]);
}

export type MsNextActionKind =
  | 'review'
  | 'competency'
  | 'failure-lab'
  | 'module'
  | 'design'
  | 'defense'
  | 'capstone';

export interface MsNextAction {
  kind: MsNextActionKind;
  title: string;
  description: string;
  rationale: string;
  moduleId: string | null;
  stage: MsLoopStage | null;
  targetRoute: string;
  actionLabel: string;
}

export interface MsNextActionInput {
  modules: readonly MsModule[];
  progress: Record<string, MsModuleProgressRecord>;
  completedModuleIds: readonly string[];
  reviewCards: readonly { category: string; nextReviewAt: string; question: string }[];
  competencies: readonly CompetencyReadiness[];
  incidents: readonly { id: string; title: string; status: string; moduleId: string }[];
  nowIso: string;
}

/**
 * Today-ordering (spec §22): overdue review → open incident → weakest
 * competency → unfinished failure lab → current module → architecture
 * challenge → senior defense. Deterministic and fully unit-tested.
 */
export function selectMsNextAction(input: MsNextActionInput): MsNextAction {
  const now = new Date(input.nowIso).getTime();

  const overdue = input.reviewCards.filter(
    (card) => card.category === 'MICROSERVICES' && new Date(card.nextReviewAt).getTime() <= now
  );
  if (overdue.length > 0) {
    return {
      kind: 'review',
      title: `${overdue.length} Microservices review card(s) overdue`,
      description: overdue[0].question,
      rationale: 'Spaced recall beats re-reading: retrieve the failure mode before the interval decays.',
      moduleId: null,
      stage: 'review',
      targetRoute: '/review',
      actionLabel: 'Run spaced review',
    };
  }

  const openIncident = input.incidents.find((incident) => incident.status !== 'RESOLVED');
  if (openIncident) {
    return {
      kind: 'capstone',
      title: `Resolve production incident: ${openIncident.title}`,
      description: 'Observe → hypothesise → investigate → fix → verify → explain. Nothing is revealed for free.',
      rationale: 'An unresolved incident outranks study: production truth comes before new theory.',
      moduleId: openIncident.moduleId,
      stage: 'debug',
      targetRoute: '/learning/microservices',
      actionLabel: 'Triage incident',
    };
  }

  const weakest = findWeakestMsCompetency(input.competencies);
  if (weakest && weakest.score < 50) {
    const weakestKey = weakest.name.toLowerCase().replace(/\s+/g, '-');
    const target = input.modules.find((module) => {
      const record = input.progress[module.id];
      const untouched = !record || record.stages.length === 0;
      return (
        untouched &&
        isModuleUnlocked(module, input.completedModuleIds) &&
        module.conceptExercises.some((exercise) => exercise.dimension === weakestKey)
      );
    });
    return {
      kind: 'competency',
      title: `Raise weakest Microservices competency: ${weakest.name}`,
      description: `Score ${weakest.score}% across ${weakest.totalTopics} module(s); weakest mastery dimension is ${weakest.weakestDimension}.`,
      rationale: 'Deliberate practice targets the lowest measured dimension, not the most comfortable one.',
      moduleId: target?.id ?? null,
      stage: target ? 'learn' : null,
      targetRoute: '/learning/microservices',
      actionLabel: 'Practise weakest dimension',
    };
  }

  const inProgress = input.modules.find(
    (module) =>
      isModuleUnlocked(module, input.completedModuleIds) &&
      !input.completedModuleIds.includes(module.id) &&
      getModuleStatus(module, input.progress[module.id], input.completedModuleIds) === 'IN_PROGRESS'
  );

  if (inProgress) {
    const record = input.progress[inProgress.id];
    const pendingLab = inProgress.failureLabs.find(
      (lab) => !record?.failureLabsPassed.includes(lab.id)
    );
    if (pendingLab) {
      return {
        kind: 'failure-lab',
        title: `Unfinished failure lab: ${pendingLab.title}`,
        description: `Module ${inProgress.id} — ${inProgress.title}. Reproduce the bug before reading any explanation.`,
        rationale: 'A failure lab you skipped is a debugging muscle you never trained.',
        moduleId: inProgress.id,
        stage: 'break',
        targetRoute: '/learning/microservices',
        actionLabel: 'Open failure lab',
      };
    }

    const nextStage = applicableStages(inProgress).find((stage) => !record?.stages.includes(stage));
    if (nextStage) {
      return {
        kind: 'module',
        title: `Continue ${inProgress.id}: ${MS_STAGE_LABELS[nextStage]} stage`,
        description: inProgress.learningObjective,
        rationale: 'Finish the loop you started before opening a new module.',
        moduleId: inProgress.id,
        stage: nextStage,
        targetRoute: '/learning/microservices',
        actionLabel: `Go to ${MS_STAGE_LABELS[nextStage]}`,
      };
    }

    if (
      inProgress.architectureChallenge &&
      !record?.designsCompleted.includes(inProgress.architectureChallenge.id)
    ) {
      return {
        kind: 'design',
        title: `Architecture challenge pending: ${inProgress.architectureChallenge.title}`,
        description: 'Design it yourself first — the reference answers come after, never before.',
        rationale: 'Design is a skill; reading someone else’s diagram is not designing.',
        moduleId: inProgress.id,
        stage: 'design',
        targetRoute: '/learning/microservices',
        actionLabel: 'Open architecture challenge',
      };
    }
  }

  const active = findActiveModule(input.modules, input.completedModuleIds, input.progress);
  if (active) {
    return {
      kind: 'module',
      title: `Start ${active.id}: ${active.title}`,
      description: active.whyItMatters,
      rationale: 'The next unlocked module is the only one whose prerequisites are satisfied.',
      moduleId: active.id,
      stage: 'learn',
      targetRoute: '/learning/microservices',
      actionLabel: 'Start module',
    };
  }

  const lastCompleted = [...input.completedModuleIds]
    .map((id) => input.modules.find((module) => module.id === id))
    .filter((module): module is MsModule => Boolean(module))
    .pop();

  if (lastCompleted && input.progress[lastCompleted.id]?.defenseScore === undefined) {
    return {
      kind: 'defense',
      title: `Senior defense drill pending: ${lastCompleted.title}`,
      description: 'Answer the adversarial questions out loud, then score yourself against the rubric.',
      rationale: 'You only own an architecture decision you can defend under pressure.',
      moduleId: lastCompleted.id,
      stage: 'defend',
      targetRoute: '/learning/microservices',
      actionLabel: 'Run defense drill',
    };
  }

  return {
    kind: 'capstone',
    title: 'M8.5 Production Incident Simulation',
    description: 'Checkout is degraded in production. Observe, hypothesise, investigate, fix, verify, defend.',
    rationale: 'The final assessment is an operation, not a quiz.',
    moduleId: 'M8.5',
    stage: 'break',
    targetRoute: '/learning/microservices',
    actionLabel: 'Start final incident',
  };
}

export type MsWeaknessReason =
  | 'ASSESSMENT_FAILED'
  | 'FAILURE_LAB_FAILED'
  | 'DEFENSE_WEAK'
  | 'EXPLANATION_WEAK'
  | 'INCIDENT_FAILED';

/**
 * Deterministic weakness → SM-2 review card mapping. Cards created here are
 * scheduled by the existing `calculateSm2Review` engine — no second SRS.
 */
export function buildMsReviewCard(
  module: MsModule,
  reason: MsWeaknessReason
): { question: string; expectedAnswer: string; category: string } {
  const weakestDimension = module.defenseQuestions[0]?.dimension ?? 'architecture';

  switch (reason) {
    case 'ASSESSMENT_FAILED':
      return {
        question: `[${module.id}] Assessment failed — what is the core mechanism of "${module.title}" and what breaks first when it is wrong?`,
        expectedAnswer: `${module.explanation.internals} Failure surface: ${module.explanation.whatCanFail}`,
        category: 'MICROSERVICES',
      };
    case 'FAILURE_LAB_FAILED':
      return {
        question: `[${module.id}] Failure lab — reproduce from memory: ${
          module.failureLabs[0]?.bug ?? module.title
        }`,
        expectedAnswer: `Root cause: ${
          module.failureLabs[0]?.modelExplanation ?? module.explanation.howToFix
        }`,
        category: 'MICROSERVICES',
      };
    case 'DEFENSE_WEAK':
      return {
        question: `[${module.id}] Senior defense — ${
          module.defenseQuestions[0]?.question ?? 'defend this design decision'
        }`,
        expectedAnswer: module.defenseQuestions[0]?.modelAnswer ?? module.explanation.tradeoffs,
        category: 'MICROSERVICES',
      };
    case 'EXPLANATION_WEAK':
      return {
        question: `[${module.id}] Explain in 60 seconds: ${module.title} (${weakestDimension})`,
        expectedAnswer: module.english.sixtySecondExplanation,
        category: 'MICROSERVICES',
      };
    case 'INCIDENT_FAILED':
    default:
      return {
        question: `[${module.id}] Incident response — what is the first metric, first log field and first hypothesis you check?`,
        expectedAnswer: `Observe: ${module.explanation.howToObserve} Debug: ${module.explanation.howToDebug}`,
        category: 'MICROSERVICES',
      };
  }
}

/** Modules that train a given competency dimension (weakness → module routing). */
export function findModulesForDimension(
  modules: readonly MsModule[],
  dimension: string
): MsModule[] {
  return modules.filter(
    (module) =>
      module.conceptExercises.some((exercise) => exercise.dimension === dimension) ||
      module.defenseQuestions.some((question) => question.dimension === dimension)
  );
}



