import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import ReviewPage from '../pages/ReviewPage.vue';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningStore } from '../stores/learning';
import type { ReviewCard } from '../../types';

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
