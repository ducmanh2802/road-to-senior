export type TaskState = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'OVERDUE';

export type TaskCategory =
  | 'JAVA'
  | 'HANDS_ON'
  | 'DSA'
  | 'SYSTEM_DESIGN'
  | 'SPRING'
  | 'MICROSERVICES'
  | 'CLAUDE_CODE'
  | 'ENGLISH'
  | 'REVIEW';

export interface LearningTask {
  id: string;
  dayNumber: number;
  title: string;
  category: TaskCategory;
  description: string;
  estimatedMinutes: number;
  state: TaskState;
  completedAt?: string;
  notes?: string;
  codeSnippet?: string;
  externalLink?: string;
}

export type KnowledgeStatus =
  | 'NOT_STARTED'
  | 'LEARNING'
  | 'PRACTICING'
  | 'UNDERSTOOD'
  | 'MASTERED'
  | 'NEEDS_REVIEW';

export interface MasteryDimensions {
  theory: number;       // 1-5
  handsOn: number;      // 1-5
  recall: number;       // 1-5
  explanation: number;  // 1-5
  debugging: number;    // 1-5
  interview: number;    // 1-5
}

export type MasteryDimensionKey = keyof MasteryDimensions;

export interface KnowledgeTopic {
  id: string;
  title: string;
  category: 'JAVA' | 'SPRING' | 'MICROSERVICES' | 'DATABASE' | 'SYSTEM_DESIGN' | 'DEVOPS' | 'AI_ENGINEERING';
  subcategory: string;
  description: string;
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR' | 'STAFF';
  status: KnowledgeStatus;
  confidence: number; // 1-5
  dimensions: MasteryDimensions;
  learned: boolean;
  implemented: boolean;
  explained: boolean;
  debugged: boolean;
  interviewReady: boolean;
  notes?: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  interviewQuestions?: string[];
  keyPitfalls?: string[];
  recommendedAction?: string;
}

export type ReviewGrade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface ReviewCard {
  id: string;
  topicId?: string;
  category: string;
  question: string;
  expectedAnswer: string;
  codeExample?: string;
  explanation?: string;
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
  lastReviewedAt?: string;
  nextReviewAt: string; // ISO String
  history: {
    date: string;
    grade: ReviewGrade;
    durationSec: number;
  }[];
}

export interface DSAProblem {
  id: string;
  title: string;
  pattern:
    | 'Arrays'
    | 'Strings'
    | 'HashMap'
    | 'Two Pointers'
    | 'Sliding Window'
    | 'Binary Search'
    | 'Stack'
    | 'Queue'
    | 'Linked List'
    | 'Tree'
    | 'BST'
    | 'Heap'
    | 'Graph'
    | 'BFS'
    | 'DFS'
    | 'Trie'
    | 'Dynamic Programming'
    | 'Greedy'
    | 'Backtracking'
    | 'Union Find';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitMinutes: number;
  sourceUrl?: string;
  attempts: number;
  bestTimeMinutes?: number;
  solvedWithoutHelp: boolean;
  optimalSolutionJava: string;
  timeComplexity: string;
  spaceComplexity: string;
  mistakes?: string;
  notes?: string;
  mastered: boolean;
  lastSolvedAt?: string;
  nextReviewAt?: string;
}

export interface SystemDesignProblem {
  id: string;
  title: string;
  difficulty: 'MEDIUM' | 'HARD' | 'STAFF';
  description: string;
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  capacityEstimation: {
    dau: string;
    qps: string;
    storagePerDay: string;
    networkBandwidth: string;
  };
  apiDesign: string[];
  dataModel: string[];
  architectureDiagramAscii: string;
  scalingTechniques: string[];
  failureModes: string[];
  tradeoffs: string[];
  rubricScores: {
    requirements: number;
    architecture: number;
    database: number;
    scalability: number;
    reliability: number;
    tradeoffs: number;
    communication: number;
  };
  notes?: string;
  completed: boolean;
  timeSpentMinutes?: number;
}

