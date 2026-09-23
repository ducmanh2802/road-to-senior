import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import RoadmapPage from '../pages/RoadmapPage.vue';
import { useLearningStore } from '../stores/learning';
import { routes } from '../router';

function makeRouter(): ReturnType<typeof createRouter> {
  return createRouter({ history: createMemoryHistory(), routes });
}

async function readyRouter(initial: string) {
  const router = makeRouter();
  await router.push(initial);
  await router.isReady();
  return router;
}

describe('RoadmapPage.vue', () => {
  let router: ReturnType<typeof makeRouter>;

  beforeEach(async () => {
    localStorage.clear();
    setActivePinia(createPinia());
    const store = useLearningStore();
    store.resetToDemo();
    router = await readyRouter('/learning/roadmap');
  });

  it('renders page header and active day badge', () => {
    const wrapper = mount(RoadmapPage, {
      global: { plugins: [router] },
    });

    expect(wrapper.text()).toContain('180-Day Architect Curriculum');
    expect(wrapper.text()).toContain('6 structured phases');
    const badge = wrapper.find('[data-testid="current-day-badge"]');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toContain('Day 37 of 180 Active');
  });

  it('renders phase filter bar with all 6 phases and ALL button', () => {
    const wrapper = mount(RoadmapPage, {
      global: { plugins: [router] },
    });

    expect(wrapper.find('[data-testid="phase-filter-0"]').text()).toContain('ALL PHASES');
    expect(wrapper.find('[data-testid="phase-filter-1"]').text()).toContain('P1');
    expect(wrapper.find('[data-testid="phase-filter-2"]').text()).toContain('P2');
    expect(wrapper.find('[data-testid="phase-filter-3"]').text()).toContain('P3');
    expect(wrapper.find('[data-testid="phase-filter-4"]').text()).toContain('P4');
    expect(wrapper.find('[data-testid="phase-filter-5"]').text()).toContain('P5');
    expect(wrapper.find('[data-testid="phase-filter-6"]').text()).toContain('P6');
  });

  it('filters curriculum days when selecting a specific phase', async () => {
    const wrapper = mount(RoadmapPage, {
      global: { plugins: [router] },
    });

    const store = useLearningStore();
    expect(store.roadmapDays.length).toBeGreaterThan(0);

    // Filter to Phase 1 (Days 1 to 30)
    await wrapper.find('[data-testid="phase-filter-1"]').trigger('click');
    expect(wrapper.find('[data-testid="day-card-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="day-card-30"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="day-card-31"]').exists()).toBe(false);

    // Filter to Phase 2 (Days 31 to 60)
    await wrapper.find('[data-testid="phase-filter-2"]').trigger('click');
    expect(wrapper.find('[data-testid="day-card-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="day-card-37"]').exists()).toBe(true);

    // Reset to ALL PHASES
    await wrapper.find('[data-testid="phase-filter-0"]').trigger('click');
    expect(wrapper.find('[data-testid="day-card-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="day-card-37"]').exists()).toBe(true);
  });

  it('filters curriculum days by search query and shows empty state when none match', async () => {
    const wrapper = mount(RoadmapPage, {
      global: { plugins: [router] },
    });

    const searchInput = wrapper.find('[data-testid="search-input"]');
    await searchInput.setValue('Virtual Threads');

    expect(wrapper.text()).toContain('Virtual Threads');

    // Search query with no match
    await searchInput.setValue('nonexistentqueryxyz123');
    expect(wrapper.find('[data-testid="empty-days"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('No days match filter');

    // Click reset button on empty state
    await wrapper.find('[data-testid="empty-days"] button').trigger('click');
    expect(wrapper.find('[data-testid="day-card-1"]').exists()).toBe(true);
  });

  it('updates the day specification drawer when a day card is clicked', async () => {
    const wrapper = mount(RoadmapPage, {
      global: { plugins: [router] },
    });

    // Default specification drawer shows Day 37
    const drawer = wrapper.find('[data-testid="day-detail-drawer"]');
    expect(drawer.exists()).toBe(true);
    expect(drawer.text()).toContain('DAY 37 SPECIFICATION');

    // Click Day 1 card
    await wrapper.find('[data-testid="day-card-1"]').trigger('click');
    expect(drawer.text()).toContain('DAY 1 SPECIFICATION');
    expect(drawer.text()).toContain('Java Memory Model');
    expect(drawer.text()).toContain('HANDS-ON GOAL');
    expect(drawer.text()).toContain('DSA PATTERN');
  });

  it('switches active workspace day and navigates to /today when switch button is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(RoadmapPage, {
      global: { plugins: [router] },
    });

    const store = useLearningStore();
    expect(store.currentDay).toBe(37);

    // Select Day 2
    await wrapper.find('[data-testid="day-card-2"]').trigger('click');

    const switchBtn = wrapper.find('[data-testid="switch-workspace-button"]');
    expect(switchBtn.text()).toContain('Switch Workspace to Day 2');
    await switchBtn.trigger('click');

    expect(store.currentDay).toBe(2);
    expect(pushSpy).toHaveBeenCalledWith('/today');
  });

  it('resolves /learning/roadmap and redirects /learning to /learning/roadmap', async () => {
    // Navigate to /learning
    await router.push('/learning');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/learning/roadmap');

    // Direct navigation to /learning/roadmap
    await router.push('/learning/roadmap');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/learning/roadmap');
  });
});
