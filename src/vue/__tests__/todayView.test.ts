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
    // Replace seed tasks with a deterministic fixture (documented test fixture)
    store.tasks = [
      {
        id: 'test-task-1',
        dayNumber: 37,
        title: 'Sample Task 1',
        description: 'Desc',
        category: 'JAVA',
        estimatedMinutes: 20,
        state: 'TODO',
      },
      {
        id: 'test-task-2',
        dayNumber: 37,
        title: 'Sample Task 2',
        description: 'Desc',
        category: 'DSA',
        estimatedMinutes: 15,
        state: 'IN_PROGRESS',
      },
    ];
  });

  it('renders and shows tasks', () => {
    const wrapper = mount(TodayViewPage);
    expect(wrapper.text()).toContain('Sample Task 1');
    expect(wrapper.text()).toContain('Sample Task 2');
  });

  it('filters tasks by category', async () => {
    const wrapper = mount(TodayViewPage);
    // click filter button for DSA
    const filterBtn = wrapper
      .findAll('button')
      .filter(btn => btn.text() === 'DSA')[0];
    expect(filterBtn).toBeDefined();
    await filterBtn.trigger('click');
    expect(wrapper.text()).toContain('Sample Task 2');
    expect(wrapper.text()).not.toContain('Sample Task 1');
  });

  it('shows the honest empty state when no tasks match the filter', async () => {
    const wrapper = mount(TodayViewPage);
    const filterBtn = wrapper
      .findAll('button')
      .filter(btn => btn.text() === 'ENGLISH')[0];
    expect(filterBtn).toBeDefined();
    await filterBtn.trigger('click');
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);

    // reset filter restores the list
    const resetBtn = wrapper
      .findAll('button')
      .filter(btn => btn.text() === 'Reset Filter')[0];
    await resetBtn.trigger('click');
    expect(wrapper.text()).toContain('Sample Task 1');
  });

  it('completes a task and reflects the state change in the store', async () => {
    const store = useLearningStore();
    const wrapper = mount(TodayViewPage);
    expect(store.tasks.find(t => t.id === 'test-task-2')?.state).toBe(
      'IN_PROGRESS'
    );

    // the only visible Complete button belongs to the IN_PROGRESS task
    const completeBtn = wrapper
      .findAll('button')
      .filter(btn => btn.text() === 'Complete')[0];
    expect(completeBtn).toBeDefined();
    await completeBtn.trigger('click');

    expect(store.tasks.find(t => t.id === 'test-task-2')?.state).toBe(
      'COMPLETED'
    );
    expect(
      store.tasks.find(t => t.id === 'test-task-2')?.completedAt
    ).toBeDefined();
    // TODO task is untouched
    expect(store.tasks.find(t => t.id === 'test-task-1')?.state).toBe('TODO');
  });
});

