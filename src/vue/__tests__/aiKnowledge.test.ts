import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import AIKnowledgePage from '../pages/AIKnowledgePage.vue';
import { routes } from '../router';
import {
  AI_SENIOR_JAVA_ITEMS,
  AI_TRACKS_META,
  RAG_CONCEPTUAL_FLOW_STEPS,
} from '../../data/aiSeniorJava';

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
}

describe('AIKnowledgePage.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('verifies route registration for /learning/ai', async () => {
    const router = makeRouter();
    await router.push('/learning/ai');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/learning/ai');
    expect(router.currentRoute.value.name).toBe('learning-ai');
    expect(router.currentRoute.value.meta.title).toBe('AI Knowledge');
    expect(router.currentRoute.value.meta.section).toBe('LEARNING');
  });

  it('renders curriculum header, progress badge, and runtime badges', () => {
    const wrapper = mount(AIKnowledgePage);

    expect(wrapper.find('h1').text()).toContain('AI Knowledge Foundation');
    expect(wrapper.find('[data-testid="ai-progress-badge"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="ai-progress-badge"]').text()).toContain('PROGRESS:');
    expect(wrapper.find('[data-testid="ai-runtime-badge"]').text()).toContain('Spring Boot 4.1 + Java 25');
  });

  it('renders all 9 curriculum track filter tabs plus ALL tab', () => {
    const wrapper = mount(AIKnowledgePage);

    expect(wrapper.find('[data-testid="track-tab-ALL"]').exists()).toBe(true);
    for (const track of AI_TRACKS_META) {
      const tab = wrapper.find(`[data-testid="track-tab-${track.id}"]`);
      expect(tab.exists()).toBe(true);
      expect(tab.text()).toContain(track.shortLabel);
    }
  });

  it('filters knowledge items when a track tab is selected', async () => {
    const wrapper = mount(AIKnowledgePage);

    // Initial state: ALL tracks visible
    const initialCards = wrapper.findAll('article[data-testid^="ai-card-"]');
    expect(initialCards.length).toBe(AI_SENIOR_JAVA_ITEMS.length);

    // Click on RAG track
    await wrapper.find('[data-testid="track-tab-rag"]').trigger('click');
    const ragCards = wrapper.findAll('article[data-testid^="ai-card-"]');
    expect(ragCards.length).toBe(1);
    expect(wrapper.find('[data-testid="ai-card-ai-rag-01"]').exists()).toBe(true);

    // Click on Security track
    await wrapper.find('[data-testid="track-tab-security"]').trigger('click');
    const secCards = wrapper.findAll('article[data-testid^="ai-card-"]');
    expect(secCards.length).toBe(1);
    expect(wrapper.find('[data-testid="ai-card-ai-sec-01"]').exists()).toBe(true);

    // Click back on ALL
    await wrapper.find('[data-testid="track-tab-ALL"]').trigger('click');
    expect(wrapper.findAll('article[data-testid^="ai-card-"]').length).toBe(AI_SENIOR_JAVA_ITEMS.length);
  });

  it('filters items by difficulty selector', async () => {
    const wrapper = mount(AIKnowledgePage);

    const select = wrapper.find('[data-testid="difficulty-filter-select"]');
    expect(select.exists()).toBe(true);

    // Select STAFF
    await select.setValue('STAFF');
    const staffCards = wrapper.findAll('article[data-testid^="ai-card-"]');
    const expectedStaffCount = AI_SENIOR_JAVA_ITEMS.filter((i) => i.difficulty === 'STAFF').length;
    expect(staffCards.length).toBe(expectedStaffCount);
    expect(staffCards.length).toBeGreaterThan(0);

    // Select MID
    await select.setValue('MID');
    const midCards = wrapper.findAll('article[data-testid^="ai-card-"]');
    const expectedMidCount = AI_SENIOR_JAVA_ITEMS.filter((i) => i.difficulty === 'MID').length;
    expect(midCards.length).toBe(expectedMidCount);
  });

  it('filters items by search query and shows empty state when no match', async () => {
    const wrapper = mount(AIKnowledgePage);

    const searchInput = wrapper.find('[data-testid="ai-search-input"]');
    expect(searchInput.exists()).toBe(true);

    // Search for "pgvector"
    await searchInput.setValue('pgvector');
    expect(wrapper.find('[data-testid="ai-card-ai-rag-01"]').exists()).toBe(true);
    expect(wrapper.findAll('article[data-testid^="ai-card-"]').length).toBe(1);

    // Search for non-existent term
    await searchInput.setValue('non-existent-xyz-search-query-12345');
    expect(wrapper.findAll('article[data-testid^="ai-card-"]').length).toBe(0);
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('No matching AI curriculum topics');

    // Click clear filters button in empty state
    const clearBtn = wrapper.find('[data-testid="empty-state"] button');
    expect(clearBtn.exists()).toBe(true);
    await clearBtn.trigger('click');
    expect(wrapper.findAll('article[data-testid^="ai-card-"]').length).toBe(AI_SENIOR_JAVA_ITEMS.length);
  });

  it('expands and collapses knowledge card content', async () => {
    const wrapper = mount(AIKnowledgePage);

    // ai-fund-01 is expanded by default
    const fundCard = wrapper.find('[data-testid="ai-card-ai-fund-01"]');
    expect(fundCard.find('[data-testid="card-body-ai-fund-01"]').exists()).toBe(true);

    // Toggle expand button
    const expandBtn = wrapper.find('[data-testid="toggle-expand-ai-fund-01"]');
    await expandBtn.trigger('click');
    expect(fundCard.find('[data-testid="card-body-ai-fund-01"]').exists()).toBe(false);

    // Toggle back open
    await expandBtn.trigger('click');
    expect(fundCard.find('[data-testid="card-body-ai-fund-01"]').exists()).toBe(true);
  });

  it('switches between all 4 interactive drill tabs inside a card', async () => {
    const wrapper = mount(AIKnowledgePage);

    const cardId = 'ai-fund-01';

    // 1. Default tab is 'explain'
    expect(wrapper.find(`[data-testid="view-explain-${cardId}"]`).exists()).toBe(true);
    expect(wrapper.text()).toContain('Senior Engineering Mental Model');

    // 2. Switch to 'design'
    await wrapper.find(`[data-testid="tab-design-${cardId}"]`).trigger('click');
    expect(wrapper.find(`[data-testid="view-design-${cardId}"]`).exists()).toBe(true);
    expect(wrapper.find(`[data-testid="code-block"]`).exists()).toBe(true);
    expect(wrapper.find(`[data-testid="view-design-${cardId}"]`).text()).toContain('TokenBudgetEnforcer');

    // 3. Switch to 'break' (failure modes)
    await wrapper.find(`[data-testid="tab-break-${cardId}"]`).trigger('click');
    expect(wrapper.find(`[data-testid="view-break-${cardId}"]`).exists()).toBe(true);
    expect(wrapper.find(`[data-testid="view-break-${cardId}"]`).text()).toContain('Critical Production Failure Modes');
    expect(wrapper.find(`[data-testid="view-break-${cardId}"]`).text()).toContain('Token Bloat');

    // 4. Switch to 'interview'
    await wrapper.find(`[data-testid="tab-interview-${cardId}"]`).trigger('click');
    expect(wrapper.find(`[data-testid="view-interview-${cardId}"]`).exists()).toBe(true);
    expect(wrapper.find(`[data-testid="view-interview-${cardId}"]`).text()).toContain('Staff Technical Interview Question');
    expect(wrapper.find(`[data-testid="view-interview-${cardId}"]`).text()).toContain('temperature and top-p sampling');
  });

  it('tracks and persists topic completion in Pinia store', async () => {
    const wrapper = mount(AIKnowledgePage);

    const cardId = 'ai-fund-01';
    const completeBtn = wrapper.find(`[data-testid="toggle-complete-${cardId}"]`);
    expect(completeBtn.exists()).toBe(true);
    expect(completeBtn.text()).toContain('Mark Complete');

    // Click mark complete
    await completeBtn.trigger('click');
    expect(completeBtn.text()).toContain('Completed');
    expect(wrapper.find('[data-testid="ai-progress-badge"]').text()).toContain('1/9');

    // Toggle back to incomplete
    await completeBtn.trigger('click');
    expect(completeBtn.text()).toContain('Mark Complete');
    expect(wrapper.find('[data-testid="ai-progress-badge"]').text()).toContain('0/9');
  });

  it('renders enterprise AI architecture diagram and all 11 RAG lifecycle stages', () => {
    const wrapper = mount(AIKnowledgePage);

    const archSection = wrapper.find('[data-testid="architecture-diagram-section"]');
    expect(archSection.exists()).toBe(true);
    expect(archSection.text()).toContain('Enterprise AI Gateway & Microservice Topology');
    expect(wrapper.find('[data-testid="architecture-topology-ascii"]').text()).toContain('AI Gateway');
    expect(wrapper.find('[data-testid="architecture-topology-ascii"]').text()).toContain('Model Adapter');
    expect(wrapper.find('[data-testid="architecture-topology-ascii"]').text()).toContain('pgvector Hybrid Search');

    // 11 RAG lifecycle stages
    expect(RAG_CONCEPTUAL_FLOW_STEPS.length).toBe(11);
    for (const step of RAG_CONCEPTUAL_FLOW_STEPS) {
      expect(archSection.text()).toContain(`Stage ${step.step}:`);
      expect(archSection.text()).toContain(step.name);
    }
  });

  it('maintains accessible labels across buttons, tabs, and inputs', () => {
    const wrapper = mount(AIKnowledgePage);

    expect(wrapper.find('input[data-testid="ai-search-input"]').attributes('aria-label')).toBeDefined();
    expect(wrapper.find('[data-testid="difficulty-filter-select"]').attributes('aria-label')).toBeDefined();
    expect(wrapper.find('[data-testid="track-filter-tabs"]').attributes('role')).toBe('tablist');
    expect(wrapper.find('[data-testid="architecture-diagram-section"]').attributes('aria-label')).toBeDefined();
    expect(wrapper.find('[data-testid="toggle-complete-ai-fund-01"]').attributes('aria-label')).toBeDefined();
    expect(wrapper.find('[data-testid="toggle-expand-ai-fund-01"]').attributes('aria-label')).toBeDefined();
  });
});
