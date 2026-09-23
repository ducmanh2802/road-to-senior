import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EnglishQuiz from '../components/EnglishQuiz.vue';
import EnglishPage from '../pages/EnglishPage.vue';
import { generateEnglishQuiz } from '../utils/englishQuiz';
import { useLearningStore } from '../stores/learning';

describe('EnglishQuiz (Technical English Quiz Mode)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe('generateEnglishQuiz utility', () => {
    it('generates exactly 5 multiple choice questions by default', () => {
      const questions = generateEnglishQuiz(5);
      expect(questions).toHaveLength(5);
    });

    it('each question has a valid prompt, correct answer, explanation, and 4 unique options containing the correct answer', () => {
      const questions = generateEnglishQuiz(5);
      for (const q of questions) {
        expect(q.prompt).toBeTruthy();
        expect(q.correctAnswer).toBeTruthy();
        expect(q.options).toHaveLength(4);
        expect(q.options).toContain(q.correctAnswer);
        expect(new Set(q.options).size).toBe(4); // No duplicate choices
        expect(q.explanation).toBeTruthy();
        expect(q.seniorInsight).toBeTruthy();
      }
    });
  });

  describe('EnglishQuiz.vue component', () => {
    it('renders initial question, progress bar, options, and question counter', () => {
      const wrapper = mount(EnglishQuiz);

      expect(wrapper.find('[data-testid="english-quiz-view"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('QUESTION 1 OF 5');
      expect(wrapper.find('[data-testid="quiz-prompt"]').exists()).toBe(true);
      expect(wrapper.findAll('[data-testid^="quiz-option-"]')).toHaveLength(4);
      expect(wrapper.find('[data-testid="submit-answer-btn"]').exists()).toBe(true);
    });

    it('allows selecting an option and enables the submit button', async () => {
      const wrapper = mount(EnglishQuiz);

      // Initially disabled before selection
      const submitBtn = wrapper.find('[data-testid="submit-answer-btn"]');
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true);

      // Select first option
      await wrapper.find('[data-testid="quiz-option-0"]').trigger('click');
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false);
    });

    it('shows explanation box after submission with correct or incorrect feedback', async () => {
      const wrapper = mount(EnglishQuiz);

      // Select and submit option 0
      await wrapper.find('[data-testid="quiz-option-0"]').trigger('click');
      await wrapper.find('[data-testid="submit-answer-btn"]').trigger('click');

      // Explanation box should now be visible
      expect(wrapper.find('[data-testid="quiz-explanation-box"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="next-question-btn"]').exists()).toBe(true);
    });

    it('can step through all 5 questions to view the results screen', async () => {
      const wrapper = mount(EnglishQuiz);

      for (let i = 0; i < 5; i++) {
        // Select first option
        await wrapper.find('[data-testid="quiz-option-0"]').trigger('click');
        // Submit
        await wrapper.find('[data-testid="submit-answer-btn"]').trigger('click');
        // Next
        await wrapper.find('[data-testid="next-question-btn"]').trigger('click');
      }

      // Quiz finished screen should be visible
      expect(wrapper.find('[data-testid="quiz-results-card"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="quiz-final-score"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="quiz-breakdown-list"]').exists()).toBe(true);
      expect(wrapper.findAll('[data-testid^="quiz-breakdown-item-"]')).toHaveLength(5);
      expect(wrapper.text()).toContain('Quiz Completed!');
      expect(wrapper.find('[data-testid="retry-quiz-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="finish-quiz-btn"]').exists()).toBe(true);
    });

    it('emits exit event when back or finish buttons are clicked', async () => {
      const wrapper = mount(EnglishQuiz);

      await wrapper.find('[data-testid="exit-quiz-btn"]').trigger('click');
      expect(wrapper.emitted('exit')).toBeTruthy();
    });

    it('toggles quiz mode in EnglishPage when toggle button is clicked', async () => {
      const wrapper = mount(EnglishPage);

      const toggleBtn = wrapper.find('[data-testid="toggle-quiz-mode-btn"]');
      expect(toggleBtn.exists()).toBe(true);
      expect(toggleBtn.text()).toContain('Quiz Mode');

      // Switch to Quiz Mode
      await toggleBtn.trigger('click');
      expect(wrapper.find('[data-testid="english-quiz-view"]').exists()).toBe(true);
      expect(toggleBtn.text()).toContain('Vocabulary Mode');

      // Switch back
      await toggleBtn.trigger('click');
      expect(wrapper.find('[data-testid="english-quiz-view"]').exists()).toBe(false);
      expect(wrapper.find('article[data-testid^="english-card-"]').exists()).toBe(true);
    });

    it('synchronizes correctly answered questions with Pinia useLearningStore', async () => {
      const store = useLearningStore();
      const wrapper = mount(EnglishQuiz);

      // Find the correct option for current question
      const currentQ = wrapper.vm.currentQuestion;
      const correctOptionIndex = currentQ.options.indexOf(currentQ.correctAnswer);
      expect(correctOptionIndex).toBeGreaterThanOrEqual(0);

      // Select and submit correct answer
      await wrapper.find(`[data-testid="quiz-option-${correctOptionIndex}"]`).trigger('click');
      await wrapper.find('[data-testid="submit-answer-btn"]').trigger('click');

      expect(store.isEnglishItemCompleted(currentQ.targetItemId)).toBe(true);
      expect(store.englishCompletedCount).toBe(1);
    });

    it('restarts the quiz when retake button is clicked in results screen', async () => {
      const wrapper = mount(EnglishQuiz);

      for (let i = 0; i < 5; i++) {
        await wrapper.find('[data-testid="quiz-option-0"]').trigger('click');
        await wrapper.find('[data-testid="submit-answer-btn"]').trigger('click');
        await wrapper.find('[data-testid="next-question-btn"]').trigger('click');
      }

      expect(wrapper.find('[data-testid="quiz-results-card"]').exists()).toBe(true);

      // Click retake quiz
      await wrapper.find('[data-testid="retry-quiz-btn"]').trigger('click');
      expect(wrapper.find('[data-testid="quiz-results-card"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="active-question-card"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('QUESTION 1 OF 5');
    });

    it('has accessible roles and aria labels', () => {
      const wrapper = mount(EnglishQuiz);

      expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true);
      expect(wrapper.find('[role="radiogroup"]').attributes('aria-label')).toBe('Question choices');
      expect(wrapper.find('[role="radio"]').exists()).toBe(true);
    });
  });
});
