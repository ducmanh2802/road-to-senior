import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import EngineeringJudgmentPage from '../pages/EngineeringJudgmentPage.vue';
import { routes } from '../router';
import { useLearningStore, STORAGE_KEY } from '../stores/learning';
import { JUDGMENT_SCENARIOS } from '../../data/judgmentScenarios';
import {
  evaluateJudgment,
  computeJudgmentTrackProgress,
  normalizeJudgmentRecords,
  selectJudgmentRemediation,
  isJudgmentPassed,
  JUDGMENT_PASS_LEVELS,
  type DecisionSubmission,
} from '../../engines/judgmentEngine';

function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes });
}

const scenario = JUDGMENT_SCENARIOS[0]; // JUD-01 — latency regression

function submission(overrides: Partial<DecisionSubmission> = {}): DecisionSubmission {
  return {
    chosenOptionIndex: scenario.correctOptionIndex,
    reasoning:
      'The trace waterfall isolates the bottleneck before I change anything, because a cache without a hit-rate dashboard would hide the regression rather than locate it.',
    investigationPlan:
      'First read the p99 trace waterfall for one slow checkout, then follow the slowest span into the database query plan, then compare thread-pool queue depth.',
    claimedSignals: ['metric', 'percentile', 'trace'],
    confidence: 50,
    falsification:
      'If the slowest span is a database query whose plan has not changed, the cause is data volume rather than code, and a cache would mask a growing lock problem.',
    ...overrides,
  };
}

describe('Phase A — judgment engine distinguishes reasoning depth', () => {
  it('rates a bare correct guess as GUESS, never above', () => {
    const evaluation = evaluateJudgment(
      scenario,
      submission({
        reasoning: 'looks like a cache problem',
        investigationPlan: 'add cache',
        claimedSignals: [],
        falsification: '',
        confidence: 100,
      })
    );

    expect(evaluation.correctDecision).toBe(true);
    expect(evaluation.level).toBe('GUESS');
    expect(evaluation.rightAnswerWrongReason).toBe(true);
    expect(isJudgmentPassed({ level: evaluation.level } as never)).toBe(false);
  });

  it('rates a correct instinct with one cited signal as PLAUSIBLE', () => {
    const evaluation = evaluateJudgment(
      scenario,
      submission({
        claimedSignals: ['metric'],
        falsification: '',
        confidence: 60,
      })
    );

    expect(evaluation.correctDecision).toBe(true);
    expect(evaluation.level).toBe('PLAUSIBLE');
    expect(JUDGMENT_PASS_LEVELS).not.toContain(evaluation.level);
  });

  it('rates multiple cited signals without a falsifier as EVIDENCE_DRIVEN', () => {
    const evaluation = evaluateJudgment(
      scenario,
      submission({ claimedSignals: ['metric', 'trace', 'database'], falsification: '' })
    );

    expect(evaluation.level).toBe('EVIDENCE_DRIVEN');
    expect(isJudgmentPassed({ level: evaluation.level } as never)).toBe(true);
  });

  it('reaches SENIOR only with a correct action, evidence AND a falsifier', () => {
    const evaluation = evaluateJudgment(scenario, submission({ confidence: 95 }));

    expect(evaluation.level).toBe('SENIOR');
    expect(evaluation.correctDecision).toBe(true);
    // Every signal the learner cited is available in this scenario, so it earns credit.
    const credited = evaluation.signals.filter((signal) => signal.claimed);
    expect(credited.length).toBe(3);
    expect(credited.every((signal) => signal.credit)).toBe(true);
  });

  it('penalises falling for the documented tempting shortcut', () => {
    const shortcutIndex = scenario.options.findIndex(
      (option) => option.action === scenario.temptingShortcut
    );
    expect(shortcutIndex).toBeGreaterThanOrEqual(0);

    const withShortcut = evaluateJudgment(
      scenario,
      submission({ chosenOptionIndex: shortcutIndex, confidence: 95 })
    );
    const withoutShortcut = evaluateJudgment(scenario, submission({ confidence: 95 }));

    expect(withShortcut.fellForTemptingShortcut).toBe(true);
    expect(withShortcut.level).not.toBe('SENIOR');
    expect(withShortcut.score).toBeLessThan(withoutShortcut.score);
    expect(withShortcut.feedback).toContain('tempting shortcut');
  });

  it('refuses to credit a signal the scenario does not provide', () => {
    const evaluation = evaluateJudgment(
      scenario,
      submission({
        claimedSignals: ['metric', 'trace', 'cache-hit-rate', 'network'],
        confidence: 95,
      })
    );

    const unavailable = evaluation.signals.filter((signal) => !signal.credit);
    expect(unavailable.length).toBeGreaterThan(0);
    // cache-hit-rate and network are not in JUD-01's available evidence.
    expect(scenario.availableEvidence).not.toContain('cache-hit-rate');
    expect(evaluation.seniorGaps.join(' ')).toContain('not available in this scenario');
  });

  it('penalises overconfidence more than honest uncertainty', () => {
    const overconfident = evaluateJudgment(scenario, submission({ confidence: 100 }));
    const calibrated = evaluateJudgment(scenario, submission({ confidence: 95 }));

    expect(overconfident.calibrationVerdict).toBe('OVERCONFIDENT');
    expect(calibrated.calibrationVerdict).toBe('WELL_CALIBRATED');
    expect(overconfident.seniorGaps.join(' ')).toContain('Overconfidence');
  });

  it('flags a wrong action reached through a sound method', () => {
    const evaluation = evaluateJudgment(
      scenario,
      submission({ chosenOptionIndex: 3, claimedSignals: ['metric', 'trace', 'database'] })
    );

    expect(evaluation.correctDecision).toBe(false);
    expect(evaluation.wrongAnswerRightReason).toBe(true);
  });

  it('produces a fully explainable audit trail', () => {
    const evaluation = evaluateJudgment(scenario, submission({ confidence: 95 }));
    expect(evaluation.auditTrail.length).toBeGreaterThanOrEqual(5);
    expect(evaluation.auditTrail.join(' ')).toContain('chose the correct action');
    expect(evaluation.auditTrail.join(' ')).toContain('evidence coverage');
    expect(evaluation.auditTrail.join(' ')).toContain('disprove');
  });

  it('every scenario declares exactly one correct option and rejects the rest', () => {
    for (const item of JUDGMENT_SCENARIOS) {
      expect(item.options.length).toBeGreaterThanOrEqual(4);
      expect(item.correctOptionIndex).toBeGreaterThanOrEqual(0);
      expect(item.correctOptionIndex).toBeLessThan(item.options.length);
      expect(item.rejectedAlternatives.length).toBe(item.options.length - 1);
      expect(item.availableEvidence.length).toBeGreaterThanOrEqual(3);
      expect(item.falsifier.length).toBeGreaterThan(40);
      expect(item.verification.length).toBeGreaterThan(30);
      // The trap must be one of the offered options, otherwise it is not a trap.
      expect(item.options.some((option) => option.action === item.temptingShortcut)).toBe(true);
      // The trap must never be the correct answer.
      expect(item.options[item.correctOptionIndex].action).not.toBe(item.temptingShortcut);
    }
  });
});

