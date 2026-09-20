import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SettingsPage from '../pages/SettingsPage.vue';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningStore } from '../stores/learning';

describe('SettingsPage.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    const store = useLearningStore();
    store.resetToDemo();
  });

  it('renders correctly with header and cards', () => {
    const wrapper = mount(SettingsPage);
    expect(wrapper.text()).toContain('Settings & Local Storage Engine');
    expect(wrapper.text()).toContain('Active Day Override');
    expect(wrapper.text()).toContain('Data Backup & State Migration');
    expect(wrapper.text()).toContain('Factory Demo Reset');
  });

  it('updates the active day when form is submitted', async () => {
    const wrapper = mount(SettingsPage);
    const store = useLearningStore();
    expect(store.currentDay).toBe(37);

    const input = wrapper.find('input[type="number"]');
    await input.setValue(50);
    await wrapper.find('form').trigger('submit.prevent');

    expect(store.currentDay).toBe(50);
    expect(wrapper.find('[data-testid="day-feedback"]').text()).toContain('Active day updated to Day 50');
  });

  it('exports state as JSON blob and triggers download', async () => {
    const wrapper = mount(SettingsPage);
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const exportBtn = wrapper.findAll('button').find((b) => b.text().includes('Export Full State'));
    expect(exportBtn).toBeDefined();

    await exportBtn!.trigger('click');
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('restores state from valid JSON payload', async () => {
    const wrapper = mount(SettingsPage);
    const store = useLearningStore();

    const validBackup = JSON.stringify({
      currentDay: 88,
      streak: 21,
      studyTimeMinutes: 300,
      tasks: [],
      roadmapDays: [],
      knowledgeTopics: [],
      reviewCards: [],
      dsaProblems: [],
      projectFeatures: [],
      incidents: [],
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue(validBackup);

    const restoreBtn = wrapper.findAll('button').find((b) => b.text().includes('Restore State'));
    expect(restoreBtn).toBeDefined();

    await restoreBtn!.trigger('click');
    expect(store.currentDay).toBe(88);
    expect(store.streak).toBe(21);
    expect(store.studyTimeMinutes).toBe(300);

    const statusEl = wrapper.find('[data-testid="import-status"]');
    expect(statusEl.text()).toContain('Successfully restored state from JSON!');
  });

  it('handles invalid JSON import safely without crashing', async () => {
    const wrapper = mount(SettingsPage);
    const store = useLearningStore();
    const initialDay = store.currentDay;

    const textarea = wrapper.find('textarea');
    await textarea.setValue('INVALID_NON_JSON_DATA');

    const restoreBtn = wrapper.findAll('button').find((b) => b.text().includes('Restore State'));
    await restoreBtn!.trigger('click');

    expect(store.currentDay).toBe(initialDay);
    const statusEl = wrapper.find('[data-testid="import-status"]');
    expect(statusEl.text()).toContain('Failed to parse JSON. Please check format.');
  });

  it('resets state to demo baseline on factory reset', async () => {
    const wrapper = mount(SettingsPage);
    const store = useLearningStore();

    store.setCurrentDay(120);
    expect(store.currentDay).toBe(120);

    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('Reset All Data to Demo Baseline'));
    expect(resetBtn).toBeDefined();

    await resetBtn!.trigger('click');
    expect(store.currentDay).toBe(37);
    expect(wrapper.find('[data-testid="reset-feedback"]').text()).toContain('All data reset to factory demo baseline');
  });
});
