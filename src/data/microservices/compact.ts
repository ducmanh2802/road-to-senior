/**
 * Compact module specification + expander.
 *
 * Authors write a compact, fully-typed literal; `expandModule` produces the
 * complete `MsModule` whose every field is authored content (no generated
 * prose). Structural boilerplate that is genuinely identical across the track
 * (prerequisites phrasing, Maven/Docker/Testcontainers commands, reset and
 * verification protocol) comes from `shared.ts`.
 */
import type {
  MsArchitectureChallenge,
  MsAssessmentQuestionType,
  MsBenchmarkSpec,
  MsCompetencyDimension,
  MsDebugExercise,
  MsLoopStage,
  MsModule,
  MsPhaseId,
  MsExecutionMode,
} from './types';
import { aiReview, defense, english, failure, lab, quiz, type FailureInput, type LabInput } from './authoring';

export type MsExplanationTuple = [
  string, // whatItIs
  string, // whyItExists
  string, // problemSolved
  string, // internals
  string, // runtimeBehaviour
  string, // tradeoffs
  string, // whatCanFail
  string, // howToObserve
  string, // howToDebug
  string, // howToFix
  string, // whenNotToUse
  string, // seniorQuestion
];

export type MsEnglishTuple = Parameters<typeof english>;
export type MsAiTuple = Parameters<typeof aiReview>;
export type MsQuizTuple = [
  MsAssessmentQuestionType,
  string,
  string[],
  number,
  string,
  string?,
];

export interface CompactModuleSpec {
  id: string;
  phase: MsPhaseId;
  order: number;
  title: string;
  subtitle: string;
  minutes: number;
  prerequisites: string[];
  objective: string;
  stack: string[];
  mode?: MsExecutionMode;
  why: string;
  explanation: MsExplanationTuple;
  keys: string[];
  concepts: [string, string, MsCompetencyDimension][];
  labs: LabInput[];
  debug: MsDebugExercise[];
  failures: FailureInput[];
  benchmark?: MsBenchmarkSpec;
  design?: MsArchitectureChallenge;
  defense: [string, string, MsCompetencyDimension, string[]][];
  english: MsEnglishTuple;
  ai: MsAiTuple;
  quiz: MsQuizTuple[];
}

export function expandModule(spec: CompactModuleSpec): MsModule {
  const explanation = spec.explanation;
  return {
    id: spec.id,
    phase: spec.phase,
    order: spec.order,
    title: spec.title,
    subtitle: spec.subtitle,
    estimatedMinutes: spec.minutes,
    prerequisites: spec.prerequisites,
    learningObjective: spec.objective,
    stackFocus: spec.stack,
    executionMode: spec.mode ?? 'REAL_EXECUTABLE',
    whyItMatters: spec.why,
    explanation: {
      whatItIs: explanation[0],
      whyItExists: explanation[1],
      problemSolved: explanation[2],
      internals: explanation[3],
      runtimeBehaviour: explanation[4],
      tradeoffs: explanation[5],
      whatCanFail: explanation[6],
      howToObserve: explanation[7],
      howToDebug: explanation[8],
      howToFix: explanation[9],
      whenNotToUse: explanation[10],
      seniorQuestion: explanation[11],
    },
    keyPoints: spec.keys,
    conceptExercises: spec.concepts.map(([prompt, expectedInsight, dimension], index) => ({
      id: `${spec.id}-C${index + 1}`,
      prompt,
      expectedInsight,
      dimension,
    })),
    codeLabs: spec.labs.map((input) => lab(input)),
    debuggingExercises: spec.debug,
    failureLabs: spec.failures.map((input) => failure(input)),
    benchmark: spec.benchmark,
    architectureChallenge: spec.design,
    defenseQuestions: spec.defense.map(([question, modelAnswer, dimension, rubric], index) =>
      defense(`${spec.id}-D${index + 1}`, question, modelAnswer, dimension, rubric)
    ),
    english: english(...spec.english),
    aiReview: aiReview(...spec.ai),
    assessment: spec.quiz.map(([type, prompt, options, correctIndex, explanation_, codeSnippet], index) =>
      quiz(`${spec.id}-A${index + 1}`, type, prompt, options, correctIndex, explanation_, codeSnippet)
    ),
  };
}

/** Every loop stage the UI must render for a module (used by tests and the page). */
export const MS_RENDERED_STAGES: MsLoopStage[] = [
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