describe('Phase A — track progress and remediation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('reports no evidence before any attempt', () => {
    const progress = computeJudgmentTrackProgress(JUDGMENT_SCENARIOS, {});
    expect(progress.attempted).toBe(0);
    expect(progress.passed).toBe(0);
    expect(progress.averageScore).toBe(0);
    expect(progress.averageCalibrationError).toBe(0);
    expect(progress.untouchedDomains.length).toBeGreaterThan(0);
  });

  it('routes remediation to an unproven trap before an untouched scenario', () => {
    const remediation = selectJudgmentRemediation(JUDGMENT_SCENARIOS, {});
    expect(remediation).not.toBeNull();
    expect(remediation!.id).toBe(JUDGMENT_SCENARIOS[0].id);
  });

  it('routes remediation to a scenario the learner got wrong', () => {
    const target = JUDGMENT_SCENARIOS[2];
    const records = {
      [JUDGMENT_SCENARIOS[0].id]: {
        scenarioId: JUDGMENT_SCENARIOS[0].id,
        level: 'SENIOR' as const,
        score: 100,
        correctDecision: true,
        confidence: 95,
        calibrationVerdict: 'WELL_CALIBRATED' as const,
        calibrationError: 5,
        attemptedAt: '2026-01-01T00:00:00.000Z',
      },
      [target.id]: {
        scenarioId: target.id,
        level: 'GUESS' as const,
        score: 0,
        correctDecision: false,
        confidence: 100,
        calibrationVerdict: 'OVERCONFIDENT' as const,
        calibrationError: 100,
        attemptedAt: '2026-01-01T00:00:00.000Z',
      },
    };
    expect(selectJudgmentRemediation(JUDGMENT_SCENARIOS, records)?.id).toBe(target.id);
  });

  it('drops a corrupted record instead of inventing a score', () => {
    const normalized = normalizeJudgmentRecords({
      [scenario.id]: { level: 'NOT_A_LEVEL', score: 'high' },
      'JUD-XX': { level: 'SENIOR', score: 90, confidence: 80 },
      'JUD-YY': 'garbage',
    });

    expect(normalized[scenario.id]).toBeUndefined();
    expect(normalized['JUD-XX'].score).toBe(90);
    expect(normalized['JUD-XX'].calibrationError).toBe(0);
    expect(normalized['JUD-YY']).toBeUndefined();
  });
});

