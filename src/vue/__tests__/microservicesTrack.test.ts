import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import MicroservicesPage from '../pages/MicroservicesPage.vue';
import { routes } from '../router';
import { useLearningStore, STORAGE_KEY } from '../stores/learning';
import { ALL_MS_MODULES, ALL_MS_INCIDENTS, ALL_MS_PHASES } from '../../data/microservices';
import { applicableStages, isModuleComplete } from '../../engines/microservices';

function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes });
}

/**
 * Completes a module through the same store actions the UI calls, so that
 * prerequisite gating can be satisfied honestly instead of by faking state.
 */
function completeModule(store: ReturnType<typeof useLearningStore>, moduleId: string): void {
  const module = ALL_MS_MODULES.find((m) => m.id === moduleId);
  if (!module) throw new Error(`Unknown module ${moduleId}`);
  module.prerequisites.forEach((prereq) => completeModule(store, prereq));
  applicableStages(module).forEach((stage) => store.recordMsStage(moduleId, stage));
  module.codeLabs.forEach((lab) => store.recordMsCodeLab(moduleId, lab.id));
  module.failureLabs.forEach((lab) => store.recordMsFailureLab(moduleId, lab.id, true));
  if (module.benchmark) store.recordMsBenchmark(moduleId, module.benchmark.title);
  if (module.architectureChallenge) store.recordMsDesign(moduleId, module.architectureChallenge.id);
  store.recordMsAssessmentScore(moduleId, 100);
}

