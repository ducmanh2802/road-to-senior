/**
 * Microservices curriculum authoring helpers.
 *
 * Every helper produces a COMPLETE content object (no optional-by-default
 * content, no placeholders): the only defaults applied are the real shared
 * execution commands from `shared.ts` (Maven wrapper, Docker Compose,
 * Testcontainers) and the standard reset/verification protocol.
 *
 * Rationale: 36 modules × complete lab specifications would otherwise repeat
 * the same command blocks hundreds of times.
 */
import type {
  MsAiReviewTask,
  MsAssessmentQuestion,
  MsAssessmentQuestionType,
  MsBenchmarkSpec,
  MsCodeLab,
  MsConceptExercise,
  MsCompetencyDimension,
  MsDebugExercise,
  MsDefenseQuestion,
  MsEnglishIntegration,
  MsEnglishVocabulary,
  MsExecutionMode,
  MsFailureLabSpec,
  MsModule,
  MsTestCase,
} from './types';
import { RESET_STANDARD, RUN_SPRING_SERVICE, VERIFY_INTEGRATION } from './shared';

export function concept(
  id: string,
  prompt: string,
  expectedInsight: string,
  dimension: MsCompetencyDimension
): MsConceptExercise {
  return { id, prompt, expectedInsight, dimension };
}

export function quiz(
  id: string,
  type: MsAssessmentQuestionType,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  codeSnippet?: string
): MsAssessmentQuestion {
  return { id, type, prompt, options, correctIndex, explanation, codeSnippet };
}

export function defense(
  id: string,
  question: string,
  modelAnswer: string,
  dimension: MsCompetencyDimension,
  rubric: string[]
): MsDefenseQuestion {
  return { id, question, modelAnswer, dimension, rubric };
}

export function debugEx(
  id: string,
  scenario: string,
  symptom: string,
  evidence: string[],
  task: string,
  expectedConclusion: string,
  commands: string[]
): MsDebugExercise {
  return { id, scenario, symptom, evidence, task, expectedConclusion, commands };
}

export function english(
  vocabulary: [string, string, string][],
  sentencePatterns: string[],
  architectureExplanation: string,
  incidentCommunication: [string, string][],
  codeReviewLanguage: string[],
  designDiscussion: string[],
  interviewQuestions: string[],
  sixtySecondExplanation: string
): MsEnglishIntegration {
  return {
    vocabulary: vocabulary.map(
      ([term, meaning, example]): MsEnglishVocabulary => ({ term, meaning, example })
    ),
    sentencePatterns,
    architectureExplanation,
    incidentCommunication: incidentCommunication.map(([situation, message]) => ({
      situation,
      message,
    })),
    codeReviewLanguage,
    designDiscussion,
    interviewQuestions,
    sixtySecondExplanation,
  };
}

export function aiReview(
  prompt: string,
  aiSuggestion: string,
  risksToCheck: string[],
  verificationSteps: string[],
  correctOutcome: string
): MsAiReviewTask {
  return { prompt, aiSuggestion, risksToCheck, verificationSteps, correctOutcome };
}

export interface LabInput {
  id: string;
  title: string;
  minutes: number;
  mode?: MsExecutionMode;
  objective: string;
  context: string;
  architecture: string;
  problem: string;
  starter: string;
  lang?: string;
  requirements: string[];
  constraints: string[];
  expectedBehaviour: string;
  testCases: [string, string][];
  hiddenFailures: string[];
  run?: string[];
  output: string;
  hints: string[];
  verification?: string;
  explanation: string;
  extension: string;
  reset?: string;
}

/** Builds a complete code-lab specification (spec §15 fields). */
export function lab(input: LabInput): MsCodeLab {
  const testCases: MsTestCase[] = input.testCases.map(([given, expect]) => ({ given, expect }));
  return {
    id: input.id,
    title: input.title,
    estimatedMinutes: input.minutes,
    executionMode: input.mode ?? 'REAL_EXECUTABLE',
    objective: input.objective,
    prerequisites: ['Java 25 · Spring Boot 4.1 toolchain', 'Docker engine running locally'],
    context: input.context,
    architecture: input.architecture,
    problemStatement: input.problem,
    starterCode: input.starter,
    starterLanguage: input.lang ?? 'java',
    requirements: input.requirements,
    constraints: input.constraints,
    expectedBehaviour: input.expectedBehaviour,
    testCases,
    hiddenFailureCases: input.hiddenFailures,
    runInstructions: input.run ?? RUN_SPRING_SERVICE,
    expectedOutput: input.output,
    hints: input.hints,
    resetSteps: input.reset ?? RESET_STANDARD,
    verification: input.verification ?? VERIFY_INTEGRATION,
    explanation: input.explanation,
    extensionChallenge: input.extension,
  };
}

export interface FailureInput {
  id: string;
  title: string;
  minutes: number;
  mode?: MsExecutionMode;
  bug: string;
  reproduce: string[];
  observe: string[];
  hypotheses: string[];
  correctHypothesis: number;
  hypothesisRejection: string[];
  investigate: [string, string, string][];
  debugOptions: string[];
  correctRootCause: number;
  fixOptions: string[];
  correctFix: number;
  fixRejection: string[];
  verify: [string, string, string][];
  explainPrompt: string;
  modelExplanation: string;
  patterns: string[];
  dimension: MsCompetencyDimension;
}

/**
 * Builds a complete failure lab: BUG → REPRODUCE → OBSERVE → HYPOTHESIS →
 * INVESTIGATE → DEBUG → FIX → VERIFY → EXPLAIN (spec §16). The root cause is
 * never revealed before the learner commits to a hypothesis.
 */
export function failure(input: FailureInput): MsFailureLabSpec {
  return {
    id: input.id,
    title: input.title,
    estimatedMinutes: input.minutes,
    executionMode: input.mode ?? 'REAL_EXECUTABLE',
    bug: input.bug,
    reproduce: input.reproduce,
    observe: input.observe,
    hypothesisOptions: input.hypotheses,
    correctHypothesisIndex: input.correctHypothesis,
    hypothesisRejection: input.hypothesisRejection,
    investigate: input.investigate.map(([command, output, insight]) => ({ command, output, insight })),
    debugOptions: input.debugOptions,
    correctRootCauseIndex: input.correctRootCause,
    fixOptions: input.fixOptions,
    correctFixIndex: input.correctFix,
    fixRejection: input.fixRejection,
    verify: input.verify.map(([command, output, insight]) => ({ command, output, insight })),
    explainPrompt: input.explainPrompt,
    modelExplanation: input.modelExplanation,
    relatedPatterns: input.patterns,
    dimension: input.dimension,
  };
}

export function benchmark(spec: MsBenchmarkSpec): MsBenchmarkSpec {
  return spec;
}

/** Identity helper that keeps each module literal type-checked at its definition. */
export function defineModule(module: MsModule): MsModule {
  return module;
}

