import React, { useState } from 'react';
import { 
  Award, 
  Play, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Repeat, 
  RefreshCw, 
  ChevronRight, 
  Sparkles,
  Zap,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearning } from '../../context/LearningContext';
import { InterviewQuestion } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export const InterviewView: React.FC = () => {
  const { interviewQuestions, createReviewCardFromMistake } = useLearning();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [createdReviewCard, setCreatedReviewCard] = useState<boolean>(false);

  const categories = ['ALL', 'JAVA', 'SPRING', 'DATABASE', 'MICROSERVICES', 'KAFKA', 'SYSTEM_DESIGN', 'DSA', 'BEHAVIORAL', 'ENGLISH'];

  const filteredQuestions = interviewQuestions.filter((q: InterviewQuestion) => 
    selectedCategory === 'ALL' || q.category === selectedCategory
  );

  const currentQ = filteredQuestions[activeQuestionIndex] || filteredQuestions[0];

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setCreatedReviewCard(false);
    if (filteredQuestions.length > 0) {
      setActiveQuestionIndex(prev => (prev + 1) % filteredQuestions.length);
    }
  };

  const handleCreateReviewCardFromMistake = () => {
    if (!currentQ) return;
    createReviewCardFromMistake(
      currentQ.question,
      currentQ.idealSeniorAnswer,
      currentQ.category
    );
    setCreatedReviewCard(true);
    confetti({ particleCount: 30, spread: 60 });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Live Mock Interview & Grilling Arena"
        description="Pressure-test your answers against real FAANG / Tier-1 Senior & Staff Java backend interview questions."
        badge={
          <Badge variant="success" size="sm" dot>
            Staff Interview Grilling Simulator
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleNextQuestion}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Random Question
          </Button>
        }
      />

      {/* Category Filter Pills */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveQuestionIndex(0);
                setShowAnswer(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary border-border hover:border-border-muted'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Grilling Screen */}
      {currentQ && (
        <Card variant="default" className="p-6 space-y-5">
          <div className="flex items-center justify-between font-mono text-xs">
            <Badge variant="success" size="sm">
              {currentQ.category} · {currentQ.difficulty}
            </Badge>
            <span className="text-text-tertiary">
              Question {activeQuestionIndex + 1} of {filteredQuestions.length}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-sky-400 uppercase font-bold tracking-wider">
              INTERVIEWER PROMPT:
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Key points expected */}
          <div className="p-4 bg-surface-elevated border border-border rounded-xl font-mono text-xs space-y-2">
            <div className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">
              RUBRIC POINTS INTERVIEWER IS LISTENING FOR:
            </div>
            <ul className="space-y-1 text-text-secondary">
              {currentQ.keyPointsExpected.map((pt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-400 mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reveal & Review Card Actions */}
          {!showAnswer ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full font-mono text-xs font-bold"
              onClick={() => setShowAnswer(true)}
              icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
            >
              Reveal Ideal Staff Architect Answer
            </Button>
          ) : (
            <div className="space-y-4 pt-4 border-t border-border animate-in fade-in duration-200">
              <div className="p-5 bg-surface-elevated border border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>IDEAL STAFF ARCHITECT RESPONSE:</span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
                  {currentQ.idealSeniorAnswer}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCreateReviewCardFromMistake}
                  disabled={createdReviewCard}
                  icon={<Plus className="w-3.5 h-3.5 text-amber-400" />}
                >
                  {createdReviewCard ? 'Card Created in Spaced Deck!' : 'Save as Spaced Review Flashcard'}
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextQuestion}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next Interview Question
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
