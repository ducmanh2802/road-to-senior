import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import CertificationPage from '../pages/CertificationPage.vue';
import { routes } from '../router';
import { useLearningStore } from '../stores/learning';
import { ALL_MS_MODULES } from '../../data/microservices';
import { JUDGMENT_SCENARIOS } from '../../data/judgmentScenarios';
import { applicableStages } from '../../engines/microservices';
import {
  evaluateCertification,
  computeCertificationDimensions,
  describeCertification,
  CERTIFICATION_DIMENSIONS,
  CERTIFICATION_DIMENSION_THRESHOLD,
  type CertificationInput,
} from '../../engines/certificationEngine';

function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes });
}

function emptyInput(): CertificationInput {
  return {
    msModules: ALL_MS_MODULES,
    msProgress: {},
    judgmentRecords: {},
    javaCompletedModuleIds: [],
    javaModuleStageProgress: {},
    completedEnglishItemIds: [],
    completedEnglishTotal: 10,
    completedAiTopicIds: [],
    completedAiTotal: 9,
    knowledgeTopicCount: 8,
    masteredKnowledgeTopicCount: 0,
    judgmentScenarioTotal: JUDGMENT_SCENARIOS.length,
  };
}

describe('Phase Z — certification engine never fakes completion', () => {
  it('defines exactly the thirteen mission §9 dimensions', () => {
    expect(CERTIFICATION_DIMENSIONS).toEqual([
      'knowledge',
      'design',
      'implementation',
      'debugging',
      'optimization',
      'communication',
      'architecture',
      'production',
      'security',
      'reliability',
      'judgment',
      'leadership',
      'defense',
    ]);
    expect(CERTIFICATION_DIMENSIONS).toHaveLength(13);
  });

  it('reports NOT_CERTIFIED with zero evidence on every dimension', () => {
    const verdict = evaluateCertification(emptyInput());

    expect(verdict.certified).toBe(false);
    expect(verdict.verdict).toBe('NOT_CERTIFIED');
    expect(verdict.dimensionsMet).toBe(0);
    expect(verdict.overallPercent).toBe(0);
    expect(verdict.dimensions).toHaveLength(13);
  });

  it('reports every dimension as NO EVIDENCE rather than a fabricated score', () => {
    const dimensions = computeCertificationDimensions(emptyInput());
    dimensions.forEach((dimension) => {
      if (dimension.status === 'NO_EVIDENCE_SOURCE') return;
      expect(dimension.recorded).toBe(0);
      expect(dimension.percent).toBe(0);
      expect(dimension.met).toBe(false);
    });
  });

  it('reports Leadership as NO_EVIDENCE_SOURCE instead of scoring it zero', () => {
    const dimensions = computeCertificationDimensions(emptyInput());
    const leadership = dimensions.find((dimension) => dimension.dimension === 'leadership');

    expect(leadership?.status).toBe('NO_EVIDENCE_SOURCE');
    expect(leadership?.percent).toBeNull();
    expect(leadership?.recorded).toBeNull();
    expect(leadership?.available).toBeNull();
    expect(leadership?.met).toBe(false);
  });

  it('never certifies, even with maximum recorded evidence on every scored dimension', () => {
    const input = emptyInput();
    const progress = { ...input.msProgress };

    ALL_MS_MODULES.forEach((module) => {
      applicableStages(module).forEach((stage) => {
        progress[module.id] = {
          ...progress[module.id],
          moduleId: module.id,
          stages: [...new Set([...(progress[module.id]?.stages ?? []), stage])],
          codeLabCompletions: module.codeLabs.map((lab) => lab.id),
          failureLabsPassed: module.failureLabs.map((lab) => lab.id),
          benchmarksCompleted: module.benchmark ? [module.benchmark.title] : [],
          designsCompleted: module.architectureChallenge ? [module.architectureChallenge.id] : [],
          assessmentScore: 100,
          explanationScore: 100,
          defenseScore: 100,
          incidentsResolved: ['synthetic-incident'],
        };
      });
    });

    const verdict = evaluateCertification({
      ...input,
      msProgress: progress,
      judgmentRecords: Object.fromEntries(
        JUDGMENT_SCENARIOS.map((item) => [
          item.id,
          {
            scenarioId: item.id,
            level: 'SENIOR' as const,
            score: 100,
            correctDecision: true,
            confidence: 95,
            calibrationVerdict: 'WELL_CALIBRATED' as const,
            calibrationError: 5,
            attemptedAt: '2026-01-01T00:00:00.000Z',
          },
        ])
      ),
      javaCompletedModuleIds: ['1.1', '1.2', '1.3'],
      completedEnglishItemIds: Array.from({ length: 10 }, (_, i) => `en-${i}`),
      completedAiTopicIds: Array.from({ length: 9 }, (_, i) => `ai-${i}`),
      masteredKnowledgeTopicCount: 8,
    });

    // Every scorable dimension is now satisfied...
    expect(verdict.dimensionsMet).toBeGreaterThanOrEqual(12);
    expect(verdict.unmetDimensions).toHaveLength(0);
    // ...and it is STILL not certified, because leadership has no source.
    expect(verdict.certified).toBe(false);
    expect(verdict.verdict).toBe('NOT_CERTIFIED');
    expect(verdict.missingSources).toEqual(['leadership']);
  });

  it('scores each dimension from recorded evidence only', () => {
    const module = ALL_MS_MODULES[0];
    const progress = {
      [module.id]: {
        moduleId: module.id,
        stages: ['code' as const],
        startedAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        attempts: 0,
        hintsUsed: 0,
        codeLabCompletions: module.codeLabs.slice(0, 1).map((lab) => lab.id),
        benchmarksCompleted: [],
        designsCompleted: [],
        failureLabsPassed: [],
        failureLabAttempts: 0,
        incidentsResolved: [],
        aiChallengesCompleted: [],
      },
    };

    const dimensions = computeCertificationDimensions({ ...emptyInput(), msProgress: progress });
    const implementation = dimensions.find((dimension) => dimension.dimension === 'implementation')!;

    expect(implementation.recorded).toBe(1);
    expect(implementation.available).toBeGreaterThan(0);
    expect(implementation.percent).toBeLessThan(100);
    expect(implementation.status).toBe('EVIDENCE_PARTIAL');
  });

  it('counts a Phase A decision only at evidence level or above', () => {
    const mk = (level: 'GUESS' | 'PLAUSIBLE' | 'EVIDENCE_DRIVEN' | 'SENIOR') => ({
      [JUDGMENT_SCENARIOS[0].id]: {
        scenarioId: JUDGMENT_SCENARIOS[0].id,
        level,
        score: 50,
        correctDecision: true,
        confidence: 50,
        calibrationVerdict: 'WELL_CALIBRATED' as const,
        calibrationError: 0,
        attemptedAt: '2026-01-01T00:00:00.000Z',
      },
    });

    const guess = computeCertificationDimensions({
      ...emptyInput(),
      judgmentRecords: mk('GUESS'),
    }).find((dimension) => dimension.dimension === 'judgment')!;
    const senior = computeCertificationDimensions({
      ...emptyInput(),
      judgmentRecords: mk('SENIOR'),
    }).find((dimension) => dimension.dimension === 'judgment')!;

    expect(guess.recorded).toBe(0);
    expect(senior.recorded).toBe(1);
  });

  it('excludes unscorable dimensions from the overall percent', () => {
    const verdict = evaluateCertification(emptyInput());
    const scored = verdict.dimensions.filter((dimension) => dimension.percent !== null);
    expect(scored.length).toBe(12);
    expect(verdict.auditTrail.join(' ')).toContain('unscorable dimensions are excluded');
  });

  it('produces an ordered next-evidence list that never targets a missing source', () => {
    const verdict = evaluateCertification(emptyInput());
    expect(verdict.nextEvidence.length).toBeGreaterThan(0);
    expect(verdict.nextEvidence.some((item) => item.dimension === 'leadership')).toBe(false);
    expect(verdict.nextEvidence[0].route).toMatch(/^\//);
  });

  it('renders an honest text summary', () => {
    const text = describeCertification(evaluateCertification(emptyInput()));
    expect(text).toContain('FINAL STATE: NOT CERTIFIED');
    expect(text).toContain('NO EVIDENCE SOURCE');
    expect(text).toContain('MISSING SOURCES: leadership');
    expect(text).toContain('verdict=NOT_CERTIFIED');
    expect(text).not.toContain('SENIOR ENGINEERING MASTERY CERTIFIED');
    expect(text).not.toContain('FINAL STATE: CERTIFIED');
  });
});

describe('Phase Z — Certification page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('registers /certifications/senior-engineering as a real route', async () => {
    const router = makeRouter();
    await router.push('/certifications/senior-engineering');
    await router.isReady();
    expect(router.currentRoute.value.name).toBe('certifications-senior-engineering');
  });

  it('shows NOT CERTIFIED and no fabricated dimension for a fresh learner', () => {
    const wrapper = mount(CertificationPage, { global: { plugins: [makeRouter()] } });

    expect(wrapper.find('[data-testid="certification-page"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="certification-verdict"]').text()).toContain('NOT CERTIFIED');
    expect(wrapper.text()).not.toContain('MASTERY CERTIFIED');

    for (const dimension of CERTIFICATION_DIMENSIONS) {
      expect(wrapper.find(`[data-testid="cert-dimension-${dimension}"]`).exists()).toBe(true);
    }
    expect(wrapper.find('[data-testid="cert-dimension-leadership"]').text()).toContain('NO EVIDENCE SOURCE');
  });

  it('reflects real evidence without ever certifying', () => {
    const store = useLearningStore();
    const wrapper = mount(CertificationPage, { global: { plugins: [makeRouter()] } });

    const module = ALL_MS_MODULES[0];
    store.recordMsCodeLab(module.id, module.codeLabs[0]?.id ?? 'lab');
    store.recordMsAssessmentScore('1.1', 90);

    expect(wrapper.find('[data-testid="cert-dimension-implementation"]').text()).toContain('/');
    expect(wrapper.find('[data-testid="certification-verdict"]').text()).toContain('NOT CERTIFIED');
    expect(store.certification.dimensionsMet).toBeGreaterThanOrEqual(0);
  });

  it('derives the verdict from persisted evidence, not in-memory state', () => {
    const first = useLearningStore();
    const module = ALL_MS_MODULES[0];
    first.recordMsDesign(module.id, module.architectureChallenge?.id ?? 'challenge');

    setActivePinia(createPinia());
    const second = useLearningStore();

    const design = second.certification.dimensions.find(
      (dimension) => dimension.dimension === 'design'
    );
    expect(design?.recorded).toBe(1);
    expect(design?.percent).toBeGreaterThan(0);
    expect(second.certification.certified).toBe(false);
    expect(CERTIFICATION_DIMENSION_THRESHOLD).toBe(80);
  });
});
