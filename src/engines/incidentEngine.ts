/**
 * Production Incident Triage engine — Phases C & D.
 *
 * Framework-agnostic (no Vue imports) so it is unit-testable and reusable.
 *
 * Design contract (mission §C / §D):
 *
 * 1. Nothing is revealed before the learner commits. The engine gates evidence
 *    behind steps: you cannot read the investigation output until you have
 *    declared a hypothesis.
 * 2. An incorrect triage is a real, visible state. It records no evidence and
 *    returns a rejection reason. "Unresolved incident" is never hidden and
 *    never silently passed (§10).
 * 3. Grading is deterministic: the declared hypothesis, the declared root cause
 *    and the applied fix must all survive the evidence.
 * 4. Resolution is separate from explanation. You can triage correctly and still
 *    owe a postmortem — the engine tracks both.
 */

import type { MsIncident } from '../data/microservices/types';

export type IncidentStep =
  | 'OBSERVE'
  | 'HYPOTHESIS'
  | 'DEBUG'
  | 'FIX'
  | 'VERIFY'
  | 'POSTMORTEM'
  | 'RESOLVED';

export const INCIDENT_STEPS: IncidentStep[] = [
  'OBSERVE',
  'HYPOTHESIS',
  'DEBUG',
  'FIX',
  'VERIFY',
  'POSTMORTEM',
  'RESOLVED',
];

/** What the learner has committed to so far. */
export interface IncidentSubmission {
  hypothesisIndex: number | null;
  rootCauseIndex: number | null;
  /** True only when the learner actually applied the fix and re-ran the checks. */
  fixApplied: boolean;
  /** The learner's own postmortem. Empty means nothing was written. */
  postmortem: string;
}

export interface IncidentTriageResult {
  /** True only when all three commitments survive the evidence. */
  correct: boolean;
  /** True when the triage was correct AND a postmortem was actually written. */
  fullyResolved: boolean;
  /** The step the learner is now on. A failed triage returns to OBSERVE. */
  nextStep: IncidentStep;
  /** Per-stage verdicts, in the order they were decided. */
  verdicts: {
    hypothesisCorrect: boolean | null;
    rootCauseCorrect: boolean | null;
    fixApplied: boolean;
  };
  /** Human-readable audit trail — every number is explainable from it. */
  auditTrail: string[];
  /** What to work on next. Empty when fully resolved. */
  remaining: string[];
  postmortemRecorded: boolean;
}

const MIN_POSTMORTEM_CHARS = 80;

/** Can the learner advance from OBSERVE to HYPOTHESIS? Always — observation is free. */
export function canAdvanceFrom(step: IncidentStep, submission: IncidentSubmission): boolean {
  switch (step) {
    case 'OBSERVE':
      return true;
    case 'HYPOTHESIS':
      return submission.hypothesisIndex !== null;
    case 'DEBUG':
      return submission.rootCauseIndex !== null;
    case 'FIX':
      return submission.fixApplied;
    case 'VERIFY':
      return true;
    case 'POSTMORTEM':
      return submission.postmortem.trim().length >= MIN_POSTMORTEM_CHARS;
    default:
      return false;
  }
}

/**
 * The evidence released at a step. `DEBUG` returns the investigation evidence
 * only once a hypothesis exists — this is the gate that prevents reading the
 * answer and then claiming a hypothesis.
 */
export function evidenceForStep(incident: MsIncident, step: IncidentStep) {
  switch (step) {
    case 'OBSERVE':
      return { alerts: incident.alerts };
    case 'HYPOTHESIS':
      return { metrics: incident.metrics, logs: incident.logs, trace: incident.trace };
    case 'DEBUG':
      return { investigation: incident.metrics };
    case 'FIX':
      return { fixSteps: incident.fixSteps };
    case 'VERIFY':
      return { verification: incident.verification };
    default:
      return { postmortem: incident.postmortem, defenseQuestions: incident.defenseQuestions };
  }
}

