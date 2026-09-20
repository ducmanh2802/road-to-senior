import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import TodayViewPage from '../pages/TodayViewPage.vue';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningStore } from '../stores/learning';

describe('TodayViewPage.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    const store = useLearningStore();
    store.loadFromStorage();
    // clear default seed tasks for deterministic unit testing
    store.tasks = [];
    // add sample tasks adhering to the domain model
    store.addTask({
      title: 'Sample Task 1',
      description: 'Desc 1',
      category: 'JAVA',
      state: 'TODO',
      estimatedMinutes: 20,
    });
    store.addTask({
      title: 'Sample Task 2',
      description: 'Desc 2',
      category: 'HANDS_ON',
      state: 'IN_PROGRESS',
      estimatedMinutes: 15,
    });
  });

  it('renders and shows tasks', async () => {
    const wrapper = mount(TodayViewPage);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Sample Task 1');
    expect(wrapper.text()).toContain('Sample Task 2');
    expect(wrapper.text()).toContain("Today's Engineering Execution");
  });

  it('filters tasks by status', async () => {
    const wrapper = mount(TodayViewPage);
    await wrapper.vm.$nextTick();

    // click filter button for IN_PROGRESS
    const filterBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().trim() === 'IN_PROGRESS');
    expect(filterBtn).toBeDefined();
    await filterBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Sample Task 2');
    expect(wrapper.text()).not.toContain('Sample Task 1');

    // click filter button for TODO
    const todoBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().trim() === 'TODO');
    expect(todoBtn).toBeDefined();
    await todoBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Sample Task 1');
    expect(wrapper.text()).not.toContain('Sample Task 2');
  });

  it('renders empty state when no tasks match filter and allows reset', async () => {
    const wrapper = mount(TodayViewPage);
    await wrapper.vm.$nextTick();

    // filter by SKIPPED where no tasks exist yet
    const skippedBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().trim() === 'SKIPPED');
    expect(skippedBtn).toBeDefined();
    await skippedBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('No tasks match filter');

    // click reset filter button
    const resetBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Reset Filter'));
    expect(resetBtn).toBeDefined();
    await resetBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Sample Task 1');
    expect(wrapper.text()).toContain('Sample Task 2');
  });

  it('handles task interaction - completes and toggles task state', async () => {
    const wrapper = mount(TodayViewPage);
    await wrapper.vm.$nextTick();
    const store = useLearningStore();

    const sampleTask1 = store.tasks.find((t) => t.title === 'Sample Task 1');
    expect(sampleTask1?.state).toBe('TODO');

    // find task element for Sample Task 1
    const taskElements = wrapper.findAll('.ui-panel');
    const task1Element = taskElements.find((el) => el.text().includes('Sample Task 1'));
    expect(task1Element).toBeDefined();

    const completeBtn = task1Element!.find('button[aria-label="Mark Complete"]');
    expect(completeBtn.exists()).toBe(true);
    await completeBtn.trigger('click');
    await wrapper.vm.$nextTick();

    const updatedTask = store.tasks.find((t) => t.title === 'Sample Task 1');
    expect(updatedTask?.state).toBe('COMPLETED');
    expect(updatedTask?.completedAt).toBeDefined();
  });

  it('adds task through store and renders in list', async () => {
    const wrapper = mount(TodayViewPage);
    await wrapper.vm.$nextTick();
    const store = useLearningStore();

    store.addTask({
      title: 'Kafka Idempotent Producer Test',
      description: 'Test descriptions',
      category: 'SPRING',
      state: 'TODO',
      estimatedMinutes: 45,
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Kafka Idempotent Producer Test');
  });

  it('opens create task modal and submits new task', async () => {
    const wrapper = mount(TodayViewPage);
    await wrapper.vm.$nextTick();
    const store = useLearningStore();

    // Click "+ Create Task" button
    const createBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Create Task'));
    expect(createBtn).toBeDefined();
    await createBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Create New Task');

    // Fill form
    const titleInput = wrapper.find('input[placeholder*="Kafka"]');
    expect(titleInput.exists()).toBe(true);
    await titleInput.setValue('Advanced Concurrency Drill');

    const descInput = wrapper.find('textarea[placeholder*="context"]');
    await descInput.setValue('Test virtual threads under load');

    // Submit form
    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    const created = store.tasks.find((t) => t.title === 'Advanced Concurrency Drill');
    expect(created).toBeDefined();
    expect(created?.description).toBe('Test virtual threads under load');
    expect(created?.state).toBe('TODO');
  });
});
