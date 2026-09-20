import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import TodayViewPage from '@/pages/TodayViewPage.vue';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningStore } from '../stores/learning';

describe('TodayViewPage.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useLearningStore();
    // reset store state
    store.$reset?.();
    // add some sample tasks
    store.addTask({
      title: 'Sample Task 1',
      description: 'Desc',
      category: 'NEW',
      estimatedMinutes: 20,
    });
    store.addTask({
      title: 'Sample Task 2',
      description: 'Desc',
      category: 'IN_PROGRESS',
      estimatedMinutes: 15,
    });
  });

  it('renders and shows tasks', async () => {
    const wrapper = mount(TodayViewPage);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Sample Task 1');
    expect(wrapper.text()).toContain('Sample Task 2');
  });

  it('filters tasks by category', async () => {
    const wrapper = mount(TodayViewPage);
    // click filter button for IN_PROGRESS
    const filterBtn = wrapper.findAll('button').filter(btn => btn.text() === 'IN_PROGRESS')[0];
    await filterBtn.trigger('click');
    expect(wrapper.text()).toContain('Sample Task 2');
    expect(wrapper.text()).not.toContain('Sample Task 1');
  });
});

