import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LearningJavaPage from '../pages/LearningJavaPage.vue';
import JavaCoreAssessment from '../components/JavaCoreAssessment.vue';
import JavaFailureLab from '../components/JavaFailureLab.vue';
import {
  CANONICAL_JAVA_VERSION,
  CANONICAL_SPRING_BOOT_VERSION,
  CANONICAL_JAVA_MODULES,
  CANONICAL_SPRING_MODULES,
  JAVA_VERSION_METADATA,
  SPRING_BOOT_VERSION_METADATA,
} from '../../data/canonicalStandards';
import {
  JAVA_CORE_MODULES_METADATA,
  MODULE_1_1_CONTENT,
  MODULE_1_2_CONTENT,
} from '../../data/javaCoreCurriculum';
import { useLearningStore } from '../stores/learning';

describe('P0 Java Core Roadmap Metadata & Integrity', () => {
  it('defines all 20 modules across 3 pillars in sequential order', () => {
    expect(JAVA_CORE_MODULES_METADATA.length).toBe(20);

    const languageModules = JAVA_CORE_MODULES_METADATA.filter((m) => m.pillar === 'language');
    const jvmModules = JAVA_CORE_MODULES_METADATA.filter((m) => m.pillar === 'jvm');
    const concurrencyModules = JAVA_CORE_MODULES_METADATA.filter((m) => m.pillar === 'concurrency');

    expect(languageModules.length).toBe(7);
    expect(jvmModules.length).toBe(6);
    expect(concurrencyModules.length).toBe(7);

    // Module 1.1 and 1.2 are active / NOT_STARTED
    expect(JAVA_CORE_MODULES_METADATA[0].id).toBe('1.1');
    expect(JAVA_CORE_MODULES_METADATA[0].status).toBe('NOT_STARTED');

    expect(JAVA_CORE_MODULES_METADATA[1].id).toBe('1.2');
    expect(JAVA_CORE_MODULES_METADATA[1].status).toBe('NOT_STARTED');

    // Modules 1.3 to 3.7 must remain LOCKED
    for (let i = 2; i < JAVA_CORE_MODULES_METADATA.length; i++) {
      const mod = JAVA_CORE_MODULES_METADATA[i];
      expect(mod.status).toBe('LOCKED');
      expect(mod.learningObjective).toBeDefined();
      expect(mod.prerequisites.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('provides complete Module 1.1 engineering loop content without placeholders', () => {
    const c = MODULE_1_1_CONTENT;
    expect(c.learn.overview).toContain('nominal data carriers');
    expect(c.learn.immutabilityDistinctions?.shallow).toContain('final keyword');
    expect(c.learn.immutabilityDistinctions?.deep).toBeDefined();

    expect(c.buildLab.code).toContain('record OrderSnapshot');
    expect(c.buildLab.code).toContain('List.copyOf');

    expect(c.breakLab.vulnerableCode).toContain('VulnerableOrderRecord');
    expect(c.breakLab.hazard).toContain('shallow immutability');

    expect(c.fixLab.fixedCode).toContain('FixedOrderRecord');
    expect(c.fixLab.fixedCode).toContain('List.copyOf');

    expect(c.design.sampleDesignCode).toContain('OrderCreatedEvent');
    expect(c.explain60s.script.length).toBeGreaterThan(100);

    expect(c.staffDefense.questions.length).toBeGreaterThanOrEqual(8);
    expect(c.interviewDrill.questions.length).toBeGreaterThanOrEqual(4);

    // Assessment: min 5 conceptual, 3 code-tracing, 2 debugging, 1 design
    const conceptual = c.assessment.filter((q) => q.type === 'conceptual');
    const tracing = c.assessment.filter((q) => q.type === 'code-tracing');
    const debugging = c.assessment.filter((q) => q.type === 'debugging');
    const design = c.assessment.filter((q) => q.type === 'design');

    expect(conceptual.length).toBeGreaterThanOrEqual(5);
    expect(tracing.length).toBeGreaterThanOrEqual(3);
    expect(debugging.length).toBeGreaterThanOrEqual(2);
    expect(design.length).toBeGreaterThanOrEqual(1);
    expect(c.assessment.length).toBe(11);
  });

  it('provides complete Module 1.2 engineering loop content (Sealed Classes & Exhaustive Switches)', () => {
    const c = MODULE_1_2_CONTENT;
    expect(c.learn.overview).toContain('Sealed classes and interfaces');
    expect(c.learn.domainModelDistinctions?.closedHierarchy).toContain('immutable set of domain possibilities');

    expect(c.buildLab.code).toContain('sealed interface PaymentResult');
    expect(c.buildLab.code).toContain('record Success');
    expect(c.buildLab.code).toContain('record Declined');

    expect(c.breakLab.vulnerableCode).toContain('BrittlePaymentHandler');
    expect(c.breakLab.hazard).toContain('default:');

    expect(c.fixLab.fixedCode).toContain('ExhaustivePaymentHandler');
    expect(c.design.sampleDesignCode).toContain('OrderState');
    expect(c.explain60s.script).toContain('closed type hierarchy');

    expect(c.staffDefense.questions.length).toBeGreaterThanOrEqual(8);
    expect(c.interviewDrill.questions.length).toBeGreaterThanOrEqual(4);

    const conceptual = c.assessment.filter((q) => q.type === 'conceptual');
    const tracing = c.assessment.filter((q) => q.type === 'code-tracing');
    const debugging = c.assessment.filter((q) => q.type === 'debugging');
    const design = c.assessment.filter((q) => q.type === 'design');

    expect(conceptual.length).toBeGreaterThanOrEqual(5);
    expect(tracing.length).toBeGreaterThanOrEqual(2);
    expect(debugging.length).toBeGreaterThanOrEqual(2);
    expect(design.length).toBeGreaterThanOrEqual(2);
    expect(c.assessment.length).toBe(11);
  });
});

describe('LearningJavaPage.vue (P0 Integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('renders Java 25 LTS header and canonical runtime standards', () => {
    const wrapper = mount(LearningJavaPage);

    expect(wrapper.find('[data-testid="java-version-badge"]').text()).toContain(`${CANONICAL_JAVA_VERSION} LTS`);
    expect(wrapper.find('[data-testid="runtime-standards"]').text()).toContain(JAVA_VERSION_METADATA.runtimeTarget);
    expect(wrapper.find('[data-testid="runtime-standards"]').text()).toContain(JAVA_VERSION_METADATA.supportPolicy);
  });

  it('renders all Java Core modules in the carousel tablist with unlocked 1.1 and 1.2', () => {
    const wrapper = mount(LearningJavaPage);

    for (const mod of JAVA_CORE_MODULES_METADATA) {
      const tab = wrapper.find(`[data-testid="module-tab-${mod.id}"]`);
      expect(tab.exists()).toBe(true);
      if (mod.status === 'LOCKED') {
        expect(tab.attributes('disabled')).toBeDefined();
      } else {
        expect(tab.attributes('disabled')).toBeUndefined();
      }
    }
  });

  it('navigates through all 11 stages of Module 1.1', async () => {
    const wrapper = mount(LearningJavaPage);

    const stageIds = [
      'learn',
      'build',
      'break',
      'observe',
      'debug',
      'fix',
      'benchmark',
      'design',
      'explain',
      'defend',
      'assess',
    ];

    for (const stage of stageIds) {
      const stageBtn = wrapper.find(`[data-testid="stage-tab-${stage}"]`);
      expect(stageBtn.exists()).toBe(true);
      await stageBtn.trigger('click');
      expect(wrapper.find(`[data-testid="stage-${stage}"]`).exists()).toBe(true);
    }
  });

  it('switches to Module 1.2 and renders its 11-stage content', async () => {
    const wrapper = mount(LearningJavaPage);

    const mod12Tab = wrapper.find('[data-testid="module-tab-1.2"]');
    expect(mod12Tab.exists()).toBe(true);
    await mod12Tab.trigger('click');

    expect(wrapper.find('[data-testid="module-1-2-content"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sealed classes and interfaces');

    // Switch to build lab in module 1.2
    await wrapper.find('[data-testid="stage-tab-build"]').trigger('click');
    expect(wrapper.find('[data-testid="stage-build"]').text()).toContain('PaymentResult');

    // Switch to break lab in module 1.2
    await wrapper.find('[data-testid="stage-tab-break"]').trigger('click');
    expect(wrapper.find('[data-testid="stage-break"]').text()).toContain('BrittlePaymentHandler');
  });

  it('shows locked state when trying to access future modules 1.3 to 3.7', async () => {
    const wrapper = mount(LearningJavaPage);

    const lockedTab = wrapper.find('[data-testid="module-tab-1.3"]');
    expect(lockedTab.attributes('disabled')).toBeDefined();
  });
});

describe('JavaFailureLab.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('simulates external mutation and verifies defensive copy fix for module 1.1', async () => {
    const wrapper = mount(JavaFailureLab, {
      props: { moduleId: '1.1' },
    });

    // Initial step 1
    expect(wrapper.find('[data-testid="trigger-mutation-btn"]').exists()).toBe(true);

    // Trigger mutation -> step 2
    await wrapper.find('[data-testid="trigger-mutation-btn"]').trigger('click');
    expect(wrapper.find('[data-testid="apply-fix-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="lab-console"]').text()).toContain('SKU-CORRUPTED');

    // Apply defensive fix -> step 3
    await wrapper.find('[data-testid="apply-fix-btn"]').trigger('click');
    expect(wrapper.emitted('completed')).toBeTruthy();
    expect(wrapper.find('[data-testid="lab-console"]').text()).toContain('FAILURE LAB COMPLETED');
  });

  it('simulates domain evolution fall-through and verifies exhaustive switch fix for module 1.2', async () => {
    const wrapper = mount(JavaFailureLab, {
      props: { moduleId: '1.2' },
    });

    // Initial step 1
    expect(wrapper.find('[data-testid="trigger-mutation-btn"]').text()).toContain('SIMULATE NEW DOMAIN VARIANT');

    // Trigger mutation -> step 2
    await wrapper.find('[data-testid="trigger-mutation-btn"]').trigger('click');
    expect(wrapper.find('[data-testid="apply-fix-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="lab-console"]').text()).toContain('FraudSuspended');

    // Apply exhaustive switch fix -> step 3
    await wrapper.find('[data-testid="apply-fix-btn"]').trigger('click');
    expect(wrapper.emitted('completed')).toBeTruthy();
    expect(wrapper.find('[data-testid="lab-console"]').text()).toContain('FAILURE LAB COMPLETED');
  });
});

