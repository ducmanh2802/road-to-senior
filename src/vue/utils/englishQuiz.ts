import { TECHNICAL_ENGLISH_ITEMS } from '../../data/technicalEnglish';

export interface QuizQuestion {
  id: string;
  targetItemId: string;
  term: string;
  topic: string;
  section: string;
  difficulty: string;
  // Prompt asks learner to identify the right term for a definition, or the right definition for a term
  prompt: string;
  // The correct definition or term
  correctAnswer: string;
  // 4 choices (including the correct one, shuffled)
  options: string[];
  explanation: string;
  seniorInsight: string;
}

/**
 * Shuffles an array using Fisher-Yates algorithm deterministically or pseudo-randomly
 */
function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Generates N multiple-choice questions from TECHNICAL_ENGLISH_ITEMS.
 * Questions test recognizing either the technical term given its definition/scenario,
 * or the senior engineering definition given the term.
 */
export function generateEnglishQuiz(count = 5): QuizQuestion[] {
  const allItems = [...TECHNICAL_ENGLISH_ITEMS];
  const selectedTargets = shuffleArray(allItems).slice(0, Math.min(count, allItems.length));

  return selectedTargets.map((target, idx) => {
    // Other items to act as distractors
    const otherItems = allItems.filter((item) => item.id !== target.id);
    const distractors = shuffleArray(otherItems).slice(0, 3);

    // Alternate question styles to keep it engaging:
    // Style A (even idx): "Given this definition/scenario, which technical term or pattern is described?" -> choices are terms
    // Style B (odd idx): "What is the accurate senior-level engineering definition for [TERM]?" -> choices are definitions
    const isStyleA = idx % 2 === 0;

    let prompt: string;
    let correctAnswer: string;
    let options: string[];

    if (isStyleA) {
      prompt = `Which technical term or architectural concept is described by: "${target.plainEnglishExplanation}"?`;
      correctAnswer = target.term;
      const wrongTerms = distractors.map((d) => d.term);
      options = shuffleArray([correctAnswer, ...wrongTerms]);
    } else {
      prompt = `In a senior architecture or interview discussion, how is "${target.term}" most accurately defined?`;
      correctAnswer = target.plainEnglishExplanation;
      const wrongDefinitions = distractors.map((d) => d.plainEnglishExplanation);
      options = shuffleArray([correctAnswer, ...wrongDefinitions]);
    }

    return {
      id: `quiz-q-${idx + 1}-${target.id}`,
      targetItemId: target.id,
      term: target.term,
      topic: target.topic,
      section: target.section,
      difficulty: target.difficulty,
      prompt,
      correctAnswer,
      options,
      explanation: target.exampleSentence,
      seniorInsight: target.seniorExplanation,
    };
  });
}
