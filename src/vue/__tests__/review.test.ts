import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import ReviewPage from '../pages/ReviewPage.vue';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningStore } from '../stores/learning';
import type { ReviewCard } from '../../types';

<<<<<<< HEAD
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
    expect(wrapper.text()).toContain('1 Cards Due Today');
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
    expect(wrapper.text()).toContain('Daily Spaced Review Complete!');

    // SM-2 AGAIN: reps reset to 0, ease decreases
    const graded = store.reviewCards.find(c => c.id === 'card-1');
    expect(graded?.repetitionCount).toBe(0);
    expect(graded?.easeFactor).toBeLessThan(2.5);
    expect(graded?.intervalDays).toBe(1);

    // restart session
    const againBtn = wrapper
      .findAll('button')
      .filter(b => b.text() === 'Practice Deck Again')[0];
    await againBtn.trigger('click');
    expect(wrapper.text()).toContain('Why does synchronized pin virtual threads?');
  });
});
=======
describe('ReviewPage.vue (Vertical Slice)', () => {
  const sampleCard1: ReviewCard = {
    id: 'rev-test-1',
    category: 'CONCURRENCY',
    question: 'How do Virtual Threads differ from OS Platform Threads in Java 21+?',
    expectedAnswer:
      'Virtual threads are lightweight user-mode threads managed by the JVM rather than the OS kernel. They mount onto carrier threads when executing CPU instructions and unmount during blocking I/O.',
    codeExample: 'try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n  executor.submit(task);\n}',
    explanation: 'Carrier threads are worker threads in a ForkJoinPool.',
    intervalDays: 1,
    repetitionCount: 1,
    easeFactor: 2.5,
    nextReviewAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago (due)
    history: [],
  };

  const sampleCard2: ReviewCard = {
    id: 'rev-test-2',
    category: 'KAFKA',
    question: 'What guarantees does enable.idempotence=true provide?',
    expectedAnswer:
      'Ensures exactly-once delivery semantics per partition by assigning a PID and sequence numbers to messages, deduplicating inflight retries.',
    intervalDays: 2,
    repetitionCount: 2,
    easeFactor: 2.4,
    nextReviewAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago (due)
    history: [],
  };

  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    const store = useLearningStore();
    store.loadFromStorage();
    // seed with deterministic test cards
    store.reviewCards = [JSON.parse(JSON.stringify(sampleCard1)), JSON.parse(JSON.stringify(sampleCard2))];
  });

  it('renders page header, metadata, and the first due review card', async () => {
    const wrapper = mount(ReviewPage);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Spaced Repetition & Active Recall');
    expect(wrapper.text()).toContain('2 Cards Due Today');
    expect(wrapper.text()).toContain('How do Virtual Threads differ from OS Platform Threads');
    expect(wrapper.text()).toContain('CONCURRENCY');
    expect(wrapper.find('[data-testid="reveal-button"]').exists()).toBe(true);
  });

  it('renders honest empty state when no review cards exist', async () => {
    const store = useLearningStore();
    store.reviewCards = [];

    const wrapper = mount(ReviewPage);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('No Review Cards Available');
    expect(wrapper.find('[data-testid="reveal-button"]').exists()).toBe(false);
  });

  it('handles due-complete empty state when in DUE mode and allows switching to ALL cards', async () => {
    const store = useLearningStore();
    // set all cards to future review date
    store.reviewCards = store.reviewCards.map((c) => ({
      ...c,
      nextReviewAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    }));

    const wrapper = mount(ReviewPage);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Daily Spaced Review Complete!');
    expect(wrapper.text()).toContain('0 Cards Due Today');

    // Click "Practice All Cards"
    const practiceAllBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Practice All Cards'));
    expect(practiceAllBtn).toBeDefined();
    await practiceAllBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('How do Virtual Threads differ from OS Platform Threads');
  });

  it('allows drafting an answer and reveals model answer on button click', async () => {
    const wrapper = mount(ReviewPage);
    await wrapper.vm.$nextTick();

    const textarea = wrapper.find('textarea[data-testid="draft-answer"]');
    expect(textarea.exists()).toBe(true);
    await textarea.setValue('Virtual threads are M:N lightweight threads');

    // Answer is hidden initially
    expect(wrapper.text()).not.toContain('IDEAL SENIOR ARCHITECTURAL ANSWER');

    // Click reveal
    await wrapper.find('[data-testid="reveal-button"]').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('IDEAL SENIOR ARCHITECTURAL ANSWER');
    expect(wrapper.text()).toContain('Virtual threads are lightweight user-mode threads');
    expect(wrapper.text()).toContain('CANONICAL PATTERN');
    expect(wrapper.text()).toContain('Executors.newVirtualThreadPerTaskExecutor()');

    // Textarea is now disabled
    expect(wrapper.find('textarea[data-testid="draft-answer"]').attributes('disabled')).toBeDefined();
  });

  it('grades card with GOOD and updates SM-2 interval and repetition count', async () => {
    const wrapper = mount(ReviewPage);
    await wrapper.vm.$nextTick();
    const store = useLearningStore();

    // Reveal answer first
    await wrapper.find('[data-testid="reveal-button"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Grade with GOOD
    const goodBtn = wrapper.find('[data-testid="grade-good"]');
    expect(goodBtn.exists()).toBe(true);
    await goodBtn.trigger('click');
    await wrapper.vm.$nextTick();

    // Card 1 in store should now be updated via SM-2
    const updatedCard1 = store.reviewCards.find((c) => c.id === 'rev-test-1');
    expect(updatedCard1?.repetitionCount).toBe(2);
    expect(updatedCard1?.intervalDays).toBe(4); // SM-2 rep 1 -> rep 2 gives 4 days
    expect(updatedCard1?.history.length).toBe(1);
    expect(updatedCard1?.history[0].grade).toBe('GOOD');

    // Should now show Card 2 in the active review view
    expect(wrapper.text()).toContain('What guarantees does enable.idempotence=true provide?');
  });

  it('grades card with AGAIN, resetting repetition count to 0 and interval to 1', async () => {
    const wrapper = mount(ReviewPage);
    await wrapper.vm.$nextTick();
    const store = useLearningStore();

    // Reveal answer
    await wrapper.find('[data-testid="reveal-button"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Grade with AGAIN
    const againBtn = wrapper.find('[data-testid="grade-again"]');
    expect(againBtn.exists()).toBe(true);
    await againBtn.trigger('click');
    await wrapper.vm.$nextTick();

    const updatedCard1 = store.reviewCards.find((c) => c.id === 'rev-test-1');
    expect(updatedCard1?.repetitionCount).toBe(0);
    expect(updatedCard1?.intervalDays).toBe(1);
    expect(updatedCard1?.history[0].grade).toBe('AGAIN');
  });

  it('completes the deck session and resets to practice again', async () => {
    const wrapper = mount(ReviewPage);
    await wrapper.vm.$nextTick();

    // Finish Card 1
    await wrapper.find('[data-testid="reveal-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.find('[data-testid="grade-easy"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Finish Card 2
    await wrapper.find('[data-testid="reveal-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await wrapper.find('[data-testid="grade-good"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Both cards finished
    expect(wrapper.text()).toContain('Review Session Complete!');
    expect(wrapper.text()).toContain('All cards in this deck have been processed');

    // Click "Practice Deck Again"
    const restartBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Practice Deck Again'));
    expect(restartBtn).toBeDefined();
    await restartBtn!.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('How do Virtual Threads differ from OS Platform Threads');
  });
});
>>>>>>> 1ab3ac4a430c6445910d92b0ffa3e384dead035f
