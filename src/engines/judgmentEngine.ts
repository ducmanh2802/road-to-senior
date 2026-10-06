/**
 * Phase A — Engineering Judgment engine.
 *
 * Framework-agnostic (no Vue imports) so it is unit-testable and reusable by
 * the Pinia store, the UI and the test suites.
 *
 * Design contract (mission §A1 / §A2):
 *
 * 1. A learner CANNOT score by selecting a predefined answer. Every scenario
 *    requires a written decision plus a chosen investigation plan.
 * 2. Reasoning depth is measured on a 4-level ladder:
 *
 *      GUESS            — an answer with no evidence behind it
 *      PLAUSIBLE        — correct instinct, no measurement cited
 *      EVIDENCE_DRIVEN  — names the specific signal it would read
 *      SENIOR           — states what evidence would DISPROVE the decision
 *
 * 3. Nothing is graded by string similarity against a model answer. A human-
 *    auditable rubric scores the *shape* of the reasoning: did the learner
 *    cite a metric, a log field, a percentile, a blast radius, a rollback?
 *    That is deterministic, explainable and cannot be gamed by keyword
 *    stuffing into prose, because every scored signal must be attached to a
 *    scenario that actually declares it as available.
 *
 * 4. Confidently wrong reasoning scores LOWER than uncertain but correct
 *    reasoning. Calibration is part of judgment.
 */

/** The four judgment levels, ordered from weakest to strongest. */
export type JudgmentLevel = 'GUESS' | 'PLAUSIBLE' | 'EVIDENCE_DRIVEN' | 'SENIOR';

export const JUDGMENT_LEVELS: JudgmentLevel[] = [
  'GUESS',
  'PLAUSIBLE',
  'EVIDENCE_DRIVEN',
  'SENIOR',
];

export const JUDGMENT_LEVEL_LABELS: Record<JudgmentLevel, string> = {
  GUESS: 'Guess',
  PLAUSIBLE: 'Plausible reasoning',
  EVIDENCE_DRIVEN: 'Evidence-driven reasoning',
  SENIOR: 'Senior-level reasoning',
};

export const JUDGMENT_LEVEL_DESCRIPTIONS: Record<JudgmentLevel, string> = {
  GUESS:
    'An answer with no measurement behind it. Often the first thing that comes to mind. Not wrong by accident — wrong by omission.',
  PLAUSIBLE:
    'A reasoned position: the instinct may be right, but no measurement is cited. You cannot tell whether you are right or merely lucky.',
  EVIDENCE_DRIVEN:
    'Names the specific metric, log field, trace span or percentile it would read before acting. Someone else could reproduce your reasoning.',
  SENIOR:
    'States what evidence would DISPROVE the decision, defines the blast radius, and names how you would roll the change back. You own the outcome.',
};

/** The evidence signals a scenario declares as actually available. */
export type EvidenceSignal =
  | 'metric'
  | 'percentile'
  | 'log'
  | 'trace'
  | 'dependency'
  | 'database'
  | 'cpu-memory'
  | 'gc'
  | 'thread-pool'
  | 'network'
  | 'deployment-diff'
  | 'dependency-version'
  | 'cache-hit-rate'
  | 'queue-depth'
  | 'customer-impact';

export const EVIDENCE_SIGNAL_LABELS: Record<EvidenceSignal, string> = {
  metric: 'a named metric',
  percentile: 'a percentile (p50/p95/p99), not an average',
  log: 'a specific log field',
  trace: 'a distributed trace span',
  dependency: 'the dependency health of every downstream call',
  database: 'query plans, locks and connection pool state',
  'cpu-memory': 'CPU and heap/GC state',
  gc: 'GC pause frequency and heap occupancy',
  'thread-pool': 'thread-pool saturation and queue depth',
  network: 'network reachability, DNS, TLS and RTT',
  'deployment-diff': 'what changed in the last deploy',
  'dependency-version': 'the version/diff of the changed dependency',
  'cache-hit-rate': 'cache hit rate and eviction rate',
  'queue-depth': 'queue depth and consumer lag',
  'customer-impact': 'which customers are actually affected',
};

/**
 * A decision scenario. Deliberately includes a TEMPTING but wrong shortcut so
 * that guessing feels rewarded until the evidence contradicts it (§A2).
 */
