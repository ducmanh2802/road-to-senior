import React, { useState } from 'react';
import { 
  Repeat, 
  Eye, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Zap,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearning } from '../../context/LearningContext';
import { ReviewGrade } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { CodeBlock } from '../ui/CodeBlock';
import { EmptyState } from '../ui/EmptyState';

export const ReviewView: React.FC = () => {
  const { reviewCards, recordReviewAnswer } = useLearning();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [userDraftAnswer, setUserDraftAnswer] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  // Filter due cards or fallback to active deck
  const dueCards = reviewCards.filter(c => new Date(c.nextReviewAt) <= new Date());
  const activeDeck = dueCards.length > 0 ? dueCards : reviewCards;

  const currentCard = activeDeck[currentIndex];
  const isDeckFinished = currentIndex >= activeDeck.length || !currentCard;

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleGrade = (grade: ReviewGrade) => {
    if (!currentCard) return;
    const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);
    recordReviewAnswer(currentCard.id, grade, durationSec);

    setIsRevealed(false);
    setUserDraftAnswer('');
    setSessionStartTime(Date.now());

    if (currentIndex + 1 >= activeDeck.length) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleResetSession = () => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setUserDraftAnswer('');
    setSessionStartTime(Date.now());
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Spaced Repetition & Active Recall"
        description="Type your architectural explanation before flipping. True memory consolidation occurs only during deliberate retrieval effort."
        badge={
          <Badge variant="warning" size="sm" dot>
            {dueCards.length} Cards Due Today
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2 font-mono text-xs">
            <Badge variant="outline" size="md">
              Progress: {Math.min(currentIndex + 1, activeDeck.length)} / {activeDeck.length}
            </Badge>
          </div>
        }
      />

      {/* Main Flashcard Arena */}
      {!isDeckFinished ? (
        <Card variant="default" className="overflow-hidden border-border-muted shadow-xl">
          {/* Card Top Metadata Bar */}
          <div className="p-4 bg-surface-elevated border-b border-border flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {currentCard.category}
              </Badge>
              <span className="text-text-secondary">
                Interval: <strong className="text-text-primary">{currentCard.intervalDays}d</strong> · Reps: {currentCard.repetitionCount}
              </span>
            </div>

            <div className="text-text-tertiary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Session Timer Active</span>
            </div>
          </div>

          {/* Card Question Area */}
          <div className="p-6 space-y-5">
            <div>
              <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-bold mb-1.5">
                ACTIVE RECALL PROMPT
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary leading-snug">
                {currentCard.question}
              </h2>
            </div>

            {/* Active Recall Input Box */}
            <div className="space-y-2">
              <Textarea
                label="YOUR MENTAL RETRIEVAL / EXPLANATION:"
                helperText="Simulate your senior interview verbal formulation before checking the answer."
                rows={3}
                placeholder="Draft your explanation in your own words before revealing the senior answer..."
                value={userDraftAnswer}
                onChange={e => setUserDraftAnswer(e.target.value)}
                disabled={isRevealed}
              />
            </div>

            {/* Reveal Button */}
            {!isRevealed ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full font-mono text-xs font-bold"
                onClick={handleReveal}
                icon={<Eye className="w-4 h-4" />}
              >
                Reveal Model Answer & Code Blueprint
              </Button>
            ) : (
              /* Revealed Answer Section */
              <div className="space-y-5 pt-4 border-t border-border animate-in fade-in duration-200">
                <div className="p-4 bg-surface-elevated border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>IDEAL SENIOR ARCHITECTURAL ANSWER</span>
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                    {currentCard.expectedAnswer}
                  </p>

                  {currentCard.codeExample && (
                    <div className="mt-3">
                      <CodeBlock
                        code={currentCard.codeExample}
                        language="java"
                        title="Canonical Pattern"
                        showLineNumbers
                      />
                    </div>
                  )}
                </div>

                {/* 4 SuperMemo Rating Buttons */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-center text-text-secondary">
                    Rate your retrieval accuracy to compute the next SM-2 interval:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                    <button
                      onClick={() => handleGrade('AGAIN')}
                      className="p-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 rounded-lg text-center transition-all group hover:scale-[1.02]"
                    >
                      <div className="text-xs font-bold text-rose-400">
                        AGAIN
                      </div>
                      <div className="text-[10px] text-text-secondary mt-0.5">1 day</div>
                    </button>

                    <button
                      onClick={() => handleGrade('HARD')}
                      className="p-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-lg text-center transition-all group hover:scale-[1.02]"
                    >
                      <div className="text-xs font-bold text-amber-400">
                        HARD
                      </div>
                      <div className="text-[10px] text-text-secondary mt-0.5">2 days</div>
                    </button>

                    <button
                      onClick={() => handleGrade('GOOD')}
                      className="p-3 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 rounded-lg text-center transition-all group hover:scale-[1.02]"
                    >
                      <div className="text-xs font-bold text-sky-400">
                        GOOD
                      </div>
                      <div className="text-[10px] text-text-secondary mt-0.5">4 days</div>
                    </button>

                    <button
                      onClick={() => handleGrade('EASY')}
                      className="p-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-lg text-center transition-all group hover:scale-[1.02]"
                    >
                      <div className="text-xs font-bold text-emerald-400">
                        EASY
                      </div>
                      <div className="text-[10px] text-text-secondary mt-0.5">8+ days</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* Deck Completed Screen */
        <EmptyState
          icon={<CheckCircle2 className="w-10 h-10 text-emerald-400" />}
          title="Daily Spaced Review Complete!"
          description="All due cards have been processed and rescheduled according to your cognitive retention curve."
          action={
            <Button
              variant="outline"
              size="md"
              onClick={handleResetSession}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Practice Deck Again
            </Button>
          }
        />
      )}
    </div>
  );
};
