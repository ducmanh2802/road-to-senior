import { describe, it, expect } from 'vitest';
import { calculateSm2Review, isCardOverdue, MIN_EASE_FACTOR } from '../sm2';
import { ReviewCard } from '../../types';

describe('SM-2 Spaced Repetition Engine', () => {
  const fixedReferenceDate = new Date('2026-09-17T12:00:00.000Z');

  describe('Initial Review (repetitions = 0, default easeFactor = 2.5)', () => {
    const baseCard: Pick<ReviewCard, 'intervalDays' | 'repetitionCount' | 'easeFactor'> = {
      intervalDays: 1,
      repetitionCount: 0,
      easeFactor: 2.5,
    };

    it('first AGAIN: resets repetition to 0, interval to 1, and drops ease factor by 0.2', () => {
      const result = calculateSm2Review(baseCard, 'AGAIN', fixedReferenceDate);
      expect(result.intervalDays).toBe(1);
      expect(result.repetitionCount).toBe(0);
      expect(result.easeFactor).toBe(2.3);
      expect(result.lastReviewedAt).toBe(fixedReferenceDate.toISOString());
      expect(result.nextReviewAt).toBe('2026-09-18T12:00:00.000Z');
    });

    it('first HARD: sets repetition to 1, interval to 1, and drops ease factor by 0.15', () => {
      const result = calculateSm2Review(baseCard, 'HARD', fixedReferenceDate);
      expect(result.intervalDays).toBe(1);
      expect(result.repetitionCount).toBe(1);
      expect(result.easeFactor).toBe(2.35);
      expect(result.nextReviewAt).toBe('2026-09-18T12:00:00.000Z');
    });

    it('first GOOD: sets repetition to 1, interval to 1, and preserves ease factor', () => {
      const result = calculateSm2Review(baseCard, 'GOOD', fixedReferenceDate);
      expect(result.intervalDays).toBe(1);
      expect(result.repetitionCount).toBe(1);
      expect(result.easeFactor).toBe(2.5);
      expect(result.nextReviewAt).toBe('2026-09-18T12:00:00.000Z');
    });

    it('first EASY: sets repetition to 1, interval to 4, and increases ease factor by 0.15', () => {
      const result = calculateSm2Review(baseCard, 'EASY', fixedReferenceDate);
      expect(result.intervalDays).toBe(4);
      expect(result.repetitionCount).toBe(1);
      expect(result.easeFactor).toBe(2.65);
      expect(result.nextReviewAt).toBe('2026-09-21T12:00:00.000Z');
    });
  });

  describe('Repeated Reviews Progression', () => {
    it('repeated GOOD reviews follow standard progression (1 -> 4 -> interval * ease)', () => {
      // Step 1: First review GOOD
      const step1 = calculateSm2Review({ intervalDays: 1, repetitionCount: 0, easeFactor: 2.5 }, 'GOOD', fixedReferenceDate);
      expect(step1.intervalDays).toBe(1);
      expect(step1.repetitionCount).toBe(1);

      // Step 2: Second review GOOD
      const step2 = calculateSm2Review(step1, 'GOOD', new Date(step1.nextReviewAt));
      expect(step2.intervalDays).toBe(4);
      expect(step2.repetitionCount).toBe(2);

      // Step 3: Third review GOOD (4 * 2.5 = 10)
      const step3 = calculateSm2Review(step2, 'GOOD', new Date(step2.nextReviewAt));
      expect(step3.intervalDays).toBe(10);
      expect(step3.repetitionCount).toBe(3);

      // Step 4: Fourth review GOOD (10 * 2.5 = 25)
      const step4 = calculateSm2Review(step3, 'GOOD', new Date(step3.nextReviewAt));
      expect(step4.intervalDays).toBe(25);
      expect(step4.repetitionCount).toBe(4);
    });

    it('repeated EASY reviews accelerate interval growth and increase ease factor', () => {
      // Step 1: First review EASY
      const step1 = calculateSm2Review({ intervalDays: 1, repetitionCount: 0, easeFactor: 2.5 }, 'EASY', fixedReferenceDate);
      expect(step1.intervalDays).toBe(4);
      expect(step1.easeFactor).toBe(2.65);
      expect(step1.repetitionCount).toBe(1);

      // Step 2: Second review EASY
      const step2 = calculateSm2Review(step1, 'EASY', new Date(step1.nextReviewAt));
      expect(step2.intervalDays).toBe(8);
      expect(step2.easeFactor).toBe(2.8);
      expect(step2.repetitionCount).toBe(2);

      // Step 3: Third review EASY (round(8 * 2.8 * 1.3) = round(29.12) = 29)
      const step3 = calculateSm2Review(step2, 'EASY', new Date(step2.nextReviewAt));
      expect(step3.intervalDays).toBe(29);
      expect(step3.easeFactor).toBe(2.95);
      expect(step3.repetitionCount).toBe(3);
    });

    it('AGAIN resets repetition count to 0 and interval to 1 after an advanced progression', () => {
      const advancedCard = { intervalDays: 25, repetitionCount: 4, easeFactor: 2.5 };
      const result = calculateSm2Review(advancedCard, 'AGAIN', fixedReferenceDate);
      expect(result.intervalDays).toBe(1);
      expect(result.repetitionCount).toBe(0);
      expect(result.easeFactor).toBe(2.3);
    });
  });

  describe('Boundary Conditions & Invariants', () => {
    it('easeFactor must never fall below MIN_EASE_FACTOR (1.3)', () => {
      let card = { intervalDays: 1, repetitionCount: 0, easeFactor: 1.4 };

      // Review AGAIN multiple times
      card = calculateSm2Review(card, 'AGAIN', fixedReferenceDate);
      expect(card.easeFactor).toBe(MIN_EASE_FACTOR);

      card = calculateSm2Review(card, 'AGAIN', fixedReferenceDate);
      expect(card.easeFactor).toBe(MIN_EASE_FACTOR);

      card = calculateSm2Review(card, 'HARD', fixedReferenceDate);
      expect(card.easeFactor).toBe(MIN_EASE_FACTOR);
    });

    it('intervalDays must always be >= 1', () => {
      const zeroIntervalCard = { intervalDays: 0, repetitionCount: 0, easeFactor: 1.3 };
      const result = calculateSm2Review(zeroIntervalCard, 'HARD', fixedReferenceDate);
      expect(result.intervalDays).toBeGreaterThanOrEqual(1);
    });

    it('throws an error on invalid review grade', () => {
      expect(() => {
        calculateSm2Review(
          { intervalDays: 1, repetitionCount: 0, easeFactor: 2.5 },
          'INVALID_GRADE' as any,
          fixedReferenceDate
        );
      }).toThrowError(/Invalid review grade/);
    });
  });

  describe('isCardOverdue Function', () => {
    it('returns true when nextReviewAt is in the past', () => {
      const card = { nextReviewAt: '2026-09-16T12:00:00.000Z' };
      expect(isCardOverdue(card, fixedReferenceDate)).toBe(true);
    });

    it('returns true when nextReviewAt is exactly equal to reference date', () => {
      const card = { nextReviewAt: '2026-09-17T12:00:00.000Z' };
      expect(isCardOverdue(card, fixedReferenceDate)).toBe(true);
    });

    it('returns false when nextReviewAt is in the future', () => {
      const card = { nextReviewAt: '2026-09-18T12:00:00.000Z' };
      expect(isCardOverdue(card, fixedReferenceDate)).toBe(false);
    });

    it('returns true when nextReviewAt is missing', () => {
      const card = { nextReviewAt: '' };
      expect(isCardOverdue(card, fixedReferenceDate)).toBe(true);
    });
  });
});