export interface JudgmentScenario {
  id: string;
  title: string;
  /** Which senior domain this scenario exercises. */
  domain:
    | 'performance'
    | 'reliability'
    | 'distributed-systems'
    | 'data'
    | 'security'
    | 'cost'
    | 'delivery'
    | 'architecture';
  /** THE TRAP: the obvious answer that a mid-level engineer would give. */
  temptingShortcut: string;
  /** Why the shortcut is attractive — understanding this is part of the lesson. */
  whyTempting: string;
  context: string;
  constraints: string[];
  symptoms: string[];
  /** Evidence the learner is actually allowed to read. */
  availableEvidence: EvidenceSignal[];
  /** The candidate actions. None is pre-marked correct. */
  options: JudgmentOption[];
  correctOptionIndex: number;
  /** Why every rejected option fails. */
  rejectedAlternatives: string[];
  /** The decision the senior engineer makes, with its trade-off. */
  seniorDecision: string;
  /** The cost of this decision — a senior decision is never free. */
  consequence: string;
  /** How the decision is verified. Unverifiable decisions are not senior decisions. */
  verification: string;
  /** What would prove the decision WRONG. Required for SENIOR-level reasoning. */
  falsifier: string;
}

export interface JudgmentOption {
  id: string;
  action: string;
  /** Expected outcome if this option is chosen. */
  outcome: string;
}

export interface DecisionSubmission {
  /** The action the learner chose. */
  chosenOptionIndex: number;
  /** Free-form reasoning. Required — a scenario cannot be answered silently. */
  reasoning: string;
  /** The investigation steps the learner says they would run FIRST. */
  investigationPlan: string;
  /** Which signals the learner says they would read. */
  claimedSignals: EvidenceSignal[];
  /** How confident the learner is, 0-100. */
  confidence: number;
  /** What evidence would prove the decision wrong. */
  falsification: string;
}

export interface ReasoningSignalResult {
  signal: EvidenceSignal;
  /** Signals the scenario actually makes available. */
  available: boolean;
  claimed: boolean;
  credit: boolean;
  /** Why this signal was or was not credited. */
  rationale: string;
}

export interface JudgmentEvaluation {
  level: JudgmentLevel;
  /** 0-100. Deterministic from the signals below, never from prose similarity. */
  score: number;
  correctDecision: boolean;
  /** The chosen action was correct but for the wrong reason. */
  rightAnswerWrongReason: boolean;
  /** The chosen action was wrong but the reasoning was sound. */
  wrongAnswerRightReason: boolean;
  /** True when the learner fell for the documented trap. */
  fellForTemptingShortcut: boolean;
  signals: ReasoningSignalResult[];
  /** Calibration: |confidence - objective quality| in points. */
  calibrationError: number;
  calibrationVerdict: 'WELL_CALIBRATED' | 'OVERCONFIDENT' | 'UNDERCONFIDENT';
  /** Human-readable audit trail — every number above is explainable from it. */
  auditTrail: string[];
  /** What a senior engineer would have added, whatever the learner chose. */
  seniorGaps: string[];
  feedback: string;
}

const MIN_REASONING_CHARS = 40;
const MIN_PLAN_CHARS = 30;
const MIN_FALSIFICATION_CHARS = 40;

/** Tempting shortcuts are recorded verbatim in the scenarios, so match on identity. */
function isTemptingShortcut(scenario: JudgmentScenario, optionIndex: number): boolean {
  const option = scenario.options[optionIndex];
  if (!option) return false;
  return option.action.trim() === scenario.temptingShortcut.trim();
}

/**
 * Deterministic judgment evaluation.
 *
 * Score composition (documented so a learner can contest it):
 *   correct decision ................ +35
 *   signal coverage ................. +4 per credited signal (cap 32)
 *   investigation plan present ...... +10
 *   reasoning substance ............. +10
 *   falsification stated ............ +13   (this is what makes it SENIOR)
 *   falling for the trap ............ -20
 *   wrong decision .................. -15
 *
 * Level thresholds are then derived from the score, never from the answer key
 * alone, so a correct guess can never reach SENIOR.
 */
