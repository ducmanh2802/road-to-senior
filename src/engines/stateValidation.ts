import { TaskState, ReviewGrade, IncidentScenario } from '../types';

export interface StateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates allowed transitions for LearningTask state
 */
export function validateTaskStateTransition(
  currentState: TaskState,
  nextState: TaskState
): StateValidationResult {
  const allowedTransitions: Record<TaskState, TaskState[]> = {
    TODO: ['IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'OVERDUE'],
    IN_PROGRESS: ['TODO', 'COMPLETED', 'SKIPPED', 'OVERDUE'],
    COMPLETED: ['TODO', 'IN_PROGRESS'],
    SKIPPED: ['TODO', 'IN_PROGRESS'],
    OVERDUE: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
  };

  if (!allowedTransitions[currentState]?.includes(nextState)) {
    return {
      isValid: false,
      error: `Invalid transition from ${currentState} to ${nextState}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates numeric boundaries for learning metrics
 */
export function validatePositiveMetric(
  fieldName: string,
  value: number,
  allowZero: boolean = true
): StateValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  if (allowZero ? value < 0 : value <= 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be ${allowZero ? 'negative' : 'less than or equal to zero'} (received ${value})`,
    };
  }
  return { isValid: true };
}

/**
 * Validates review grade enum
 */
export function validateReviewGrade(grade: string): grade is ReviewGrade {
  return ['AGAIN', 'HARD', 'GOOD', 'EASY'].includes(grade);
}

/**
 * Validates incident hypothesis investigation
 */
export function validateIncidentHypothesis(
  incident: IncidentScenario,
  hypothesisIndex: number
): { isCorrect: boolean; message: string } {
  if (hypothesisIndex < 0 || hypothesisIndex >= incident.hypothesisOptions.length) {
    return {
      isCorrect: false,
      message: `Invalid hypothesis index ${hypothesisIndex}. Must be within 0 and ${incident.hypothesisOptions.length - 1}.`,
    };
  }

  const isCorrect = hypothesisIndex === incident.correctHypothesisIndex;
  if (isCorrect) {
    return {
      isCorrect: true,
      message: `Accurate hypothesis! Root Cause verified: ${incident.rootCauseAnalysis}`,
    };
  }

  return {
    isCorrect: false,
    message: 'Hypothesis refuted by metrics & live logs. Re-examine the active thread traces and memory indicators.',
  };
}

/**
 * Validates exported JSON schema for state restore
 */
export function validateBackupJson(rawJson: string): { isValid: boolean; data?: any; error?: string } {
  if (!rawJson || typeof rawJson !== 'string' || !rawJson.trim()) {
    return { isValid: false, error: 'Empty backup payload provided.' };
  }

  try {
    const data = JSON.parse(rawJson);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { isValid: false, error: 'Backup payload must be a JSON object.' };
    }

    if (!Array.isArray(data.tasks)) {
      return { isValid: false, error: 'Backup is missing or contains invalid tasks array.' };
    }

    if (!Array.isArray(data.knowledgeTopics)) {
      return { isValid: false, error: 'Backup is missing or contains invalid knowledgeTopics array.' };
    }

    if (data.currentDay !== undefined && (typeof data.currentDay !== 'number' || data.currentDay < 1 || data.currentDay > 180)) {
      return { isValid: false, error: 'currentDay must be an integer between 1 and 180.' };
    }

    return { isValid: true, data };
  } catch (err: any) {
    return { isValid: false, error: `JSON Parse error: ${err.message}` };
  }
}
