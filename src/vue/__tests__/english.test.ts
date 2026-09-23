import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import EnglishPage from '../pages/EnglishPage.vue';
import { useLearningStore } from '../stores/learning';
import { routes } from '../router';
import {
  TECHNICAL_ENGLISH_ITEMS,
  ENGLISH_SECTIONS_META,
} from '../../data/technicalEnglish';

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
}

describe('EnglishPage.vue (Phase E01)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('verifies route registration for /english', async () => {
    const router = makeRouter();
    await router.push('/english');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/english');
    expect(router.currentRoute.value.name).toBe('english');
    expect(router.currentRoute.value.meta.title).toBe('Technical English');
    expect(router.currentRoute.value.meta.section).toBe('LEARNING');
  });

  it('renders page header, progress badge, and track badges', () => {
    const wrapper = mount(EnglishPage);

    expect(wrapper.find('h1').text()).toContain('Technical English for Senior Java');
    expect(wrapper.find('[data-testid="english-progress-badge"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="english-progress-badge"]').text()).toContain('PROGRESS:');
    expect(wrapper.find('[data-testid="english-track-badge"]').text()).toContain('Professional Communication');
  });

  it('renders all 10 section tabs plus the ALL tab', () => {
    const wrapper = mount(EnglishPage);

    expect(wrapper.find('[data-testid="section-tab-ALL"]').exists()).toBe(true);
    for (const section of ENGLISH_SECTIONS_META) {
      const tab = wrapper.find(`[data-testid="section-tab-${section.id}"]`);
      expect(tab.exists()).toBe(true);
      expect(tab.text()).toContain(section.shortLabel);
    }
  });

  it('filters learning items when a section tab is clicked', async () => {
    const wrapper = mount(EnglishPage);

    // Initial state: ALL items visible
    const initialCards = wrapper.findAll('article[data-testid^="english-card-"]');
    expect(initialCards.length).toBe(TECHNICAL_ENGLISH_ITEMS.length);

    // Click on Kafka & Redis section
    await wrapper.find('[data-testid="section-tab-kafka-redis"]').trigger('click');
    const kafkaCards = wrapper.findAll('article[data-testid^="english-card-"]');
    const expectedKafkaCount = TECHNICAL_ENGLISH_ITEMS.filter((i) => i.section === 'kafka-redis').length;
    expect(kafkaCards.length).toBe(expectedKafkaCount);
    expect(wrapper.find('[data-testid="english-card-eng-eda-01"]').exists()).toBe(true);

    // Click on Debugging & Incident section
    await wrapper.find('[data-testid="section-tab-debugging-incident"]').trigger('click');
    const incidentCards = wrapper.findAll('article[data-testid^="english-card-"]');
    const expectedIncidentCount = TECHNICAL_ENGLISH_ITEMS.filter((i) => i.section === 'debugging-incident').length;
    expect(incidentCards.length).toBe(expectedIncidentCount);
    expect(wrapper.find('[data-testid="english-card-eng-incident-01"]').exists()).toBe(true);

    // Click back to ALL
    await wrapper.find('[data-testid="section-tab-ALL"]').trigger('click');
    expect(wrapper.findAll('article[data-testid^="english-card-"]').length).toBe(TECHNICAL_ENGLISH_ITEMS.length);
  });

  it('filters items by difficulty selector', async () => {
    const wrapper = mount(EnglishPage);

    const select = wrapper.find('[data-testid="difficulty-filter-select"]');
    expect(select.exists()).toBe(true);

    // Select STAFF
    await select.setValue('STAFF');
    const staffCards = wrapper.findAll('article[data-testid^="english-card-"]');
    const expectedStaffCount = TECHNICAL_ENGLISH_ITEMS.filter((i) => i.difficulty === 'STAFF').length;
    expect(staffCards.length).toBe(expectedStaffCount);
    expect(staffCards.length).toBeGreaterThan(0);

    // Select MID
    await select.setValue('MID');
    const midCards = wrapper.findAll('article[data-testid^="english-card-"]');
    const expectedMidCount = TECHNICAL_ENGLISH_ITEMS.filter((i) => i.difficulty === 'MID').length;
    expect(midCards.length).toBe(expectedMidCount);
  });

  it('filters items by search input query', async () => {
    const wrapper = mount(EnglishPage);

    const input = wrapper.find('[data-testid="search-input"]');
    await input.setValue('virtual threads');

    const cards = wrapper.findAll('article[data-testid^="english-card-"]');
    expect(cards.length).toBeGreaterThan(0);
    expect(wrapper.find('[data-testid="english-card-eng-java-01"]').exists()).toBe(true);

    // Clear search
    await input.setValue('');
    expect(wrapper.findAll('article[data-testid^="english-card-"]').length).toBe(TECHNICAL_ENGLISH_ITEMS.length);
  });

  it('shows empty state when no items match and resets filters on action click', async () => {
    const wrapper = mount(EnglishPage);

    const input = wrapper.find('[data-testid="search-input"]');
    await input.setValue('xyz-nonexistent-search-phrase-999');

    expect(wrapper.findAll('article[data-testid^="english-card-"]').length).toBe(0);
    const emptyState = wrapper.find('[data-testid="empty-state"]');
    expect(emptyState.exists()).toBe(true);
    expect(emptyState.text()).toContain('No English Topics Match Your Filter');

    // Click reset filters button
    await emptyState.find('button').trigger('click');
    expect(wrapper.findAll('article[data-testid^="english-card-"]').length).toBe(TECHNICAL_ENGLISH_ITEMS.length);
  });

  it('supports expand and collapse for learning cards', async () => {
    const wrapper = mount(EnglishPage);

    // First item is expanded by default
    expect(wrapper.find('[data-testid="english-details-eng-java-01"]').exists()).toBe(true);

    // Click toggle expand on first item to collapse
    await wrapper.find('[data-testid="toggle-expand-eng-java-01"]').trigger('click');
    expect(wrapper.find('[data-testid="english-details-eng-java-01"]').exists()).toBe(false);

    // Click card header to re-expand
    await wrapper.find('[data-testid="english-card-eng-java-01"] > div').trigger('click');
    expect(wrapper.find('[data-testid="english-details-eng-java-01"]').exists()).toBe(true);
  });

  it('renders all 4 drill tabs and practice speaking prompts correctly', async () => {
    const wrapper = mount(EnglishPage);

    const itemId = 'eng-java-01';
    // Tab 1: Senior Explanation is default
    expect(wrapper.find(`[data-testid="drill-content-senior-${itemId}"]`).exists()).toBe(true);
    expect(wrapper.find(`[data-testid="drill-content-senior-${itemId}"]`).text()).toContain('Senior-Level Technical Explanation:');

    // Tab 2: Practice Speaking Prompt
    await wrapper.find(`[data-testid="drill-tab-practice-${itemId}"]`).trigger('click');
    expect(wrapper.find(`[data-testid="drill-content-practice-${itemId}"]`).exists()).toBe(true);
    expect(wrapper.find(`[data-testid="drill-content-practice-${itemId}"]`).text()).toContain('Verbal Speaking Challenge');
    expect(wrapper.find(`[data-testid="drill-content-practice-${itemId}"]`).text()).toContain(TECHNICAL_ENGLISH_ITEMS[0].speakingPrompt);

    // Tab 3: Common Mistake
    await wrapper.find(`[data-testid="drill-tab-mistake-${itemId}"]`).trigger('click');
    expect(wrapper.find(`[data-testid="drill-content-mistake-${itemId}"]`).exists()).toBe(true);
    expect(wrapper.find(`[data-testid="drill-content-mistake-${itemId}"]`).text()).toContain('Common Misconception');

    // Tab 4: Vietnamese Support Note
    await wrapper.find(`[data-testid="drill-tab-vietnamese-${itemId}"]`).trigger('click');
    expect(wrapper.find(`[data-testid="drill-content-vietnamese-${itemId}"]`).exists()).toBe(true);
    expect(wrapper.find(`[data-testid="drill-content-vietnamese-${itemId}"]`).text()).toContain(TECHNICAL_ENGLISH_ITEMS[0].vietnameseSupportNote);
  });

  it('persists item completion in Pinia store when toggle button is clicked', async () => {
    const store = useLearningStore();
    const wrapper = mount(EnglishPage);
    const itemId = 'eng-spring-01';

    const completeBtn = wrapper.find(`[data-testid="toggle-complete-${itemId}"]`);
    expect(completeBtn.exists()).toBe(true);

    // Initial state: not completed
    expect(store.isEnglishItemCompleted(itemId)).toBe(false);

    // Click to complete
    await completeBtn.trigger('click');
    expect(store.isEnglishItemCompleted(itemId)).toBe(true);
    expect(store.englishCompletedCount).toBe(1);

    // Click again to uncomplete
    await completeBtn.trigger('click');
    expect(store.isEnglishItemCompleted(itemId)).toBe(false);
    expect(store.englishCompletedCount).toBe(0);
  });

  it('has accessible labels on interactive elements', () => {
    const wrapper = mount(EnglishPage);

    expect(wrapper.find('[aria-label="Search English topics"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Filter by difficulty"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Section tabs"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label^="Mark "]').exists()).toBe(true);
    expect(wrapper.find('[aria-label^="Toggle details for "]').exists()).toBe(true);
  });
});