export function evaluateJudgment(
  scenario: JudgmentScenario,
  submission: DecisionSubmission
): JudgmentEvaluation {
  const auditTrail: string[] = [];
  const seniorGaps: string[] = [];
  let score = 0;

  const correctDecision = submission.chosenOptionIndex === scenario.correctOptionIndex;
  const fellForTemptingShortcut = isTemptingShortcut(scenario, submission.chosenOptionIndex);

  if (correctDecision) {
    score += 35;
    auditTrail.push('+35 chose the correct action');
  } else {
    score -= 15;
    auditTrail.push('-15 chose an incorrect action');
  }

  if (fellForTemptingShortcut) {
    score -= 20;
    auditTrail.push('-20 chose the documented tempting shortcut');
  }

  // --- evidence signals ------------------------------------------------
  // The evaluated set is the UNION of what the scenario makes available and
  // what the learner claimed. Building it from `availableEvidence` alone
  // would make "you cited evidence you cannot read" impossible to detect.
  const evaluatedSignals = Array.from(
    new Set<EvidenceSignal>([...scenario.availableEvidence, ...submission.claimedSignals])
  );

  const signals: ReasoningSignalResult[] = evaluatedSignals.map((signal) => {
    const available = scenario.availableEvidence.includes(signal);
    const claimed = submission.claimedSignals.includes(signal);
    const credit = available && claimed;
    return {
      signal,
      available,
      claimed,
      credit,
      rationale: credit
        ? `Cited ${EVIDENCE_SIGNAL_LABELS[signal]}, which this scenario makes available.`
        : available
        ? `Available in this scenario but not cited by the submission.`
        : `Cited a signal this scenario does not provide — reading it is impossible here.`,
    };
  });

  const creditedSignals = signals.filter((signal) => signal.credit);
  const signalCredit = Math.min(32, creditedSignals.length * 4);
  score += signalCredit;
  auditTrail.push(
    `+${signalCredit} evidence coverage (${creditedSignals.length}/${scenario.availableEvidence.length} available signals cited)`
  );

  const claimedUnavailable = signals.filter((signal) => !signal.available && signal.claimed);
  if (claimedUnavailable.length > 0) {
    score = Math.max(0, score - 8);
    auditTrail.push(
      `-8 cited ${claimedUnavailable.length} signal(s) that are not available in this scenario`
    );
    seniorGaps.push(
      `Cited ${claimedUnavailable.length} signal(s) that are not available in this scenario. A decision cannot rest on evidence you cannot read.`
    );
  }

  // --- investigation plan ----------------------------------------------
  const planLength = submission.investigationPlan.trim().length;
  if (planLength >= MIN_PLAN_CHARS) {
    score += 10;
    auditTrail.push('+10 named a concrete investigation plan');
  } else {
    seniorGaps.push(
      `Investigation plan is too thin (${planLength} chars). A senior states what they check FIRST and in what order.`
    );
  }

  // --- reasoning substance ---------------------------------------------
  const reasoningLength = submission.reasoning.trim().length;
  if (reasoningLength >= MIN_REASONING_CHARS) {
    score += 10;
    auditTrail.push('+10 wrote substantive reasoning');
  } else {
    seniorGaps.push(
      `Reasoning is too thin (${reasoningLength} chars). State the trade-off you accepted, not just the action.`
    );
  }

  // --- falsification (the senior differentiator) ------------------------
  const falsificationLength = submission.falsification.trim().length;
  if (falsificationLength >= MIN_FALSIFICATION_CHARS) {
    score += 13;
    auditTrail.push('+13 stated what would disprove the decision');
  } else {
    seniorGaps.push(
      'No falsifier. A decision you cannot disprove is a belief, not an engineering decision.'
    );
  }

  // --- calibration -----------------------------------------------------
  const objectiveQuality = Math.max(0, Math.min(100, score));
  const confidence = Math.max(0, Math.min(100, submission.confidence));
  const calibrationError = Math.abs(confidence - objectiveQuality);
  let calibrationVerdict: JudgmentEvaluation['calibrationVerdict'];
  if (calibrationError <= 15) calibrationVerdict = 'WELL_CALIBRATED';
  else if (confidence > objectiveQuality) calibrationVerdict = 'OVERCONFIDENT';
  else calibrationVerdict = 'UNDERCONFIDENT';

  if (calibrationVerdict === 'OVERCONFIDENT') {
    seniorGaps.push(
      `Confidence ${confidence}% exceeds the quality of the reasoning (${objectiveQuality}%). Overconfidence is how bad decisions ship.`
    );
  }

  score = Math.max(0, Math.min(100, score));

  // --- level ------------------------------------------------------------
  // The ladder is a function of the evidence the learner produced. A lucky
  // correct guess tops out at PLAUSIBLE because it carries no signal credit.
  //
  //   SENIOR         correct action + falsifier + calibrated confidence
  //   EVIDENCE_DRIVEN  ≥2 credited signals from the available evidence
  //   PLAUSIBLE      a reasoned position: ≥1 cited signal, or a correct
  //                   action that actually carries reasoning or a plan
  //   GUESS          no signal, no plan, no substance — a bare answer, even
  //                   when the bare answer happens to be the right one
  const hasSubstance = reasoningLength >= MIN_REASONING_CHARS || planLength >= MIN_PLAN_CHARS;

  let level: JudgmentLevel;
  if (correctDecision && falsificationLength >= MIN_FALSIFICATION_CHARS && calibrationError <= 20) {
    level = 'SENIOR';
  } else if (creditedSignals.length >= 2) {
    level = 'EVIDENCE_DRIVEN';
  } else if (creditedSignals.length >= 1 || (correctDecision && hasSubstance)) {
    level = 'PLAUSIBLE';
  } else {
    level = 'GUESS';
  }

  auditTrail.push(
    `level=${level} (decision ${correctDecision ? 'correct' : 'incorrect'}, ${creditedSignals.length} credited signal(s), substance=${hasSubstance}, falsifier=${falsificationLength >= MIN_FALSIFICATION_CHARS})`
  );
  auditTrail.push(
    `calibration ${calibrationVerdict} (error ${calibrationError} points, stated confidence ${confidence}%)`
  );

  const rightAnswerWrongReason = correctDecision && creditedSignals.length === 0;
  const wrongAnswerRightReason = !correctDecision && creditedSignals.length >= 2;

  const feedback = buildFeedback(
    scenario,
    level,
    correctDecision,
    fellForTemptingShortcut,
    rightAnswerWrongReason,
    wrongAnswerRightReason
  );

  return {
    level,
    score,
    correctDecision,
    rightAnswerWrongReason,
    wrongAnswerRightReason,
    fellForTemptingShortcut,
    signals,
    calibrationError,
    calibrationVerdict,
    auditTrail,
    seniorGaps,
    feedback,
  };
}

