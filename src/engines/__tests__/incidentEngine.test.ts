import { describe, it, expect } from 'vitest';
import {
  canAdvanceFrom,
  compareIncidentsBySeverity,
  evidenceForStep,
  gradeIncidentTriage,
  selectOpenIncidents,
  INCIDENT_STEPS,
  INCIDENT_SEVERITY_RANK,
  type IncidentSubmission,
} from '../incidentEngine';
import type { MsIncident } from '../../data/microservices/types';

function incident(overrides: Partial<MsIncident> = {}): MsIncident {
  return {
    id: 'TEST-INC',
    title: 'Test incident',
    moduleId: 'M5.6',
    severity: 'P1',
    environment: 'production',
    symptomSummary: 'latency',
    alerts: ['ALERT-1', 'ALERT-2'],
    hypothesisOptions: ['H0', 'H1'],
    correctHypothesisIndex: 1,
    metrics: [{ name: 'p95', value: '800ms', baseline: '100ms', interpretation: 'regression' }],
    logs: ['LOG-1'],
    trace: ['SPAN-1'],
    rootCauseOptions: ['R0', 'R1'],
    correctRootCauseIndex: 0,
    fixSteps: ['STEP-1'],
    verification: ['VERIFY-1'],
    explainPrompt: 'Explain it.',
    postmortem: {
      impact: 'i',
      detection: 'd',
      rootCause: 'r',
      resolution: 'res',
      prevention: 'p',
    },
    defenseQuestions: ['Q1'],
    executionMode: 'SIMULATED',
    ...overrides,
  };
}

function submission(overrides: Partial<IncidentSubmission> = {}): IncidentSubmission {
  return {
    hypothesisIndex: 1,
    rootCauseIndex: 0,
    fixApplied: true,
    postmortem:
      'Impact: checkout latency degraded for 40 minutes. Detection: the p95 SLO burn alert fired. ' +
      'Root cause: an N+1 query on the account path. Resolution: replaced the fan-out with a single query. ' +
      'Prevention: added a query-count assertion to the integration test suite.',
    ...overrides,
  };
}

describe('incidentEngine — the step machine', () => {
  it('declares the full triage order', () => {
    expect(INCIDENT_STEPS).toEqual([
      'OBSERVE',
      'HYPOTHESIS',
      'DEBUG',
      'FIX',
      'VERIFY',
      'POSTMORTEM',
      'RESOLVED',
    ]);
  });

  it('lets anyone observe for free', () => {
    expect(canAdvanceFrom('OBSERVE', submission({ hypothesisIndex: null, rootCauseIndex: null, fixApplied: false }))).toBe(true);
  });

  it('blocks advancing past HYPOTHESIS without a committed hypothesis', () => {
    expect(canAdvanceFrom('HYPOTHESIS', submission({ hypothesisIndex: null }))).toBe(false);
    expect(canAdvanceFrom('HYPOTHESIS', submission({ hypothesisIndex: 0 }))).toBe(true);
  });

  it('blocks advancing past DEBUG without a committed root cause', () => {
    expect(canAdvanceFrom('DEBUG', submission({ rootCauseIndex: null }))).toBe(false);
    expect(canAdvanceFrom('DEBUG', submission({ rootCauseIndex: 1 }))).toBe(true);
  });

  it('blocks advancing past FIX until the fix is actually applied', () => {
    expect(canAdvanceFrom('FIX', submission({ fixApplied: false }))).toBe(false);
    expect(canAdvanceFrom('FIX', submission({ fixApplied: true }))).toBe(true);
  });

  it('requires a substantive postmortem before the incident closes', () => {
    expect(canAdvanceFrom('POSTMORTEM', submission({ postmortem: '' }))).toBe(false);
    expect(canAdvanceFrom('POSTMORTEM', submission({ postmortem: 'too short' }))).toBe(false);
    expect(canAdvanceFrom('POSTMORTEM', submission())).toBe(true);
  });

  it('never advances from RESOLVED', () => {
    expect(canAdvanceFrom('RESOLVED', submission())).toBe(false);
  });
});

describe('incidentEngine — evidence gating', () => {
  it('shows only alerts at OBSERVE, never the investigation output', () => {
    const evidence = evidenceForStep(incident(), 'OBSERVE') as Record<string, unknown>;
    expect(Object.keys(evidence)).toEqual(['alerts']);
  });

  it('does not release metrics, logs or trace before a hypothesis is declared', () => {
    const atHypothesis = evidenceForStep(incident(), 'HYPOTHESIS') as Record<string, unknown>;
    expect(atHypothesis).not.toHaveProperty('fixSteps');
    expect(atHypothesis).toHaveProperty('metrics');
    expect(atHypothesis).toHaveProperty('trace');
  });

  it('never leaks the reference postmortem before the postmortem step', () => {
    const atVerify = evidenceForStep(incident(), 'VERIFY') as Record<string, unknown>;
    expect(atVerify).not.toHaveProperty('postmortem');
    const atPostmortem = evidenceForStep(incident(), 'POSTMORTEM') as Record<string, unknown>;
    expect(atPostmortem).toHaveProperty('postmortem');
  });
});

