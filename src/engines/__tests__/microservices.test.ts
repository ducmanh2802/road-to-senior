import { describe, it, expect } from 'vitest';
import {
  MS_M5_PHASE,
  MS_M5_MODULES,
  MS_M5_SNAPSHOTS,
  MS_M5_INCIDENTS,
  ALL_MS_MODULES,
} from '../../data/microservices';
import {
  getModuleStatus,
  isModuleUnlocked,
  computeTrackProgress,
  calculateMsCompetencies,
  selectMsNextAction,
  buildMsReviewCard,
  normalizeMsProgressRecords,
  createEmptyProgressRecord,
} from '../microservices';

describe('Phase M5 — Spring Cloud, Security, Polyglot Data & Resilience', () => {
  it('defines valid Phase M5 metadata with 6 modules', () => {
    expect(MS_M5_PHASE.id).toBe('M5');
    expect(MS_M5_PHASE.order).toBe(5);
    expect(MS_M5_PHASE.title).toContain('Spring Cloud, Security');
    expect(MS_M5_MODULES).toHaveLength(6);

    const moduleIds = MS_M5_MODULES.map((m) => m.id);
    expect(moduleIds).toEqual(['M5.1', 'M5.2', 'M5.3', 'M5.4', 'M5.5', 'M5.6']);
  });

  it('authors complete 12-part explanation framework for every M5 module', () => {
    MS_M5_MODULES.forEach((mod) => {
      const exp = mod.explanation;
      expect(exp.whatItIs.length).toBeGreaterThan(20);
      expect(exp.whyItExists.length).toBeGreaterThan(20);
      expect(exp.problemSolved.length).toBeGreaterThan(20);
      expect(exp.internals.length).toBeGreaterThan(20);
      expect(exp.runtimeBehaviour.length).toBeGreaterThan(20);
      expect(exp.tradeoffs.length).toBeGreaterThan(20);
      expect(exp.whatCanFail.length).toBeGreaterThan(20);
      expect(exp.howToObserve.length).toBeGreaterThan(20);
      expect(exp.howToDebug.length).toBeGreaterThan(20);
      expect(exp.howToFix.length).toBeGreaterThan(20);
      expect(exp.whenNotToUse.length).toBeGreaterThan(20);
      expect(exp.seniorQuestion.length).toBeGreaterThan(20);
    });
  });

  it('contains runnable or simulated code labs with explicit criteria', () => {
    MS_M5_MODULES.forEach((mod) => {
      expect(mod.codeLabs.length).toBeGreaterThanOrEqual(1);
      mod.codeLabs.forEach((lab) => {
        expect(lab.id).toContain(mod.id);
        expect(lab.title.length).toBeGreaterThan(10);
        expect(lab.requirements.length).toBeGreaterThanOrEqual(3);
        expect(lab.testCases.length).toBeGreaterThanOrEqual(2);
        expect(lab.hiddenFailureCases.length).toBeGreaterThanOrEqual(1);
        expect(lab.hints.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  it('contains failure labs with complete 8-step diagnostic pipeline', () => {
    MS_M5_MODULES.forEach((mod) => {
      expect(mod.failureLabs.length).toBeGreaterThanOrEqual(1);
      mod.failureLabs.forEach((f) => {
        expect(f.bug.length).toBeGreaterThan(15);
        expect(f.reproduce.length).toBeGreaterThanOrEqual(1);
        expect(f.observe.length).toBeGreaterThanOrEqual(2);
        expect(f.hypothesisOptions.length).toBeGreaterThanOrEqual(2);
        expect(f.correctHypothesisIndex).toBeGreaterThanOrEqual(0);
        expect(f.hypothesisRejection.length).toBeGreaterThanOrEqual(1);
        expect(f.investigate.length).toBeGreaterThanOrEqual(1);
        expect(f.debugOptions.length).toBeGreaterThanOrEqual(2);
        expect(f.fixOptions.length).toBeGreaterThanOrEqual(2);
        expect(f.verify.length).toBeGreaterThanOrEqual(1);
        expect(f.modelExplanation.length).toBeGreaterThan(30);
      });
    });
  });

  it('contains senior defense questions with rubrics and english drills', () => {
    MS_M5_MODULES.forEach((mod) => {
      expect(mod.defenseQuestions.length).toBeGreaterThanOrEqual(2);
      mod.defenseQuestions.forEach((dq) => {
        expect(dq.question.length).toBeGreaterThan(15);
        expect(dq.modelAnswer.length).toBeGreaterThan(30);
        expect(dq.rubric.length).toBeGreaterThanOrEqual(2);
      });

      expect(mod.english.vocabulary.length).toBeGreaterThanOrEqual(4);
      expect(mod.english.sentencePatterns.length).toBeGreaterThanOrEqual(2);
      expect(mod.english.sixtySecondExplanation.length).toBeGreaterThan(50);
      expect(mod.aiReview.risksToCheck.length).toBeGreaterThanOrEqual(2);
      expect(mod.assessment.length).toBe(10);
    });
  });

  it('correctly calculates prerequisite unlocks and module statuses for M5', () => {
    const m51 = MS_M5_MODULES[0];
    const m52 = MS_M5_MODULES[1];

    // M5.1 requires M4.1 and M4.2
    expect(isModuleUnlocked(m51, [])).toBe(false);
    expect(isModuleUnlocked(m51, ['M4.1', 'M4.2'])).toBe(true);

    // M5.2 requires M5.1
    expect(isModuleUnlocked(m52, ['M4.1', 'M4.2'])).toBe(false);
    expect(isModuleUnlocked(m52, ['M4.1', 'M4.2', 'M5.1'])).toBe(true);

    const record = createEmptyProgressRecord('M5.1', new Date().toISOString());
    expect(getModuleStatus(m51, record, ['M4.1', 'M4.2'])).toBe('NOT_STARTED');

    record.stages.push('learn');
    expect(getModuleStatus(m51, record, ['M4.1', 'M4.2'])).toBe('IN_PROGRESS');

    expect(getModuleStatus(m51, record, ['M4.1', 'M4.2', 'M5.1'])).toBe('COMPLETED');
  });

  it('tracks progress and computes competencies across M5 modules', () => {
    const progress: Record<string, ReturnType<typeof createEmptyProgressRecord>> = {};
    MS_M5_MODULES.forEach((m) => {
      const rec = createEmptyProgressRecord(m.id, new Date().toISOString());
      rec.stages = ['learn', 'code', 'break', 'fix', 'explain', 'defend'];
      rec.codeLabCompletions = [m.codeLabs[0].id];
      rec.failureLabsPassed = [m.failureLabs[0].id];
      rec.assessmentScore = 90;
      rec.defenseScore = 85;
      progress[m.id] = rec;
    });

    const trackProgress = computeTrackProgress(MS_M5_MODULES, progress, ['M5.1', 'M5.2']);
    expect(trackProgress.completed).toBe(2);
    expect(trackProgress.total).toBe(6);
    expect(trackProgress.failureLabsPassed).toBe(6);

    const competencies = calculateMsCompetencies(MS_M5_MODULES, progress);
    expect(competencies.length).toBeGreaterThan(0);
    const reliability = competencies.find((c) => c.name === 'Reliability');
    expect(reliability).toBeDefined();
    expect(reliability!.score).toBeGreaterThan(50);
  });

  it('generates deterministic SM-2 review cards for M5 failures', () => {
    const m53 = MS_M5_MODULES.find((m) => m.id === 'M5.3')!;
    const card = buildMsReviewCard(m53, 'FAILURE_LAB_FAILED');
    expect(card.category).toBe('MICROSERVICES');
    expect(card.question).toContain('[M5.3]');
    expect(card.expectedAnswer).toContain('Root cause:');

    const defenseCard = buildMsReviewCard(m53, 'DEFENSE_WEAK');
    expect(defenseCard.category).toBe('MICROSERVICES');
    expect(defenseCard.question).toContain('[M5.3]');
  });

  it('handles Next Action determination prioritising overdue review and active modules', () => {
    const nowIso = new Date().toISOString();
    const action = selectMsNextAction({
      modules: MS_M5_MODULES,
      progress: {},
      completedModuleIds: ['M4.1', 'M4.2'],
      reviewCards: [],
      competencies: [],
      incidents: [],
      nowIso,
    });

    expect(action.moduleId).toBe('M5.1');
    expect(action.stage).toBe('learn');
    expect(action.actionLabel).toBe('Start module');
  });

  it('normalises progress records without loss or corruption', () => {
    const raw = {
      'M5.1': {
        moduleId: 'M5.1',
        stages: ['learn', 'code', 'invalid_stage'],
        attempts: 2,
        hintsUsed: 1,
        codeLabCompletions: ['M5.1-L1'],
        failureLabsPassed: ['M5.1-F1'],
        assessmentScore: 85,
        aiChallengesCompleted: ['challenge-1'],
      },
    };

    const normalised = normalizeMsProgressRecords(raw);
    expect(normalised['M5.1']).toBeDefined();
    expect(normalised['M5.1'].stages).toEqual(['learn', 'code']);
    expect(normalised['M5.1'].attempts).toBe(2);
    expect(normalised['M5.1'].hintsUsed).toBe(1);
    expect(normalised['M5.1'].assessmentScore).toBe(85);
    expect(normalised['M5.1'].aiChallengesCompleted).toEqual(['challenge-1']);
  });

  it('defines M5 Capstone Architecture snapshot and P0 incident drill', () => {
    expect(MS_M5_SNAPSHOTS).toHaveLength(1);
    const snap = MS_M5_SNAPSHOTS[0];
    expect(snap.phase).toBe('M5');
    expect(snap.services.length).toBeGreaterThanOrEqual(6);
    expect(snap.infrastructure.length).toBeGreaterThanOrEqual(4);

    expect(MS_M5_INCIDENTS).toHaveLength(1);
    const inc = MS_M5_INCIDENTS[0];
    expect(inc.id).toBe('M5-INC-01');
    expect(inc.severity).toBe('P0');
    expect(inc.moduleId).toBe('M5.6');
    expect(inc.hypothesisOptions.length).toBeGreaterThanOrEqual(3);
    expect(inc.rootCauseOptions.length).toBeGreaterThanOrEqual(2);
    expect(inc.postmortem.rootCause).toContain('payment provider');
  });
});