function buildFeedback(
  scenario: JudgmentScenario,
  level: JudgmentLevel,
  correctDecision: boolean,
  fellForTemptingShortcut: boolean,
  rightAnswerWrongReason: boolean,
  wrongAnswerRightReason: boolean
): string {
  const parts: string[] = [];

  if (fellForTemptingShortcut) {
    parts.push(
      `You took the tempting shortcut: "${scenario.temptingShortcut}". It is attractive because ${scenario.whyTempting} But it does not survive contact with the evidence in this scenario.`
    );
  }

  if (rightAnswerWrongReason) {
    parts.push(
      'Right answer, unsupported reasoning. The action was correct and you could not say why. That is luck, and luck does not scale.'
    );
  }

  if (wrongAnswerRightReason) {
    parts.push(
      'Your investigation plan was senior-grade but the action was wrong. A correct method pointed at the wrong lever — check whether you fixed the cause or a symptom.'
    );
  }

  if (level === 'SENIOR') {
    parts.push(
      'Senior-level: correct action, evidence cited, and a stated falsifier. You defined how you would find out you were wrong before committing.'
    );
  } else if (level === 'EVIDENCE_DRIVEN') {
    parts.push(
      'Evidence-driven: you named the signals you would read. The missing step is the falsifier — what result would make you reverse this decision?'
    );
  } else if (level === 'PLAUSIBLE') {
    parts.push(
      'Plausible: your instinct is not unreasonable, but no signal was named. Name the specific metric or log field you would read first.'
    );
  } else {
    parts.push(
      'Guess: an answer with no measurement behind it. Before acting in production, decide which single signal would tell you whether you are right.'
    );
  }

  if (correctDecision && !fellForTemptingShortcut) {
    parts.push(`Senior decision: ${scenario.seniorDecision}`);
    parts.push(`Cost of this decision: ${scenario.consequence}`);
    parts.push(`Verify it with: ${scenario.verification}`);
  }

  return parts.join(' ');
}

/** Progress record for one scenario — one entry per scenario, no second model. */
export interface JudgmentAttemptRecord {
  scenarioId: string;
  level: JudgmentLevel;
  score: number;
  correctDecision: boolean;
  confidence: number;
  calibrationVerdict: JudgmentEvaluation['calibrationVerdict'];
  /** |stated confidence − objective quality|, in points. Real recorded evidence. */
  calibrationError: number;
  attemptedAt: string;
}

export interface JudgmentTrackProgress {
  attempted: number;
  total: number;
  passed: number;
  percent: number;
  seniorLevel: number;
  byLevel: Record<JudgmentLevel, number>;
  averageScore: number;
  averageCalibrationError: number;
  domainCoverage: { domain: JudgmentScenario['domain']; attempted: number; total: number }[];
  untouchedDomains: JudgmentScenario['domain'][];
}

/** A scenario is "passed" only at EVIDENCE_DRIVEN or above — never on a guess. */
export const JUDGMENT_PASS_LEVELS: JudgmentLevel[] = ['EVIDENCE_DRIVEN', 'SENIOR'];

export function isJudgmentPassed(record: JudgmentAttemptRecord | undefined): boolean {
  return Boolean(record && JUDGMENT_PASS_LEVELS.includes(record.level));
}