describe('Phase P0-W1 — Microservices track reachability', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('routes /learning/microservices to a real page, not PagePlaceholder', async () => {
    const router = makeRouter();
    await router.push('/learning/microservices');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('learning-microservices');
    const resolved = router.currentRoute.value.matched[0];
    expect(resolved?.components?.default).toBeDefined();
    // The route must NOT resolve to the placeholder component.
    const placeholder = routes.find((r) => r.name === 'not-found')?.component;
    expect(resolved?.components?.default).not.toBe(placeholder);
  });

  it('exposes every curriculum module and phase to the UI', () => {
    const wrapper = mount(MicroservicesPage);
    for (const phase of ALL_MS_PHASES) {
      expect(wrapper.find(`[data-testid="ms-phase-${phase.id}"]`).exists()).toBe(true);
    }
    // M1.1 has no prerequisites, so it is always rendered and selectable.
    expect(wrapper.find('[data-testid="ms-module-M1.1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="microservices-page"]').exists()).toBe(true);
  });

  it('renders the 12 competency dimensions with NO EVIDENCE before any work', () => {
    const wrapper = mount(MicroservicesPage);
    const text = wrapper.text();
    expect(text).toContain('NO EVIDENCE');
    expect(text).not.toContain('CERTIFIED');
    // Nothing is fabricated: track progress starts at 0%.
    expect(wrapper.text()).toContain('0%');
  });

  it('records real learner evidence and derives module completion from it', async () => {
    const wrapper = mount(MicroservicesPage);
    const store = useLearningStore();

    expect(store.msCompletedModuleIds).toHaveLength(0);

    const module = ALL_MS_MODULES.find((m) => m.id === 'M1.1')!;
    expect(isModuleComplete(module, undefined)).toBe(false);

    await wrapper.find('[data-testid="ms-module-M1.1"]').trigger('click');
    await wrapper.find('[data-testid="ms-mark-learn"]').trigger('click');

    const record = store.getMsModuleRecord('M1.1');
    expect(record?.stages).toContain('learn');
    // One stage out of many: still not complete.
    expect(isModuleComplete(module, record)).toBe(false);
    expect(store.msCompletedModuleIds).not.toContain('M1.1');
  });

  it('persists microservices evidence to SENIOR_JAVA_180_STATE_V1', () => {
    const store = useLearningStore();
    store.recordMsStage('M1.1', 'learn');
    store.recordMsCodeLab('M1.1', 'lab-x');

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.msProgress['M1.1'].stages).toContain('learn');
    expect(parsed.msProgress['M1.1'].codeLabCompletions).toContain('lab-x');
  });

  it('restores microservices evidence after a reload', () => {
    const first = useLearningStore();
    first.recordMsStage('M2.1', 'learn');
    first.recordMsAssessmentScore('M2.1', 42);

    // Simulate a page refresh: new Pinia, same localStorage.
    setActivePinia(createPinia());
    const second = useLearningStore();

    expect(second.getMsModuleRecord('M2.1')?.stages).toContain('learn');
    expect(second.getMsModuleRecord('M2.1')?.assessmentScore).toBe(42);
  });

  it('preserves previously unpersisted Java/AI/English evidence across reloads', () => {
    const first = useLearningStore();
    first.recordJavaModuleStage('1.3', 'break');
    first.recordJavaAssessmentScore('1.3', 90, true);
    first.toggleAiTopicCompletion('ai-rag-01');
    first.toggleEnglishItemCompletion('en-01');

    setActivePinia(createPinia());
    const second = useLearningStore();

    expect(second.getModuleStagesCompleted('1.3')).toContain('break');
    expect(second.isJavaModuleCompleted('1.3')).toBe(true);
    expect(second.isAiTopicCompleted('ai-rag-01')).toBe(true);
    expect(second.isEnglishItemCompleted('en-01')).toBe(true);
  });

  it('tolerates a corrupted evidence field instead of failing the whole state', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentDay: 42,
        completedJavaModuleIds: 'not-an-array',
        msProgress: 'garbage',
        javaModuleStageProgress: 7,
      })
    );
    const store = useLearningStore();

    expect(store.currentDay).toBe(42);
    expect(store.status).toBe('success');
    expect(store.completedJavaModuleIds).toEqual([]);
    expect(store.msProgress).toEqual({});
    expect(store.getModuleStagesCompleted('1.1')).toEqual([]);
  });

  it('clear() wipes every evidence field, not only the seed arrays', () => {
    const store = useLearningStore();
    store.recordMsStage('M1.1', 'learn');
    store.recordJavaModuleStage('1.1', 'learn');
    store.toggleAiTopicCompletion('ai-rag-01');

    store.resetToDemo();

    expect(store.msProgress).toEqual({});
    expect(store.completedJavaModuleIds).toEqual([]);
    expect(store.completedAiTopicIds).toEqual([]);
    expect(store.javaModuleStageProgress).toEqual({});
  });

  it('exports and re-imports Java evidence (previously lost by export)', () => {
    const source = useLearningStore();
    source.recordJavaAssessmentScore('1.3', 90, true);
    source.recordMsStage('M1.1', 'learn');
    const json = source.exportDataAsJson();

    setActivePinia(createPinia());
    const target = useLearningStore();
    expect(target.importDataFromJson(json)).toBe(true);

    expect(target.isJavaModuleCompleted('1.3')).toBe(true);
    expect(target.getMsModuleRecord('M1.1')?.stages).toContain('learn');
  });
});

