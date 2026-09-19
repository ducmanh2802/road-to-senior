import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import Sidebar from '../layouts/Sidebar.vue';
import TopBar from '../layouts/TopBar.vue';
import CommandPalette from '../components/CommandPalette.vue';
import { routes } from '../router';

function makeRouter(): ReturnType<typeof createRouter> {
  return createRouter({ history: createMemoryHistory(), routes });
}

/** Mount a fresh memory-history router at `initial`, ready for assertions. */
async function readyRouter(initial: string) {
  const router = makeRouter();
  await router.push(initial);
  await router.isReady();
  return router;
}

describe('Sidebar', () => {
  it('renders all navigation sections with semantic links', async () => {
    const router = await readyRouter('/');
    const wrapper = mount(Sidebar, { global: { plugins: [router] } });

    const sections = wrapper.findAll('[data-testid="nav-section"]');
    expect(sections.length).toBeGreaterThan(0);
    const nav = wrapper.find('nav[aria-label="Main"]');
    expect(nav.exists()).toBe(true);
    expect(nav.findAll('a').length).toBeGreaterThan(10);
    wrapper.unmount();
  });

  it('marks the exact route with aria-current and parents without it', async () => {
    const router = await readyRouter('/learning/java');
    const wrapper = mount(Sidebar, { global: { plugins: [router] }, attachTo: document.body });
    await wrapper.vm.$nextTick();

    // exactly one aria-current marker, pointing at the leaf route
    const markers = wrapper.findAll('[aria-current="page"]');
    expect(markers.length).toBe(1);
    expect(markers[0]!.text()).toContain('Java 25');

    // parent section link is visually active but NOT aria-current
    const links = wrapper.findAll('a');
    const parent = links.find((a) => a.text() === 'Learning Path')!;
    expect(parent.attributes('aria-current')).toBeUndefined();

    // navigating away moves the marker
    await router.push('/');
    await wrapper.vm.$nextTick();
    const after = wrapper.findAll('[aria-current="page"]');
    expect(after.length).toBe(1);
    expect(after[0]!.text()).toContain('Command Center');
    wrapper.unmount();
  });
});

describe('TopBar', () => {
  it('shows breadcrumb from route meta and opens palette', async () => {
    const router = await readyRouter('/certifications/aws/aif-c01');
    const wrapper = mount(TopBar, { global: { plugins: [router] }, attachTo: document.body });
    await wrapper.vm.$nextTick();

    const breadcrumb = wrapper.find('nav[aria-label="Breadcrumb"]');
    expect(breadcrumb.text()).toContain('AIF-C01');

    await wrapper.find('[aria-label="Open command palette"]').trigger('click');
    expect(wrapper.emitted('openPalette')).toHaveLength(1);
    wrapper.unmount();
  });
});

describe('CommandPalette', () => {
  it('filters commands, navigates with ArrowDown/Enter and closes on Esc', async () => {
    const router = await readyRouter('/');
    const wrapper = mount(CommandPalette, {
      global: { plugins: [router] },
      attachTo: document.body,
    });

    const input = wrapper.find('[role="combobox"]');
    expect(input.exists()).toBe(true);
    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(5);

    // filter down to the AIF-C01 command
    await input.setValue('AIF');
    await wrapper.vm.$nextTick();
    let options = wrapper.findAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0]!.text()).toContain('AIF-C01');

    // Enter navigates to the selected route and closes
    await input.trigger('keydown', { key: 'Enter' });
    await flushPromises();
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(router.currentRoute.value.path).toBe('/certifications/aws/aif-c01');

    // ArrowDown/ArrowUp wrap around the full list
    await input.setValue('');
    await wrapper.vm.$nextTick();
    options = wrapper.findAll('[role="option"]');
    await input.trigger('keydown', { key: 'ArrowUp' });
    expect(options[options.length - 1]!.attributes('aria-selected')).toBe('true');
    await input.trigger('keydown', { key: 'ArrowDown' });
    expect(options[0]!.attributes('aria-selected')).toBe('true');

    wrapper.unmount();
  });

  it('shows honest empty state for unknown query (no fake results)', async () => {
    const router = await readyRouter('/');
    const wrapper = mount(CommandPalette, { global: { plugins: [router] } });
    await wrapper.find('[role="combobox"]').setValue('zzz-no-match');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Search is not available yet');
    expect(wrapper.findAll('[role="option"]').length).toBe(0);
    wrapper.unmount();
  });

  it('renders as an accessible dialog', async () => {
    const router = await readyRouter('/');
    const wrapper = mount(CommandPalette, { global: { plugins: [router] } });
    const dialog = wrapper.find('[role="dialog"][aria-label="Command palette"]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.attributes('aria-modal')).toBe('true');
    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.exists()).toBe(true);
    wrapper.unmount();
  });
});