export interface ClaudeCodeExercise {
  id: string;
  title: string;
  topic:
    | 'CLI & Config'
    | 'CLAUDE.md Structure'
    | 'Context Management'
    | 'Plan vs Act Mode'
    | 'Subagents & Workflows'
    | 'Skills & Custom Tools'
    | 'MCP Server Integration'
    | 'Git & Code Review'
    | 'Refactoring & Debugging'
    | 'Large Repo Exploration';
  objective: string;
  promptExample: string;
  expectedResult: string;
  aiMistakesToWatch: string[];
  humanCorrections: string[];
  lessonsLearned: string[];
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
}

export interface EnglishSession {
  id: string;
  dayNumber: number;
  category:
    | 'Self Introduction'
    | 'Java Architecture'
    | 'Spring Internals'
    | 'Database Optimization'
    | 'Microservices'
    | 'System Design'
    | 'Production Incident'
    | 'Leadership & Conflict'
    | 'Failure Postmortem';
  dailySentences: string[];
  technicalExplanationTopic: string;
  technicalExplanationModelAnswer: string;
  behavioralQuestion: string;
  behavioralStarAnswer: string;
  interviewQuestions: string[];
  practicedWritten: boolean;
  practicedSpoken: boolean;
  audioRecordingUrl?: string;
  userSpokenTranscript?: string;
  qualitativeDimensions: {
    technicalClarity: number; // 1-5
    fluency: number;          // 1-5
    grammar: number;          // 1-5
    vocabulary: number;       // 1-5
    communication: number;    // 1-5
  };
}

export interface ProjectFeature {
  id: string;
  title: string;
  service: 'API_GATEWAY' | 'USER_SERVICE' | 'PRODUCT_SERVICE' | 'ORDER_SERVICE' | 'PAYMENT_SERVICE' | 'INVENTORY_SERVICE' | 'NOTIFICATION_SERVICE';
  stages: {
    requirement: boolean;
    design: boolean;
    implementation: boolean;
    unitTest: boolean;
    integrationTest: boolean;
    loadTest: boolean;
    failureTest: boolean;
    observability: boolean;
    documentation: boolean;
  };
  notes?: string;
}

export interface IncidentScenario {
  id: string;
  title: string;
  serviceAffected: string;
  severity: 'P0 - CRITICAL' | 'P1 - HIGH' | 'P2 - MEDIUM';
  symptoms: string[];
  liveLogs: string[];
  metrics: {
    name: string;
    currentValue: string;
    normalValue: string;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  }[];
  hypothesisOptions: string[];
  correctHypothesisIndex: number;
  rootCauseAnalysis: string;
  fixCommand: string;
  verificationSteps: string[];
  preventionStrategy: string;
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED';
  postmortem?: {
    impact: string;
    rootCause: string;
    detection: string;
    resolution: string;
    prevention: string;
  };
}

export interface InterviewQuestion {
  id: string;
  category: 'JAVA' | 'SPRING' | 'DATABASE' | 'MICROSERVICES' | 'KAFKA' | 'SYSTEM_DESIGN' | 'DSA' | 'BEHAVIORAL' | 'ENGLISH';
  difficulty: 'MEDIUM' | 'HARD' | 'STAFF';
  question: string;
  keyPointsExpected: string[];
  idealSeniorAnswer: string;
  userNotes?: string;
  lastPracticed?: string;
  confidence: number;
}

export interface MockInterviewSession {
  id: string;
  type: 'DSA' | 'JAVA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL';
  durationMinutes: number;
  date: string;
  questions: string[];
  userNotes: string;
  wentWell: string;
  failed: string;
  forgotten: string;
  reviewItemsToCreate: string[];
  score: number;
}

export interface RoadmapDay {
  dayNumber: number;
  phaseNumber: number;
  phaseName: string;
  theme: string;
  coreConcepts: string[];
  handsOnGoal: string;
  dsaFocus: string;
  systemDesignFocus?: string;
  englishFocus?: string;
  claudeCodeFocus?: string;
  completed: boolean;
}

export interface CompetencyReadiness {
  name: string;
  score: number; // 0 - 100
  totalTopics: number;
  masteredTopics: number;
  weakestDimension: string;
  level: 'Novice' | 'Competent' | 'Advanced' | 'Senior Ready';
}