describe('Phase P0-W1 — incident triage records evidence only on a correct triage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('lists every incident as open before any triage', () => {
    const store = useLearningStore();
    expect(store.msOpenIncidents.length).toBe(ALL_MS_INCIDENTS.length);
  });

  it('surfaces a wrong triage as a failed state and records no evidence', async () => {
    const store = useLearningStore();
    const incident = ALL_MS_INCIDENTS[0];
    completeModule(store, incident.moduleId);

    const wrapper = mount(MicroservicesPage);
    await wrapper.find(`[data-testid="ms-module-${incident.moduleId}"]`).trigger('click');
    await wrapper.find('[data-testid="ms-tab-incidents"]').trigger('click');
    await wrapper.find(`[data-testid="ms-open-incident-${incident.id}"]`).trigger('click');

    await wrapper.find('[data-testid="ms-triage-hypothesise"]').trigger('click');
    const wrongHypothesis = incident.correctHypothesisIndex === 0 ? 1 : 0;
    await wrapper.find(`[data-testid="ms-incident-hypothesis-${wrongHypothesis}"]`).setValue();
    await wrapper.find('[data-testid="ms-triage-debug"]').trigger('click');
    const wrongRoot = incident.correctRootCauseIndex === 0 ? 1 : 0;
    await wrapper.find(`[data-testid="ms-incident-rootcause-${wrongRoot}"]`).setValue();
    await wrapper.find('[data-testid="ms-triage-fix"]').trigger('click');
    await wrapper.find('[data-testid="ms-incident-applied-fix"]').setValue();
    await wrapper.find('[data-testid="ms-triage-verify"]').trigger('click');
    await wrapper.find('[data-testid="ms-triage-grade"]').trigger('click');

    expect(wrapper.find('[data-testid="ms-incident-failed"]').exists()).toBe(true);
    expect(store.msOpenIncidents.length).toBe(ALL_MS_INCIDENTS.length);
  });

  it('records incident evidence and exposes the postmortem on a correct triage', async () => {
    const store = useLearningStore();
    const incident = ALL_MS_INCIDENTS[0];
    completeModule(store, incident.moduleId);

    const wrapper = mount(MicroservicesPage);
    await wrapper.find(`[data-testid="ms-module-${incident.moduleId}"]`).trigger('click');
    await wrapper.find('[data-testid="ms-tab-incidents"]').trigger('click');
    await wrapper.find(`[data-testid="ms-open-incident-${incident.id}"]`).trigger('click');

    await wrapper.find('[data-testid="ms-triage-hypothesise"]').trigger('click');
    await wrapper
      .find(`[data-testid="ms-incident-hypothesis-${incident.correctHypothesisIndex}"]`)
      .setValue();
    await wrapper.find('[data-testid="ms-triage-debug"]').trigger('click');
    await wrapper
      .find(`[data-testid="ms-incident-rootcause-${incident.correctRootCauseIndex}"]`)
      .setValue();
    await wrapper.find('[data-testid="ms-triage-fix"]').trigger('click');
    await wrapper.find('[data-testid="ms-incident-applied-fix"]').setValue();
    await wrapper.find('[data-testid="ms-triage-verify"]').trigger('click');
    await wrapper.find('[data-testid="ms-triage-grade"]').trigger('click');

    expect(wrapper.find('[data-testid="ms-incident-resolved"]').exists()).toBe(true);
    expect(store.msOpenIncidents.length).toBe(ALL_MS_INCIDENTS.length - 1);
  });
});

describe('Phase P0-W1 — failure lab never reveals the root cause before a choice', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('walks BUG → HYPOTHESISE → INVESTIGATE → FIX and grades deterministically', async () => {
    const store = useLearningStore();
    const wrapper = mount(MicroservicesPage);

    const module = ALL_MS_MODULES.find((m) => m.failureLabs.length > 0 && m.prerequisites.length === 0);
    expect(module).toBeDefined();
    const lab = module!.failureLabs[0];

    await wrapper.find(`[data-testid="ms-module-${module!.id}"]`).trigger('click');
    await wrapper.find('[data-testid="ms-tab-break"]').trigger('click');
    await wrapper.find(`[data-testid="ms-open-lab-${lab.id}"]`).trigger('click');

    expect(wrapper.find('[data-testid="ms-lab-runner"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain(lab.modelExplanation);

    await wrapper
      .find(`[data-testid="ms-hypothesis-${lab.correctHypothesisIndex}"]`)
      .setValue();
    await wrapper.find('[data-testid="ms-lab-investigate"]').trigger('click');
    await wrapper
      .find(`[data-testid="ms-rootcause-${lab.correctRootCauseIndex}"]`)
      .setValue();
    await wrapper.find('[data-testid="ms-lab-fix"]').trigger('click');
    await wrapper.find(`[data-testid="ms-fix-${lab.correctFixIndex}"]`).setValue();
    await wrapper.find('[data-testid="ms-lab-submit"]').trigger('click');

    expect(wrapper.find('[data-testid="ms-lab-result"]').text()).toContain('LAB PASSED');
    expect(store.getMsModuleRecord(module!.id)?.failureLabsPassed).toContain(lab.id);
  });
});