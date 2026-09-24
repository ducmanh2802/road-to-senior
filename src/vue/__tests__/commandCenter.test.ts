import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import CommandCenterPage from '../pages/CommandCenterPage.vue';
import { useLearningStore } from '../stores/learning';
import { routes } from '../router';

function makeRouter(): ReturnType<typeof createRouter> {
  return createRouter({ history: createMemoryHistory(), routes });
}

describe('CommandCenterPage (Vue 3 Vertical Slice)', () => {
  beforeEach(() => {
    localStorage.clear();
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders success state with system status, metrics, and competency model', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();

    const store = useLearningStore();
    store.loadFromStorage();

    const wrapper = mount(CommandCenterPage, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();

    // Command Center hero (orientation + single next action)
    expect(wrapper.text()).toContain('Recommended action');
    expect(wrapper.text()).toContain('DAY 37');
    expect(wrapper.text()).toContain('Days Remaining');

    // Recommended Action Priority #1
    expect(wrapper.find('[data-testid="next-action-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="next-action-button"]').exists()).toBe(true);

    // 6 StatCards
    expect(wrapper.find('[data-testid="stat-streak"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stat-time"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stat-tasks"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stat-reviews"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stat-dsa"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="stat-project"]').exists()).toBe(true);

    // Competency Readiness
    expect(wrapper.text()).toContain('Senior Competency Readiness Model');
    const competencyItems = wrapper.findAll('[data-testid="competency-item"]');
    expect(competencyItems.length).toBeGreaterThan(0);

    // Incident Lab
    expect(wrapper.find('[data-testid="launch-incident-button"]').exists()).toBe(true);

    wrapper.unmount();
  });

  it('handles user navigation interactions cleanly', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();

    const store = useLearningStore();
    store.loadFromStorage();

    const wrapper = mount(CommandCenterPage, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();

    // 1. Click Recommended Action
    const nextActionTarget = store.nextAction.targetRoute;
    await wrapper.find('[data-testid="next-action-button"]').trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(nextActionTarget);

    // Reset to '/'
    await router.push('/');
    await flushPromises();

    // 2. Click Reviews Due StatCard. /review is lazy-loaded, so the first
    // navigation resolves only after the dynamic import completes — wait for
    // the route to settle instead of assuming a single flush is enough.
    await wrapper.find('[data-testid="stat-reviews"]').trigger('click');
    await flushPromises();
    for (let i = 0; i < 20 && router.currentRoute.value.path !== '/review'; i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      await flushPromises();
    }
    expect(router.currentRoute.value.path).toBe('/review');

    // Reset to '/'
    await router.push('/');
    await flushPromises();

    // 3. Click Project StatCard
    await wrapper.find('[data-testid="stat-project"]').trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/build/projects');

    // Reset to '/'
    await router.push('/');
    await flushPromises();

    // 4. Click Launch Incident Lab
    await wrapper.find('[data-testid="launch-incident-button"]').trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/build/break-debug');

    wrapper.unmount();
  });

  it('renders loading state without fake data when store is loading', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();

    const store = useLearningStore();
    store.status = 'loading';

    const wrapper = mount(CommandCenterPage, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="dashboard-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="command-center-content"]').exists()).toBe(false);

    wrapper.unmount();
  });

  it('renders error state with retry button when store has error', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();

    const store = useLearningStore();
    store.status = 'error';
    store.errorMessage = 'Database connection failure';
    store.errorDetail = 'Timeout error at storage layer';

    const wrapper = mount(CommandCenterPage, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Database connection failure');

    // Click retry
    const retryBtn = wrapper.find('[data-testid="error-state"] button');
    expect(retryBtn.exists()).toBe(true);
    await retryBtn.trigger('click');
    await wrapper.vm.$nextTick();

    // Store should attempt reloading and enter success/empty state
    expect(store.status).not.toBe('error');

    wrapper.unmount();
  });

  it('renders honest empty state when store has no data', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();

    const store = useLearningStore();
    store.tasks = [];
    store.knowledgeTopics = [];
    store.reviewCards = [];
    store.status = 'empty';

    const wrapper = mount(CommandCenterPage, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('No learning data found');

    // Click Load Demo Data
    const actionBtn = wrapper.find('[data-testid="empty-state"] button');
    expect(actionBtn.exists()).toBe(true);
    await actionBtn.trigger('click');
    await wrapper.vm.$nextTick();

    expect(store.status).toBe('success');
    expect(store.tasks.length).toBeGreaterThan(0);

    wrapper.unmount();
  });

  it('resolves route / to CommandCenterPage', async () => {
    const router = makeRouter();
    await router.push('/');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('command-center');
    expect(router.currentRoute.value.path).toBe('/');
    const matched = router.currentRoute.value.matched[0];
    expect(matched).toBeDefined();
    expect(matched?.components?.default).toBeDefined();
  });
});
