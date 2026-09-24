import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import InterviewPage from '../pages/InterviewPage.vue';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningStore } from '../stores/learning';
import type { InterviewQuestion } from '../../types';

/**
 * Test fixture: deterministic interview questions (NOT real user data).
 */
function makeQuestion(overrides: Partial<InterviewQuestion>): InterviewQuestion {
  return {
    id: 'q-test',
    category: 'JAVA',
    difficulty: 'STAFF',
    question: 'Why does synchronized pin virtual threads?',
    keyPointsExpected: ['Carrier-thread pinning', 'JDK 24 JEP 491'],
    idealSeniorAnswer: 'Pre-JDK 24, synchronized blocks pinned carrier threads.',
    confidence: 0,
    ...overrides,
  };
}

describe('InterviewPage.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('renders the practice workspace with seed questions', () => {
    const store = useLearningStore();
    expect(store.interviewQuestions.length).toBeGreaterThan(0);
    const wrapper = mount(InterviewPage);
    expect(wrapper.text()).toContain('Interview Practice');
    expect(wrapper.text()).toContain('What the interviewer is listening for');
  });

  it('filters questions by category and resets position', async () => {
    const store = useLearningStore();
    store.interviewQuestions = [
      makeQuestion({ id: 'q-java-1', category: 'JAVA', question: 'Java question one?' }),
      makeQuestion({ id: 'q-spring-1', category: 'SPRING', question: 'Spring question one?' }),
    ];
    const wrapper = mount(InterviewPage);

    const springBtn = wrapper
      .findAll('button')
      .filter(b => b.text() === 'SPRING')[0];
    expect(springBtn).toBeDefined();
    await springBtn.trigger('click');

    expect(wrapper.text()).toContain('Spring question one?');
    expect(wrapper.text()).not.toContain('Java question one?');
    expect(wrapper.text()).toContain('Question 1 of 1');
  });

  it('reveals the ideal answer and saves a spaced review flashcard', async () => {
    const store = useLearningStore();
    const cardsBefore = store.reviewCards.length;
    store.interviewQuestions = [makeQuestion({ id: 'q-1', category: 'JAVA' })];
    const wrapper = mount(InterviewPage);

    const revealBtn = wrapper
      .findAll('button')
      .filter(b => b.text().includes('Reveal reference answer'))[0];
    await revealBtn.trigger('click');

    expect(wrapper.text()).toContain('Reference answer');
    expect(wrapper.text()).toContain('Pre-JDK 24, synchronized blocks pinned carrier threads.');

    const saveBtn = wrapper
      .findAll('button')
      .filter(b => b.text().includes('Save as review card'))[0];
    await saveBtn.trigger('click');

    expect(store.reviewCards).toHaveLength(cardsBefore + 1);
    const created = store.reviewCards[0];
    expect(created.question).toBe('Why does synchronized pin virtual threads?');
    expect(created.intervalDays).toBe(1);
    expect(created.easeFactor).toBe(2.2);
    expect(new Date(created.nextReviewAt).getTime()).toBeLessThanOrEqual(Date.now());

    // button flips to confirmation and disables
    expect(wrapper.text()).toContain('Saved to review deck');
    const disabledSave = wrapper
      .findAll('button')
      .filter(b => b.text().includes('Saved to review deck'))[0];
    expect(disabledSave.attributes('disabled')).toBeDefined();
  });

  it('cycles to the next question with wrap-around', async () => {
    const store = useLearningStore();
    store.interviewQuestions = [
      makeQuestion({ id: 'q-1', question: 'First question?' }),
      makeQuestion({ id: 'q-2', question: 'Second question?' }),
    ];
    const wrapper = mount(InterviewPage);

    const nextBtn = wrapper
      .findAll('button')
      .filter(b => b.text().includes('Next question'))[0];
    await nextBtn.trigger('click');
    expect(wrapper.text()).toContain('Second question?');

    await nextBtn.trigger('click');
    expect(wrapper.text()).toContain('First question?');
  });

  it('shows the honest empty state for a category with no questions', async () => {
    const store = useLearningStore();
    store.interviewQuestions = [makeQuestion({ id: 'q-1', category: 'JAVA' })];
    const wrapper = mount(InterviewPage);

    const kafkaBtn = wrapper
      .findAll('button')
      .filter(b => b.text() === 'KAFKA')[0];
    await kafkaBtn.trigger('click');

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('No questions in this category yet');
  });
});