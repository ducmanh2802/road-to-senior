import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EmptyState from '../components/EmptyState.vue';
import ErrorState from '../components/ErrorState.vue';
import LoadingSkeleton from '../components/LoadingSkeleton.vue';
import PageHeader from '../components/PageHeader.vue';
import { Inbox } from 'lucide-vue-next';

describe('EmptyState', () => {
  it('renders title, description and optional action', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No learning data yet',
        description: 'Complete your first session to build history.',
        actionLabel: 'Start now',
        icon: Inbox,
      },
    });
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('No learning data yet');
    const action = wrapper.find('button');
    expect(action.text()).toBe('Start now');
    await action.trigger('click');
    expect(wrapper.emitted('action')).toHaveLength(1);
  });

  it('renders without action button when none provided', () => {
    const wrapper = mount(EmptyState, { props: { title: 'Coming next' } });
    expect(wrapper.find('button').exists()).toBe(false);
  });
});

describe('ErrorState', () => {
  it('renders message with retry and hides stack detail by default', async () => {
    const wrapper = mount(ErrorState, {
      props: { message: 'Failed to load data', detail: 'NetworkError: 500', retryLabel: 'Try Again' },
    });
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Failed to load data');
    expect(wrapper.text()).not.toContain('NetworkError');

    await wrapper.find('button[aria-expanded]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('NetworkError');

    const retry = wrapper.findAll('button').find((b) => b.text() === 'Try Again')!;
    await retry.trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});

describe('LoadingSkeleton', () => {
  it('renders with loading status semantics', () => {
    const wrapper = mount(LoadingSkeleton, { props: { variant: 'text', rows: 3 } });
    const el = wrapper.find('[data-testid="loading-skeleton"]');
    expect(el.exists()).toBe(true);
    expect(el.attributes('role')).toBe('status');
    expect(el.attributes('aria-label')).toBe('Loading content');
  });

  it('renders rect variant default', () => {
    const wrapper = mount(LoadingSkeleton);
    expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(true);
  });
});

describe('PageHeader', () => {
  it('renders title, description and action slot', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'Java 25', description: 'Core Java track' },
      slots: { actions: '<button>Track Action</button>' },
    });
    expect(wrapper.text()).toContain('Java 25');
    expect(wrapper.text()).toContain('Core Java track');
    expect(wrapper.find('button').text()).toBe('Track Action');
  });
});
