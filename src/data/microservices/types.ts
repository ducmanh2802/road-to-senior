/**
 * Microservices Engineering Track — canonical content model.
 *
 * The track is one continuous Senior-level apprenticeship built on a single
 * evolving E-commerce capstone (client → gateway → account/product/order/
 * inventory/payment/notification/mail services → PostgreSQL, MongoDB,
 * Elasticsearch, Redis, Kafka, Stripe, SendGrid, ELK, Kubernetes, Helm).
 *
 * Every module is authored against the mandatory engineering loop:
 * LEARN → CODE → BREAK → OBSERVE → DEBUG → FIX → BENCHMARK → DESIGN
 *       → EXPLAIN → DEFEND → ASSESS → REVIEW
 */

export type MsPhaseId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8';

/**
 * Honesty contract for every lab: how the lab can actually be executed.
 * - REAL_EXECUTABLE: source + commands can be run locally (Docker/Compose/Maven).
 * - SIMULATED: the browser cannot run the technology; the lab is an interactive
 *   reasoning simulation and is labelled as such (never presented as real output).
 * - SPECIFICATION: the lab is a written executable specification / design brief
 *   with no runtime to execute in this environment.
 */
export type MsExecutionMode = 'REAL_EXECUTABLE' | 'SIMULATED' | 'SPECIFICATION';

export type MsLoopStage =
  | 'learn'
  | 'code'
  | 'break'
  | 'observe'
  | 'debug'
  | 'fix'
  | 'benchmark'
  | 'design'
  | 'explain'
  | 'defend'
  | 'assess'
  | 'review';

export type MsModuleStatus = 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

/** The 12 Senior Microservices competency dimensions (existing competency engine). */
export type MsCompetencyDimension =
  | 'architecture'
  | 'implementation'
  | 'distributed-systems'
  | 'reliability'
  | 'data'
  | 'performance'
  | 'observability'
  | 'kubernetes'
  | 'debugging'
  | 'communication'
  | 'system-design'
  | 'production-engineering';

export interface MsPhaseMeta {
  id: MsPhaseId;
  order: number;
  title: string;
  subtitle: string;
  goal: string;
  /** Original Microservices Full Series sessions covered by this phase. */
  sessions: string;
  /** What the capstone looks like at the end of the phase. */
  architectureMilestone: string;
}

export interface MsPhaseMove {
  id: MsPhaseId;
  order: number;
  title: string;
  goal: string;
  /** 12 mandated steps: what / why / problem / internals / runtime / tradeoffs /
   * failures / observe / debug / fix / when-not / senior question */
  explanation: MsExplanationFramework;
  /** Non-negotiable engineering rules for this phase (hard constraints). */
  engineeringRules: string[];
}

/** Every major concept answers the 12 mandated explanation questions. */
export interface MsExplanationFramework {
  whatItIs: string;
  whyItExists: string;
  problemSolved: string;
  internals: string;
  runtimeBehaviour: string;
  tradeoffs: string;
  whatCanFail: string;
  howToObserve: string;
  howToDebug: string;
  howToFix: string;
  whenNotToUse: string;
  seniorQuestion: string;
}

export interface MsConceptExercise {
  id: string;
  prompt: string;
  expectedInsight: string;
  dimension: MsCompetencyDimension;
}

export interface MsTestCase {
  given: string;
  expect: string;
}

export interface MsCodeLab {
  id: string;
  title: string;
  estimatedMinutes: number;
  executionMode: MsExecutionMode;
  objective: string;
  prerequisites: string[];
  context: string;
  architecture: string;
  problemStatement: string;
  starterCode: string;
  starterLanguage: string;
  requirements: string[];
  constraints: string[];
  expectedBehaviour: string;
  testCases: MsTestCase[];
  hiddenFailureCases: string[];
  runInstructions: string[];
  expectedOutput: string;
  hints: string[];
  resetSteps: string;
  verification: string;
  explanation: string;
  extensionChallenge: string;
}

export interface MsInvestigationStep {
  command: string;
  output: string;
  insight: string;
}

export interface MsFailureLabSpec {
  id: string;
  title: string;
  estimatedMinutes: number;
  executionMode: MsExecutionMode;
  /** BUG — the defect seeded into the system. */
  bug: string;
  /** REPRODUCE — deterministic steps that surface the defect. */
  reproduce: string[];
  /** OBSERVE — raw evidence the learner must read before theorising. */
  observe: string[];
  /** HYPOTHESIS — competing explanations (only one survives the evidence). */
  hypothesisOptions: string[];
  correctHypothesisIndex: number;
  hypothesisRejection: string[];
export interface MsBenchmarkSpec {
  title: string;
  executionMode: MsExecutionMode;
  disclaimer: string;
  baseline: string[];
  measurementProtocol: string[];
  optimizations: string[];
  decisions: string[];
  falseImprovementWarnings: string[];
  /** What changed / why / bottleneck / proving metric / when worse. */
  tradeoffQuestions: string[];
}

export interface MsArchitectureChallenge {
  id: string;
  title: string;
  scenario: string;
  requirements: string[];
  constraints: string[];
  deliverables: string[];
  failureModes: string[];
  tradeoffQuestions: { question: string; modelAnswer: string }[];
}

export interface MsDefenseQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  rubric: string[];
  dimension: MsCompetencyDimension;
}