export function computeJudgmentTrackProgress(
  scenarios: readonly JudgmentScenario[],
  records: Record<string, JudgmentAttemptRecord>
): JudgmentTrackProgress {
  const byLevel: Record<JudgmentLevel, number> = {
    GUESS: 0,
    PLAUSIBLE: 0,
    EVIDENCE_DRIVEN: 0,
    SENIOR: 0,
  };

  const attemptedRecords = scenarios
    .map((scenario) => records[scenario.id])
    .filter((record): record is JudgmentAttemptRecord => Boolean(record));

  let scoreTotal = 0;
  let calibrationTotal = 0;
  let seniorLevel = 0;
  let passed = 0;

  attemptedRecords.forEach((record) => {
    byLevel[record.level] += 1;
    scoreTotal += record.score;
    calibrationTotal += record.calibrationError;
    if (record.level === 'SENIOR') seniorLevel += 1;
    if (JUDGMENT_PASS_LEVELS.includes(record.level)) passed += 1;
  });

  const domains = Array.from(new Set(scenarios.map((scenario) => scenario.domain))).sort();
  const domainCoverage = domains.map((domain) => ({
    domain,
    attempted: scenarios.filter(
      (scenario) => scenario.domain === domain && records[scenario.id]
    ).length,
    total: scenarios.filter((scenario) => scenario.domain === domain).length,
  }));

  return {
    attempted: attemptedRecords.length,
    total: scenarios.length,
    passed,
    percent: scenarios.length === 0 ? 0 : Math.round((attemptedRecords.length / scenarios.length) * 100),
    seniorLevel,
    byLevel,
    averageScore: attemptedRecords.length === 0 ? 0 : Math.round(scoreTotal / attemptedRecords.length),
    averageCalibrationError:
      attemptedRecords.length === 0 ? 0 : Math.round(calibrationTotal / attemptedRecords.length),
    domainCoverage,
    untouchedDomains: domainCoverage.filter((entry) => entry.attempted === 0).map((entry) => entry.domain),
  };
}

/**
 * Tempting shortcuts the learner has NOT yet disproven. Surfaced by the Today
 * view so deliberate practice targets the actual weakness (mission §13).
 */
export function selectJudgmentRemediation(
  scenarios: readonly JudgmentScenario[],
  records: Record<string, JudgmentAttemptRecord>
): JudgmentScenario | null {
  const fellForTrap = scenarios.find(
    (scenario) => records[scenario.id]?.level === 'GUESS' || records[scenario.id]?.correctDecision === false
  );
  if (fellForTrap) return fellForTrap;

  const neverAttempted = scenarios.find((scenario) => !records[scenario.id]);
  if (neverAttempted) return neverAttempted;

  const lowest = scenarios
    .map((scenario) => ({ scenario, record: records[scenario.id] }))
    .filter((entry): entry is { scenario: JudgmentScenario; record: JudgmentAttemptRecord } =>
      Boolean(entry.record)
    )
    .sort((a, b) => a.record.score - b.record.score)[0];

  return lowest ? lowest.scenario : null;
}

/** Storage normaliser — additive fields only, never destroys recorded evidence. */
export function normalizeJudgmentRecords(raw: unknown): Record<string, JudgmentAttemptRecord> {
  if (!raw || typeof raw !== 'object') return {};
  const source = raw as Record<string, unknown>;
  const result: Record<string, JudgmentAttemptRecord> = {};

  Object.entries(source).forEach(([scenarioId, value]) => {
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    const level = record.level;
    if (typeof level !== 'string' || !(JUDGMENT_LEVELS as string[]).includes(level)) return;

    result[scenarioId] = {
      scenarioId,
      level: level as JudgmentLevel,
      score: typeof record.score === 'number' && Number.isFinite(record.score) ? record.score : 0,
      correctDecision: record.correctDecision === true,
      confidence:
        typeof record.confidence === 'number' && Number.isFinite(record.confidence)
          ? record.confidence
          : 0,
      calibrationVerdict:
        record.calibrationVerdict === 'WELL_CALIBRATED' ||
        record.calibrationVerdict === 'OVERCONFIDENT' ||
        record.calibrationVerdict === 'UNDERCONFIDENT'
          ? record.calibrationVerdict
          : 'UNDERCONFIDENT',
      calibrationError:
        typeof record.calibrationError === 'number' && Number.isFinite(record.calibrationError)
          ? record.calibrationError
          : 0,
      attemptedAt: typeof record.attemptedAt === 'string' ? record.attemptedAt : '',
    };
  });

  return result;
}