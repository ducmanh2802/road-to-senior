import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import ReviewPage from '../pages/ReviewPage.vue';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningStore } from '../stores/learning';
import type { ReviewCard } from '../../types';

/**
 * Test fixture: deterministic review cards (NOT real user data).
 */
function makeCard(overrides: Partial<ReviewCard>): ReviewCard {
  return {
    id: 'card-test',
    category: 'JAVA',
    question: 'Why does synchronized pin virtual threads?',
    expectedAnswer: 'It pins the carrier thread on monitors (pre-JDK 24).',
    intervalDays: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewAt: new Date(Date.now() - 86400000).toISOString(),
    history: [],
    ...overrides,
  };
}

describe('ReviewPage.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('shows the honest empty state when there are no review cards', () => {
    const store = useLearningStore();
    store.reviewCards = [];
    const wrapper = mount(ReviewPage);
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });

  it('renders the current due card with active recall prompt', () => {
    const store = useLearningStore();
    store.reviewCards = [makeCard({ id: 'card-1' })];
    const wrapper = mount(ReviewPage);
    expect(wrapper.text()).toContain('Why does synchronized pin virtual threads?');
    expect(wrapper.text()).toContain('ACTIVE RECALL PROMPT');
    expect(wrapper.text()).toContain('1 card due');
  });

  it('reveals the model answer and grades via SM-2', async () => {
    const store = useLearningStore();
    // card-1 due now; card-2 not due until tomorrow (falls back to full deck)
    store.reviewCards = [
      makeCard({ id: 'card-1' }),
      makeCard({
        id: 'card-2',
        question: 'Second card question?',
        nextReviewAt: new Date(Date.now() + 86400000).toISOString(),
      }),
    ];
    const wrapper = mount(ReviewPage);

    const revealBtn = wrapper
      .findAll('button')
      .filter(b => b.text().includes('Reveal Model Answer'))[0];
    expect(revealBtn).toBeDefined();
    await revealBtn.trigger('click');
    expect(wrapper.text()).toContain('IDEAL SENIOR ARCHITECTURAL ANSWER');

    // grade GOOD → SM-2: rep 0 → interval 1, reps 1
    await wrapper.find('[data-testid="grade-good"]').trigger('click');
    const graded = store.reviewCards.find(c => c.id === 'card-1');
    expect(graded?.repetitionCount).toBe(1);
    expect(graded?.intervalDays).toBe(1);
    expect(graded?.history).toHaveLength(1);
    expect(graded?.history[0].grade).toBe('GOOD');

    // card-1 leaves the due deck; deck falls back to the full deck,
    // advancing to the not-yet-due card-2
    expect(wrapper.text()).toContain('Second card question?');
  });

  it('finishes the deck and offers to practice again', async () => {
    const store = useLearningStore();
    store.reviewCards = [makeCard({ id: 'card-1' })];
    const wrapper = mount(ReviewPage);

    await wrapper
      .findAll('button')
      .filter(b => b.text().includes('Reveal Model Answer'))[0]
      .trigger('click');
    await wrapper.find('[data-testid="grade-again"]').trigger('click');

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Review session complete');

    // SM-2 AGAIN: reps reset to 0, ease decreases
    const graded = store.reviewCards.find(c => c.id === 'card-1');
    expect(graded?.repetitionCount).toBe(0);
    expect(graded?.easeFactor).toBeLessThan(2.5);
    expect(graded?.intervalDays).toBe(1);

    // restart session
    const againBtn = wrapper
      .findAll('button')
      .filter(b => b.text() === 'Practice deck again')[0];
    await againBtn.trigger('click');
    expect(wrapper.text()).toContain('Why does synchronized pin virtual threads?');
  });
});
