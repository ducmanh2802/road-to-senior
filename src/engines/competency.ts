import { KnowledgeTopic, MasteryDimensions, KnowledgeStatus, CompetencyReadiness } from '../types';

export const VALID_CATEGORIES: ('JAVA' | 'SPRING' | 'MICROSERVICES' | 'DATABASE' | 'SYSTEM_DESIGN' | 'AI_ENGINEERING')[] = [
  'JAVA',
  'SPRING',
  'MICROSERVICES',
  'DATABASE',
  'SYSTEM_DESIGN',
  'AI_ENGINEERING',
];

export interface TopicEvaluationResult {
  averageScore: number;
  confidence: number;
  status: KnowledgeStatus;
  dimensions: MasteryDimensions;
}

/**
 * Calculates average mastery and derives corresponding KnowledgeStatus from the 6 dimensions
 */
export function evaluateTopicDimensions(
  dimensions: Partial<MasteryDimensions>,
  fallbackDimensions: MasteryDimensions = {
    theory: 1,
    handsOn: 1,
    recall: 1,
    explanation: 1,
    debugging: 1,
    interview: 1,
  }
): TopicEvaluationResult {
  const mergedDims: MasteryDimensions = {
    theory: Math.max(1, Math.min(5, dimensions.theory ?? fallbackDimensions.theory)),
    handsOn: Math.max(1, Math.min(5, dimensions.handsOn ?? fallbackDimensions.handsOn)),
    recall: Math.max(1, Math.min(5, dimensions.recall ?? fallbackDimensions.recall)),
    explanation: Math.max(1, Math.min(5, dimensions.explanation ?? fallbackDimensions.explanation)),
    debugging: Math.max(1, Math.min(5, dimensions.debugging ?? fallbackDimensions.debugging)),
    interview: Math.max(1, Math.min(5, dimensions.interview ?? fallbackDimensions.interview)),
  };

  const sum =
    mergedDims.theory +
    mergedDims.handsOn +
    mergedDims.recall +
    mergedDims.explanation +
    mergedDims.debugging +
    mergedDims.interview;

  const averageScore = Math.round((sum / 6) * 100) / 100;
  const confidence = Math.round(averageScore);

  let status: KnowledgeStatus = 'LEARNING';
  if (averageScore >= 4.5) {
    status = 'MASTERED';
  } else if (averageScore >= 3.5) {
    status = 'UNDERSTOOD';
  } else if (averageScore >= 2.5) {
    status = 'PRACTICING';
  }

  return {
    averageScore,
    confidence,
    status,
    dimensions: mergedDims,
  };
}

/**
 * Derives readiness categories, competency levels, and weakest dimensions across knowledge topics
 */
export function calculateCompetencies(topics: KnowledgeTopic[]): CompetencyReadiness[] {
  return VALID_CATEGORIES.map(cat => {
    const categoryTopics = topics.filter(t => t.category === cat);
    if (categoryTopics.length === 0) {
      return {
        name: cat.replace('_', ' '),
        score: 0,
        totalTopics: 0,
        masteredTopics: 0,
        weakestDimension: 'theory',
        level: 'Novice',
      };
    }

    let totalScore = 0;
    let mastered = 0;
    const dimTotals: Record<keyof MasteryDimensions, number> = {
      theory: 0,
      handsOn: 0,
      recall: 0,
      explanation: 0,
      debugging: 0,
      interview: 0,
    };

    categoryTopics.forEach(t => {
      const { averageScore, status } = evaluateTopicDimensions(t.dimensions);
      totalScore += averageScore;
      if (status === 'MASTERED' || t.status === 'MASTERED') {
        mastered++;
      }

      dimTotals.theory += t.dimensions.theory || 1;
      dimTotals.handsOn += t.dimensions.handsOn || 1;
      dimTotals.recall += t.dimensions.recall || 1;
      dimTotals.explanation += t.dimensions.explanation || 1;
      dimTotals.debugging += t.dimensions.debugging || 1;
      dimTotals.interview += t.dimensions.interview || 1;
    });

    const maxPossible = categoryTopics.length * 5;
    const overallPercent = Math.min(100, Math.max(0, Math.round((totalScore / maxPossible) * 100)));

    // Identify lowest dimension
    let minDimVal = Infinity;
    let minDimName: keyof MasteryDimensions = 'theory';
    (Object.entries(dimTotals) as [keyof MasteryDimensions, number][]).forEach(([d, val]) => {
      if (val < minDimVal) {
        minDimVal = val;
        minDimName = d;
      }
    });

    let level: CompetencyReadiness['level'] = 'Novice';
    if (overallPercent >= 85) level = 'Senior Ready';
    else if (overallPercent >= 70) level = 'Advanced';
    else if (overallPercent >= 50) level = 'Competent';

    return {
      name: cat.replace('_', ' '),
      score: overallPercent,
      totalTopics: categoryTopics.length,
      masteredTopics: mastered,
      weakestDimension: minDimName,
      level,
    };
  });
}

/**
 * Finds the single weakest dimension across all knowledge topics
 */
export function findWeakestDimension(topics: KnowledgeTopic[]) {
  let lowestScore = Infinity;
  let weakestTopic = '';
  let weakestDim = '';
  let action = '';

  topics.forEach(topic => {
    const dimEntries = Object.entries(topic.dimensions) as [keyof MasteryDimensions, number][];
    dimEntries.forEach(([dim, val]) => {
      if (val < lowestScore) {
        lowestScore = val;
        weakestTopic = topic.title;
        weakestDim = dim;
        action = topic.recommendedAction || `Practice ${dim} for ${topic.title}`;
      }
    });
  });

  if (lowestScore === Infinity) return null;
  return {
    topicTitle: weakestTopic,
    dimension: weakestDim,
    score: lowestScore,
    action,
  };
}
