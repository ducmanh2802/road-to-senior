import { describe, it, expect } from 'vitest';
import { evaluateTopicDimensions, calculateCompetencies, findWeakestDimension } from '../competency';
import { KnowledgeTopic } from '../../types';

describe('Competency & Mastery Engine', () => {
  describe('evaluateTopicDimensions', () => {
    it('calculates average score and status for MASTERED (average >= 4.5)', () => {
      const dimensions = {
        theory: 5,
        handsOn: 5,
        recall: 5,
        explanation: 4,
        debugging: 5,
        interview: 4,
      }; // avg = 28/6 = 4.67
      const result = evaluateTopicDimensions(dimensions);
      expect(result.averageScore).toBe(4.67);
      expect(result.confidence).toBe(5);
      expect(result.status).toBe('MASTERED');
    });

    it('calculates average score and status for UNDERSTOOD (3.5 <= average < 4.5)', () => {
      const dimensions = {
        theory: 4,
        handsOn: 4,
        recall: 4,
        explanation: 3,
        debugging: 4,
        interview: 3,
      }; // avg = 22/6 = 3.67
      const result = evaluateTopicDimensions(dimensions);
      expect(result.averageScore).toBe(3.67);
      expect(result.confidence).toBe(4);
      expect(result.status).toBe('UNDERSTOOD');
    });

    it('calculates average score and status for PRACTICING (2.5 <= average < 3.5)', () => {
      const dimensions = {
        theory: 3,
        handsOn: 3,
        recall: 3,
        explanation: 2,
        debugging: 3,
        interview: 2,
      }; // avg = 16/6 = 2.67
      const result = evaluateTopicDimensions(dimensions);
      expect(result.averageScore).toBe(2.67);
      expect(result.confidence).toBe(3);
      expect(result.status).toBe('PRACTICING');
    });

    it('calculates average score and status for LEARNING (average < 2.5)', () => {
      const dimensions = {
        theory: 2,
        handsOn: 2,
        recall: 2,
        explanation: 2,
        debugging: 2,
        interview: 2,
      }; // avg = 12/6 = 2.0
      const result = evaluateTopicDimensions(dimensions);
      expect(result.averageScore).toBe(2.0);
      expect(result.confidence).toBe(2);
      expect(result.status).toBe('LEARNING');
    });

    it('clamps out-of-range dimensions between 1 and 5', () => {
      const outOfBounds = {
        theory: 10,
        handsOn: 0,
        recall: -3,
        explanation: 6,
        debugging: 1,
        interview: 5,
      };
      const result = evaluateTopicDimensions(outOfBounds);
      expect(result.dimensions.theory).toBe(5);
      expect(result.dimensions.handsOn).toBe(1);
      expect(result.dimensions.recall).toBe(1);
      expect(result.dimensions.explanation).toBe(5);
    });
  });

  describe('calculateCompetencies', () => {
    const mockTopics: KnowledgeTopic[] = [
      {
        id: 'top-1',
        title: 'Virtual Threads vs Platform Threads',
        category: 'JAVA',
        subcategory: 'Concurrency',
        description: 'Deep dive into Loom virtual threads',
        difficulty: 'SENIOR',
        status: 'MASTERED',
        confidence: 5,
        dimensions: { theory: 5, handsOn: 5, recall: 5, explanation: 5, debugging: 4, interview: 5 },
        learned: true,
        implemented: true,
        explained: true,
        debugged: true,
        interviewReady: true,
        reviewCount: 5,
        createdAt: '2026-09-17T00:00:00Z',
        updatedAt: '2026-09-17T00:00:00Z',
      },
      {
        id: 'top-2',
        title: 'Spring Transaction Proxies',
        category: 'SPRING',
        subcategory: 'AOP & Transactions',
        description: 'How CGLIB/JDK dynamic proxies wrap @Transactional',
        difficulty: 'SENIOR',
        status: 'UNDERSTOOD',
        confidence: 4,
        dimensions: { theory: 4, handsOn: 4, recall: 3, explanation: 4, debugging: 3, interview: 3 },
        learned: true,
        implemented: true,
        explained: true,
        debugged: true,
        interviewReady: false,
        reviewCount: 3,
        createdAt: '2026-09-17T00:00:00Z',
        updatedAt: '2026-09-17T00:00:00Z',
      },
    ];

    it('computes percentage and assigns readiness level Senior Ready when >= 85%', () => {
      const competencies = calculateCompetencies(mockTopics);
      const javaComp = competencies.find(c => c.name === 'JAVA');
      expect(javaComp).toBeDefined();
      expect(javaComp?.score).toBeGreaterThanOrEqual(85);
      expect(javaComp?.level).toBe('Senior Ready');
      expect(javaComp?.totalTopics).toBe(1);
      expect(javaComp?.masteredTopics).toBe(1);
    });

    it('computes percentage and assigns readiness level Advanced or Competent accordingly', () => {
      const competencies = calculateCompetencies(mockTopics);
      const springComp = competencies.find(c => c.name === 'SPRING');
      expect(springComp).toBeDefined();
      expect(springComp?.score).toBe(70);
      expect(springComp?.level).toBe('Advanced');
      expect(springComp?.masteredTopics).toBe(0);
    });

    it('gracefully handles empty categories with Novice level', () => {
      const competencies = calculateCompetencies(mockTopics);
      const dbComp = competencies.find(c => c.name === 'DATABASE');
      expect(dbComp).toBeDefined();
      expect(dbComp?.score).toBe(0);
      expect(dbComp?.totalTopics).toBe(0);
      expect(dbComp?.level).toBe('Novice');
    });
  });

  describe('findWeakestDimension', () => {
    it('identifies the lowest dimension across all topics', () => {
      const mockTopics: KnowledgeTopic[] = [
        {
          id: 'top-1',
          title: 'Kafka Consumer Lag',
          category: 'MICROSERVICES',
          subcategory: 'Messaging',
          description: 'Understanding partition lag and consumer rebalancing',
          difficulty: 'STAFF',
          status: 'PRACTICING',
          confidence: 3,
          dimensions: { theory: 4, handsOn: 3, recall: 3, explanation: 3, debugging: 1, interview: 2 },
          learned: true,
          implemented: true,
          explained: false,
          debugged: false,
          interviewReady: false,
          reviewCount: 2,
          createdAt: '2026-09-17T00:00:00Z',
          recommendedAction: 'Inspect partition lag metrics with JConsole',
          updatedAt: '2026-09-17T00:00:00Z',
        },
      ];

      const weakest = findWeakestDimension(mockTopics);
      expect(weakest).not.toBeNull();
      expect(weakest?.dimension).toBe('debugging');
      expect(weakest?.score).toBe(1);
      expect(weakest?.topicTitle).toBe('Kafka Consumer Lag');
      expect(weakest?.action).toBe('Inspect partition lag metrics with JConsole');
    });

    it('returns null when topics array is empty', () => {
      expect(findWeakestDimension([])).toBeNull();
    });
  });
});