export interface MsDebugExercise {
  id: string;
  scenario: string;
  symptom: string;
  evidence: string[];
  task: string;
  expectedConclusion: string;
  commands: string[];
}

export interface MsEnglishVocabulary {
  term: string;
  meaning: string;
  example: string;
}

export interface MsEnglishIntegration {
  vocabulary: MsEnglishVocabulary[];
  sentencePatterns: string[];
  architectureExplanation: string;
  incidentCommunication: { situation: string; message: string }[];
  codeReviewLanguage: string[];
  designDiscussion: string[];
  interviewQuestions: string[];
  sixtySecondExplanation: string;
}

export interface MsAiReviewTask {
  prompt: string;
  /** The AI's initial answer — written as a plausible but imperfect suggestion. */
  aiSuggestion: string;
  risksToCheck: string[];
  verificationSteps: string[];
  correctOutcome: string;
}

export type MsAssessmentQuestionType =
  | 'conceptual'
  | 'scenario'
  | 'code-tracing'
  | 'debugging'
  | 'design';

export interface MsAssessmentQuestion {
  id: string;
  type: MsAssessmentQuestionType;
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MsModule {
  id: string;
  phase: MsPhaseId;
  order: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  /** Module ids that must be COMPLETED first (unlocking enforced by the engine). */
  prerequisites: string[];
  learningObjective: string;
  stackFocus: string[];
  executionMode: MsExecutionMode;
  /** One-paragraph answer to "why does this module exist in the capstone?" */
  whyItMatters: string;
  explanation: MsExplanationFramework;
  keyPoints: string[];
  conceptExercises: MsConceptExercise[];
  codeLabs: MsCodeLab[];
  debuggingExercises: MsDebugExercise[];
  failureLabs: MsFailureLabSpec[];
  benchmark?: MsBenchmarkSpec;
  architectureChallenge?: MsArchitectureChallenge;
  defenseQuestions: MsDefenseQuestion[];
  english: MsEnglishIntegration;
  aiReview: MsAiReviewTask;
  assessment: MsAssessmentQuestion[];
}

/** One architecture snapshot of the continuous E-commerce capstone. */
export interface MsCapstoneSnapshot {
  phase: MsPhaseId;
  label: string;
  services: string[];
  infrastructure: string[];
  flows: string[];
  newInThisPhase: string[];
  knownWeaknesses: string[];
  executionMode: MsExecutionMode;
}

export interface MsSessionMapping {
  session: number;
  title: string;
  moduleIds: string[];
  expandedInto: string[];
}

/** A production incident simulation (nothing is revealed before investigation). */
export interface MsIncident {
  id: string;
  title: string;
  moduleId: string;
  severity: 'P0' | 'P1' | 'P2';
  environment: string;
  symptomSummary: string;
  /** OBSERVE */
  alerts: string[];
  /** HYPOTHESIS */
  hypothesisOptions: string[];
  correctHypothesisIndex: number;
  /** INVESTIGATE */
  metrics: { name: string; value: string; baseline: string; interpretation: string }[];
  logs: string[];
  trace: string[];
  /** DEBUG */
  rootCauseOptions: string[];
  correctRootCauseIndex: number;
  /** FIX */
  fixSteps: string[];
  /** VERIFY */
  verification: string[];
  /** EXPLAIN / DEFEND */
  explainPrompt: string;
  postmortem: {
    impact: string;
    detection: string;
    rootCause: string;
    resolution: string;
    prevention: string;
  };
  defenseQuestions: string[];
  executionMode: MsExecutionMode;
}

  /** INVESTIGATE — evidence gathering; each step is diagnostic, not decorative. */
  investigate: MsInvestigationStep[];
  /** DEBUG — root-cause identification. */
  debugOptions: string[];
  correctRootCauseIndex: number;
  /** FIX — remediation choice. */
  fixOptions: string[];
  correctFixIndex: number;
  fixRejection: string[];
  /** VERIFY — evidence that the fix works. */
  verify: MsInvestigationStep[];
  /** EXPLAIN — the learner writes it first, then compares. */
  explainPrompt: string;
  modelExplanation: string;
  relatedPatterns: string[];
  dimension: MsCompetencyDimension;
}