describe('Phase A — Judgment Lab UI', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('registers /engineering/judgment as a real route', async () => {
    const router = makeRouter();
    await router.push('/engineering/judgment');
    await router.isReady();
    expect(router.currentRoute.value.name).toBe('engineering-judgment');
  });

  it('never claims certification and shows no evidence before work', () => {
    const wrapper = mount(EngineeringJudgmentPage);
    const text = wrapper.text();

    expect(text).toContain('Engineering Judgment Lab');
    expect(text).not.toContain('CERTIFIED');
    expect(wrapper.find('[data-testid="judgment-page"]').exists()).toBe(true);
    for (const level of ['GUESS', 'PLAUSIBLE', 'EVIDENCE_DRIVEN', 'SENIOR']) {
      expect(wrapper.find(`[data-testid="ladder-${level}"]`).exists()).toBe(true);
    }
  });

  it('refuses to submit without reasoning, a plan and a falsifier', async () => {
    const wrapper = mount(EngineeringJudgmentPage);
    const submit = wrapper.find('[data-testid="judgment-submit"]');

    expect(submit.attributes('disabled')).toBeDefined();

    await wrapper.find(`[data-testid="judgment-option-${scenario.options[scenario.correctOptionIndex].id}"] input`).setValue();
    expect(submit.attributes('disabled')).toBeDefined();

    await wrapper.find('[data-testid="judgment-reasoning"] textarea').setValue(
      'The trace isolates the bottleneck before any change, so a cache cannot hide the regression.'
    );
    await wrapper.find('[data-testid="judgment-plan"] textarea').setValue(
      'Read the p99 trace waterfall first, then follow the slowest span into the query plan.'
    );
    // Falsifier still missing.
    expect(submit.attributes('disabled')).toBeDefined();

    await wrapper.find('[data-testid="judgment-falsification"] textarea').setValue(
      'If the slowest span is an unchanged query plan, the cause is data volume and a cache would mask it.'
    );
    expect(submit.attributes('disabled')).toBeUndefined();
  });

  it('records evidence, persists it, and reflects it after a reload', async () => {
    const store = useLearningStore();
    const wrapper = mount(EngineeringJudgmentPage);

    await wrapper.find(`[data-testid="judgment-option-${scenario.options[scenario.correctOptionIndex].id}"] input`).setValue();
    await wrapper.find('[data-testid="judgment-signal-metric"]').trigger('click');
    await wrapper.find('[data-testid="judgment-signal-trace"]').trigger('click');
    await wrapper.find('[data-testid="judgment-reasoning"] textarea').setValue(
      'The trace isolates the bottleneck before any change, so a cache cannot hide the regression.'
    );
    await wrapper.find('[data-testid="judgment-plan"] textarea').setValue(
      'Read the p99 trace waterfall first, then follow the slowest span into the query plan.'
    );
    await wrapper.find('[data-testid="judgment-falsification"] textarea').setValue(
      'If the slowest span is an unchanged query plan, the cause is data volume and a cache would mask it.'
    );
    await wrapper.find('[data-testid="judgment-confidence"]').setValue('95');
    await wrapper.find('[data-testid="judgment-submit"]').trigger('click');

    expect(wrapper.find('[data-testid="judgment-result"]').exists()).toBe(true);
    expect(store.judgmentProgress.attempted).toBe(1);
    expect(store.judgmentRecords[scenario.id].level).toBe('SENIOR');

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    expect(persisted.judgmentRecords[scenario.id].score).toBeGreaterThan(0);

    setActivePinia(createPinia());
    const reloaded = useLearningStore();
    expect(reloaded.judgmentProgress.attempted).toBe(1);
    expect(reloaded.judgmentRecords[scenario.id].level).toBe('SENIOR');
  });

  it('marks a tempting shortcut in the UI when the learner takes it', async () => {
    const store = useLearningStore();
    const wrapper = mount(EngineeringJudgmentPage);

    const shortcutIndex = scenario.options.findIndex(
      (option) => option.action === scenario.temptingShortcut
    );

    await wrapper.find(`[data-testid="judgment-option-${scenario.options[shortcutIndex].id}"] input`).setValue();
    await wrapper.find('[data-testid="judgment-reasoning"] textarea').setValue(
      'Adding a cache is the fastest way to reduce read latency for the checkout path right now.'
    );
    await wrapper.find('[data-testid="judgment-plan"] textarea').setValue(
      'Add a Redis cache in front of the database and watch the latency drop afterwards.'
    );
    await wrapper.find('[data-testid="judgment-falsification"] textarea').setValue(
      'If the latency does not improve then the cache was not the bottleneck and I should investigate further.'
    );
    await wrapper.find('[data-testid="judgment-confidence"]').setValue('100');
    await wrapper.find('[data-testid="judgment-submit"]').trigger('click');

    expect(store.judgmentRecords[scenario.id].correctDecision).toBe(false);
    expect(wrapper.find('[data-testid="judgment-result"]').text()).toContain('FELL FOR THE SHORTCUT');
  });

  it('searches scenarios', async () => {
    const wrapper = mount(EngineeringJudgmentPage);
    const search = wrapper.find('[data-testid="judgment-search"]');

    await search.setValue('rebalance');
    expect(wrapper.find('[data-testid="judgment-scenario-JUD-02"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="judgment-scenario-JUD-01"]').exists()).toBe(false);

    await search.setValue('zzz-no-match');
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });
});