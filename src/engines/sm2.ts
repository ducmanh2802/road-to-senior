import { ReviewCard, ReviewGrade } from '../types';

export const MIN_EASE_FACTOR = 1.3;

export interface Sm2CalculationResult {
  intervalDays: number;
  repetitionCount: number;
  easeFactor: number;
  lastReviewedAt: string;
  nextReviewAt: string;
}

/**
 * Deterministic SuperMemo-2 (SM-2) Spaced Repetition Engine
 * Calculates the next review interval, repetition count, and ease factor
 * using a fixed or provided reference timestamp.
 */
export function calculateSm2Review(
  card: Pick<ReviewCard, 'intervalDays' | 'repetitionCount' | 'easeFactor'>,
  grade: ReviewGrade,
  referenceDate: Date = new Date()
): Sm2CalculationResult {
  let nextInterval = 1;
  let newEase = card.easeFactor || 2.5;
  let nextReps = card.repetitionCount || 0;

  switch (grade) {
    case 'AGAIN':
      nextInterval = 1;
      nextReps = 0;
      newEase = Math.max(MIN_EASE_FACTOR, newEase - 0.2);
      break;

    case 'HARD':
      nextInterval = Math.max(1, Math.round((card.intervalDays || 1) * 1.2));
      newEase = Math.max(MIN_EASE_FACTOR, newEase - 0.15);
      nextReps += 1;
      break;

    case 'GOOD':
      if (nextReps === 0) {
        nextInterval = 1;
      } else if (nextReps === 1) {
        nextInterval = 4;
      } else {
        nextInterval = Math.max(1, Math.round((card.intervalDays || 1) * newEase));
      }
      nextReps += 1;
      break;

    case 'EASY':
      if (nextReps === 0) {
        nextInterval = 4;
      } else if (nextReps === 1) {
        nextInterval = 8;
      } else {
        nextInterval = Math.max(1, Math.round((card.intervalDays || 1) * newEase * 1.3));
      }
      newEase += 0.15;
      nextReps += 1;
      break;

    default:
      throw new Error(`Invalid review grade: ${grade}`);
  }

  // Next review date calculation based on deterministic referenceDate
  const nextDate = new Date(referenceDate.getTime());
  nextDate.setDate(nextDate.getDate() + nextInterval);

  return {
    intervalDays: nextInterval,
    repetitionCount: nextReps,
    easeFactor: Math.round(newEase * 100) / 100, // Round to 2 decimal places to avoid IEEE float drift
    lastReviewedAt: referenceDate.toISOString(),
    nextReviewAt: nextDate.toISOString(),
  };
}

/**
 * Checks if a review card is overdue relative to a reference timestamp
 */
export function isCardOverdue(card: Pick<ReviewCard, 'nextReviewAt'>, referenceDate: Date = new Date()): boolean {
  if (!card.nextReviewAt) return true;
  return new Date(card.nextReviewAt).getTime() <= referenceDate.getTime();
}