/** Deterministic triage grading. No partial credit, no invented marks. */
export function gradeIncidentTriage(
  incident: MsIncident,
  submission: IncidentSubmission
): IncidentTriageResult {
  const auditTrail: string[] = [];
  const remaining: string[] = [];

  const hypothesisCorrect =
    submission.hypothesisIndex === null ? null : submission.hypothesisIndex === incident.correctHypothesisIndex;
  const rootCauseCorrect =
    submission.rootCauseIndex === null ? null : submission.rootCauseIndex === incident.correctRootCauseIndex;

  if (submission.hypothesisIndex === null) {
    auditTrail.push('hypothesis: NOT COMMITTED');
  } else {
    auditTrail.push(
      `hypothesis: index ${submission.hypothesisIndex} ${hypothesisCorrect ? 'CORRECT' : 'REJECTED BY EVIDENCE'}`
    );
    if (!hypothesisCorrect) remaining.push('Re-derive the hypothesis from the metrics and logs you were shown.');
  }

  if (submission.rootCauseIndex === null) {
    auditTrail.push('root cause: NOT COMMITTED');
  } else {
    auditTrail.push(
      `root cause: index ${submission.rootCauseIndex} ${rootCauseCorrect ? 'CORRECT' : 'REJECTED BY EVIDENCE'}`
    );
    if (!rootCauseCorrect) remaining.push('Identify the root cause the evidence actually points at.');
  }

  auditTrail.push(`fix: ${submission.fixApplied ? 'APPLIED AND RE-VERIFIED' : 'NOT APPLIED'}`);
  if (!submission.fixApplied) {
    remaining.push('Apply the fix in your environment and re-run the verification before grading.');
  }

  const correct = hypothesisCorrect === true && rootCauseCorrect === true && submission.fixApplied;

  const postmortemRecorded = submission.postmortem.trim().length >= MIN_POSTMORTEM_CHARS;
  auditTrail.push(
    `postmortem: ${postmortemRecorded ? 'RECORDED' : 'MISSING'} (${submission.postmortem.trim().length} chars, minimum ${MIN_POSTMORTEM_CHARS})`
  );

  const fullyResolved = correct && postmortemRecorded;
  if (correct && !postmortemRecorded) {
    remaining.push('Write the postmortem: impact, detection, root cause, resolution, prevention.');
  }

  auditTrail.push(
    `verdict: ${fullyResolved ? 'RESOLVED' : correct ? 'TRIAGED, POSTMORTEM OWED' : 'NOT RESOLVED'} — no incident evidence recorded`
  );

  return {
    correct,
    fullyResolved,
    nextStep: fullyResolved ? 'RESOLVED' : correct ? 'POSTMORTEM' : 'OBSERVE',
    verdicts: {
      hypothesisCorrect,
      rootCauseCorrect,
      fixApplied: submission.fixApplied,
    },
    auditTrail,
    remaining,
    postmortemRecorded,
  };
}

/**
 * Severity policy — an explicit, testable ordering rather than string sorting.
 * Used to order the incident rail so a P0 always outranks a P2.
 */
export const INCIDENT_SEVERITY_RANK: Record<MsIncident['severity'], number> = {
  P0: 0,
  P1: 1,
  P2: 2,
};

export function compareIncidentsBySeverity(a: MsIncident, b: MsIncident): number {
  return INCIDENT_SEVERITY_RANK[a.severity] - INCIDENT_SEVERITY_RANK[b.severity];
}

/**
 * Which incidents are still open, given the ids the learner has resolved.
 * Pure derivation — the caller supplies the recorded evidence.
 */
export function selectOpenIncidents(
  incidents: readonly MsIncident[],
  resolvedIds: readonly string[]
): MsIncident[] {
  const resolved = new Set(resolvedIds);
  return incidents
    .filter((incident) => !resolved.has(incident.id))
    .slice()
    .sort(compareIncidentsBySeverity);
}
