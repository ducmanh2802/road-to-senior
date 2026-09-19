import { describe, it, expect } from 'vitest';
import {
  validateTaskStateTransition,
  validatePositiveMetric,
  validateReviewGrade,
  validateIncidentHypothesis,
  validateBackupJson,
} from '../stateValidation';
import { IncidentScenario } from '../../types';

describe('State Validation Engine', () => {
  describe('validateTaskStateTransition', () => {
    it('allows valid state transitions for tasks', () => {
      expect(validateTaskStateTransition('TODO', 'IN_PROGRESS').isValid).toBe(true);
      expect(validateTaskStateTransition('TODO', 'COMPLETED').isValid).toBe(true);
      expect(validateTaskStateTransition('TODO', 'SKIPPED').isValid).toBe(true);
      expect(validateTaskStateTransition('IN_PROGRESS', 'COMPLETED').isValid).toBe(true);
      expect(validateTaskStateTransition('COMPLETED', 'TODO').isValid).toBe(true);
    });

    it('rejects invalid state transitions', () => {
      expect(validateTaskStateTransition('COMPLETED', 'SKIPPED').isValid).toBe(false);
      expect(validateTaskStateTransition('SKIPPED', 'COMPLETED').isValid).toBe(false);
    });
  });

  describe('validatePositiveMetric', () => {
    it('accepts valid positive numbers', () => {
      expect(validatePositiveMetric('studyTimeMinutes', 45).isValid).toBe(true);
      expect(validatePositiveMetric('studyTimeMinutes', 0, true).isValid).toBe(true);
    });

    it('rejects negative or NaN values', () => {
      expect(validatePositiveMetric('studyTimeMinutes', -10).isValid).toBe(false);
      expect(validatePositiveMetric('studyTimeMinutes', NaN).isValid).toBe(false);
      expect(validatePositiveMetric('intervalDays', 0, false).isValid).toBe(false);
    });
  });

  describe('validateReviewGrade', () => {
    it('validates recognized ReviewGrade values', () => {
      expect(validateReviewGrade('AGAIN')).toBe(true);
      expect(validateReviewGrade('HARD')).toBe(true);
      expect(validateReviewGrade('GOOD')).toBe(true);
      expect(validateReviewGrade('EASY')).toBe(true);
    });

    it('rejects unrecognized grades', () => {
      expect(validateReviewGrade('PERFECT')).toBe(false);
      expect(validateReviewGrade('')).toBe(false);
    });
  });

  describe('validateIncidentHypothesis', () => {
    const mockIncident: IncidentScenario = {
      id: 'inc-1',
      title: 'HikariCP Pool Starvation',
      serviceAffected: 'order-service',
      severity: 'P0 - CRITICAL',
      status: 'UNRESOLVED',
      symptoms: ['HTTP 500 Connection timeout', 'P99 latency > 30000ms'],
      liveLogs: ['HikariPool-1 - Connection is not available, request timed out after 30000ms.'],
      metrics: [
        {
          name: 'HikariCP Active Connections',
          currentValue: '10 / 10',
          normalValue: '2 / 10',
          status: 'CRITICAL',
        },
      ],
      hypothesisOptions: [
        'High GC pause freezing JVM',
        'Long-running transaction with external HTTP call holding connection',
        'Database server down',
      ],
      correctHypothesisIndex: 1,
      rootCauseAnalysis: 'Long-running transaction holding connection.',
      fixCommand: 'Set strict timeout and remove HTTP call from transaction boundary',
      verificationSteps: ['Execute load test with 500 concurrent checkout calls'],
      preventionStrategy: 'Set strict transaction timeouts and separate connection pools.',
    };

    it('validates when correct hypothesis index is chosen', () => {
      const result = validateIncidentHypothesis(mockIncident, 1);
      expect(result.isCorrect).toBe(true);
      expect(result.message).toContain('Accurate hypothesis');
    });

    it('returns refutation when incorrect hypothesis index is chosen', () => {
      const result = validateIncidentHypothesis(mockIncident, 0);
      expect(result.isCorrect).toBe(false);
      expect(result.message).toContain('Hypothesis refuted');
    });

    it('rejects out-of-bounds hypothesis index', () => {
      const result = validateIncidentHypothesis(mockIncident, 99);
      expect(result.isCorrect).toBe(false);
      expect(result.message).toContain('Invalid hypothesis index');
    });
  });

  describe('validateBackupJson', () => {
    it('accepts valid backup json payload', () => {
      const validPayload = JSON.stringify({
        currentDay: 42,
        tasks: [],
        knowledgeTopics: [],
      });
      const result = validateBackupJson(validPayload);
      expect(result.isValid).toBe(true);
      expect(result.data?.currentDay).toBe(42);
    });

    it('rejects empty or whitespace-only payloads', () => {
      expect(validateBackupJson('').isValid).toBe(false);
      expect(validateBackupJson('   ').isValid).toBe(false);
    });

    it('rejects malformed json syntax', () => {
      const result = validateBackupJson('{ currentDay: 42, broken json');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('JSON Parse error');
    });

    it('rejects missing required arrays', () => {
      const missingTasks = JSON.stringify({ currentDay: 42, knowledgeTopics: [] });
      expect(validateBackupJson(missingTasks).isValid).toBe(false);

      const missingTopics = JSON.stringify({ currentDay: 42, tasks: [] });
      expect(validateBackupJson(missingTopics).isValid).toBe(false);
    });

    it('rejects currentDay out of range (1..180)', () => {
      const outOfRange = JSON.stringify({ currentDay: 200, tasks: [], knowledgeTopics: [] });
      expect(validateBackupJson(outOfRange).isValid).toBe(false);
    });
  });
});
