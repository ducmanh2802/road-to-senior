import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LearningJavaPage from '../pages/LearningJavaPage.vue';
import {
  CANONICAL_JAVA_VERSION,
  CANONICAL_SPRING_BOOT_VERSION,
  CANONICAL_JAVA_MODULES,
  CANONICAL_SPRING_MODULES,
  JAVA_VERSION_METADATA,
  SPRING_BOOT_VERSION_METADATA,
} from '../../data/canonicalStandards';

describe('LearningJavaPage.vue', () => {
  it('renders Java 25 LTS header and canonical runtime standards', () => {
    const wrapper = mount(LearningJavaPage);

    expect(wrapper.find('[data-testid="java-version-badge"]').text()).toContain(`${CANONICAL_JAVA_VERSION} LTS`);
    expect(wrapper.find('[data-testid="runtime-standards"]').text()).toContain(JAVA_VERSION_METADATA.runtimeTarget);
    expect(wrapper.find('[data-testid="runtime-standards"]').text()).toContain(JAVA_VERSION_METADATA.supportPolicy);
  });

  it('renders all canonical Java 25 modules in topic tabs', () => {
    const wrapper = mount(LearningJavaPage);

    for (const module of CANONICAL_JAVA_MODULES) {
      const tab = wrapper.find(`[data-testid="topic-tab-${module.id}"]`);
      expect(tab.exists()).toBe(true);
      expect(tab.text()).toContain(module.title);
    }
  });

  it('renders CodeBlock component with active Java 25 code snippet by default', () => {
    const wrapper = mount(LearningJavaPage);

    const codeBlock = wrapper.find('[data-testid="code-block"]');
    expect(codeBlock.exists()).toBe(true);
    expect(codeBlock.text()).toContain('OrderSummary');
    expect(wrapper.find('[data-testid="code-language"]').text()).toBe('[JAVA]');
  });

  it('switches learning loop stages seamlessly', async () => {
    const wrapper = mount(LearningJavaPage);

    // Default stage is code
    expect(wrapper.find('[data-testid="stage-code"]').exists()).toBe(true);

    // Switch to Theory
    await wrapper.find('[data-testid="stage-tab-theory"]').trigger('click');
    expect(wrapper.find('[data-testid="stage-theory"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stage-theory"]').text()).toContain('ARCHITECTURAL FOUNDATION & THEORY');

    // Switch to Break (Chaos)
    await wrapper.find('[data-testid="stage-tab-break"]').trigger('click');
    expect(wrapper.find('[data-testid="stage-break"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stage-break"]').text()).toContain('Production Concurrency Hazard');

    // Switch to Debug
    await wrapper.find('[data-testid="stage-tab-debug"]').trigger('click');
    expect(wrapper.find('[data-testid="stage-debug"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stage-debug"]').text()).toContain('Senior Mitigation Strategy');

    // Switch to Explain
    await wrapper.find('[data-testid="stage-tab-explain"]').trigger('click');
    expect(wrapper.find('[data-testid="stage-explain"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stage-explain"]').text()).toContain('ACTIVE EXPLANATION DRILL');

    // Switch to Interview
    await wrapper.find('[data-testid="stage-tab-interview"]').trigger('click');
    expect(wrapper.find('[data-testid="stage-interview"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stage-interview"]').text()).toContain('STAFF / SENIOR INTERVIEW ANSWER');
  });

  it('switches modules and updates code snippet and topic title', async () => {
    const wrapper = mount(LearningJavaPage);

    // Switch to JMM module
    await wrapper.find('[data-testid="topic-tab-jmm"]').trigger('click');
    expect(wrapper.find('[data-testid="code-block"]').text()).toContain('DoubleCheckedLockingSingleton');

    // Switch to Virtual Threads module
    await wrapper.find('[data-testid="topic-tab-virtual-threads"]').trigger('click');
    expect(wrapper.find('[data-testid="code-block"]').text()).toContain('newVirtualThreadPerTaskExecutor');
  });
});

describe('Canonical Standards & Conventions', () => {
  it('defines Java 25 as the canonical Java LTS version', () => {
    expect(CANONICAL_JAVA_VERSION).toBe('Java 25');
    expect(JAVA_VERSION_METADATA.runtimeTarget).toContain('Java 25 LTS');
    expect(CANONICAL_JAVA_MODULES.length).toBeGreaterThanOrEqual(3);
    for (const mod of CANONICAL_JAVA_MODULES) {
      expect(mod.versionTarget).toBe('Java 25');
      expect(mod.codeSnippet).toBeDefined();
      expect(mod.breakScenario).toBeDefined();
      expect(mod.debugFix).toBeDefined();
      expect(mod.interviewAnswer).toBeDefined();
    }
  });

  it('defines Spring Boot 4.1 as the canonical Spring target', () => {
    expect(CANONICAL_SPRING_BOOT_VERSION).toBe('Spring Boot 4.1');
    expect(SPRING_BOOT_VERSION_METADATA.version).toBe('Spring Boot 4.1');
    expect(SPRING_BOOT_VERSION_METADATA.runtimeTarget).toContain('Spring Boot 4.1 on Spring Framework 7.x');
    expect(CANONICAL_SPRING_MODULES.length).toBeGreaterThanOrEqual(3);
    for (const mod of CANONICAL_SPRING_MODULES) {
      expect(mod.versionTarget).toBe('Spring Boot 4.1');
      expect(mod.codeSnippet).toBeDefined();
      expect(mod.breakScenario).toBeDefined();
      expect(mod.debugFix).toBeDefined();
      expect(mod.interviewAnswer).toBeDefined();
    }
  });
});