describe('JavaCoreAssessment.vue & Strict PASS Criteria', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('requires score >= 80% AND failure lab completion to mark module completed', async () => {
    const store = useLearningStore();
    const questions = MODULE_1_2_CONTENT.assessment;

    const wrapper = mount(JavaCoreAssessment, {
      props: {
        moduleId: '1.2',
        questions,
        failureLabCompleted: false, // Failure lab NOT completed yet
      },
    });

    // Answer questions correctly
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await wrapper.find(`[data-testid="option-${q.correctIndex}"]`).trigger('click');
      await wrapper.find('[data-testid="submit-answer-btn"]').trigger('click');
      await wrapper.find('[data-testid="next-question-btn"]').trigger('click');
    }

    expect(wrapper.find('[data-testid="assessment-summary"]').exists()).toBe(true);
    // Even though score is 100%, failureLabCompleted was false -> not completed in store
    expect(store.isJavaModuleCompleted('1.2')).toBe(false);

    // Now re-mount with failureLabCompleted: true
    const passingWrapper = mount(JavaCoreAssessment, {
      props: {
        moduleId: '1.2',
        questions,
        failureLabCompleted: true,
      },
    });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await passingWrapper.find(`[data-testid="option-${q.correctIndex}"]`).trigger('click');
      await passingWrapper.find('[data-testid="submit-answer-btn"]').trigger('click');
      await passingWrapper.find('[data-testid="next-question-btn"]').trigger('click');
    }

    // Now score is 100% AND failure lab is complete -> PASS
    expect(store.isJavaModuleCompleted('1.2')).toBe(true);
  });
});

describe('Canonical Standards & Backward Compatibility', () => {
  it('maintains canonical standards definitions for Java 25 & Spring Boot 4.1', () => {
    expect(CANONICAL_JAVA_VERSION).toBe('Java 25');
    expect(JAVA_VERSION_METADATA.runtimeTarget).toContain('Java 25 LTS');
    expect(CANONICAL_JAVA_MODULES.length).toBeGreaterThanOrEqual(3);

    expect(CANONICAL_SPRING_BOOT_VERSION).toBe('Spring Boot 4.1');
    expect(SPRING_BOOT_VERSION_METADATA.version).toBe('Spring Boot 4.1');
    expect(CANONICAL_SPRING_MODULES.length).toBeGreaterThanOrEqual(3);
  });
});