describe('incidentEngine — deterministic grading', () => {
  it('resolves a fully correct triage with a written postmortem', () => {
    const result = gradeIncidentTriage(incident(), submission());

    expect(result.correct).toBe(true);
    expect(result.fullyResolved).toBe(true);
    expect(result.nextStep).toBe('RESOLVED');
    expect(result.remaining).toEqual([]);
    expect(result.postmortemRecorded).toBe(true);
  });

  it('rejects a wrong hypothesis and returns to the alerts', () => {
    const result = gradeIncidentTriage(incident(), submission({ hypothesisIndex: 0 }));

    expect(result.correct).toBe(false);
    expect(result.fullyResolved).toBe(false);
    expect(result.nextStep).toBe('OBSERVE');
    expect(result.verdicts.hypothesisCorrect).toBe(false);
    expect(result.remaining.join(' ')).toContain('hypothesis');
    expect(result.auditTrail.join(' ')).toContain('REJECTED BY EVIDENCE');
  });

  it('rejects a wrong root cause', () => {
    const result = gradeIncidentTriage(incident(), submission({ rootCauseIndex: 1 }));
    expect(result.verdicts.rootCauseCorrect).toBe(false);
    expect(result.correct).toBe(false);
  });

  it('rejects a fix that was never applied', () => {
    const result = gradeIncidentTriage(incident(), submission({ fixApplied: false }));
    expect(result.verdicts.fixApplied).toBe(false);
    expect(result.correct).toBe(false);
    expect(result.remaining.join(' ')).toContain('Apply the fix');
  });

  it('separates triaged from fully resolved when the postmortem is missing', () => {
    const result = gradeIncidentTriage(incident(), submission({ postmortem: 'too short' }));

    expect(result.correct).toBe(true);
    expect(result.fullyResolved).toBe(false);
    expect(result.nextStep).toBe('POSTMORTEM');
    expect(result.postmortemRecorded).toBe(false);
    expect(result.remaining.join(' ')).toContain('postmortem');
  });

  it('never awards partial credit for a half-correct triage', () => {
    const result = gradeIncidentTriage(incident(), submission({ hypothesisIndex: 0, rootCauseIndex: 0 }));
    expect(result.verdicts.hypothesisCorrect).toBe(false);
    expect(result.verdicts.rootCauseCorrect).toBe(true);
    expect(result.correct).toBe(false);
  });

  it('reports uncommitted stages as null rather than false', () => {
    const result = gradeIncidentTriage(
      incident(),
      submission({ hypothesisIndex: null, rootCauseIndex: null, fixApplied: false })
    );
    expect(result.verdicts.hypothesisCorrect).toBeNull();
    expect(result.verdicts.rootCauseCorrect).toBeNull();
    expect(result.auditTrail).toContain('hypothesis: NOT COMMITTED');
  });
});

describe('incidentEngine — open-incident selection', () => {
  it('orders P0 before P1 before P2', () => {
    expect(INCIDENT_SEVERITY_RANK.P0).toBeLessThan(INCIDENT_SEVERITY_RANK.P1);
    expect(INCIDENT_SEVERITY_RANK.P1).toBeLessThan(INCIDENT_SEVERITY_RANK.P2);
    expect(
      compareIncidentsBySeverity(incident({ severity: 'P0' }), incident({ severity: 'P2' }))
    ).toBeLessThan(0);
  });

  it('removes only the resolved incidents', () => {
    const incidents = [
      incident({ id: 'A', severity: 'P2' }),
      incident({ id: 'B', severity: 'P0' }),
      incident({ id: 'C', severity: 'P1' }),
    ];

    const open = selectOpenIncidents(incidents, ['A']);
    expect(open.map((item) => item.id)).toEqual(['B', 'C']);
  });

  it('returns an empty list when everything is resolved', () => {
    expect(selectOpenIncidents([incident({ id: 'A' })], ['A'])).toEqual([]);
  });

  it('does not mutate the caller array', () => {
    const incidents = [incident({ id: 'A', severity: 'P2' }), incident({ id: 'B', severity: 'P0' })];
    selectOpenIncidents(incidents, []);
    expect(incidents[0].id).toBe('A');
  });
});
