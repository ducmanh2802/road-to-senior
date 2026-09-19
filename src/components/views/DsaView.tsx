import React, { useState } from 'react';
import { 
  Binary, 
  Search, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Code2, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Flame,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearning } from '../../context/LearningContext';
import { DSAProblem } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { Badge, BadgeVariant } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CodeBlock } from '../ui/CodeBlock';

export const DsaView: React.FC = () => {
  const { dsaProblems, recordDsaAttempt, toggleDsaMastered } = useLearning();

  const [selectedPattern, setSelectedPattern] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('dsa-1');
  
  // Active problem stopwatch / timer
  const [timingProblemId, setTimingProblemId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  const patterns = [
    'ALL', 'Sliding Window', 'Two Pointers', 'HashMap', 'Graph', 'Monotonic Stack', 'Dynamic Programming', 'Binary Search', 'Trees'
  ];

  const filteredProblems = dsaProblems.filter(p => {
    const matchesPattern = selectedPattern === 'ALL' || p.pattern.includes(selectedPattern);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPattern && matchesSearch;
  });

  const totalAttempted = dsaProblems.filter(p => p.attempts > 0).length;
  const totalMastered = dsaProblems.filter(p => p.mastered).length;
  const totalSolvedIndependent = dsaProblems.filter(p => p.solvedWithoutHelp).length;

  const handleToggleMastered = (id: string) => {
    toggleDsaMastered(id);
    confetti({ particleCount: 30, spread: 60 });
  };

  const getDifficultyBadge = (difficulty: string): { label: string; variant: BadgeVariant } => {
    switch (difficulty.toUpperCase()) {
      case 'HARD':
        return { label: 'HARD', variant: 'danger' };
      case 'MEDIUM':
        return { label: 'MEDIUM', variant: 'warning' };
      default:
        return { label: 'EASY', variant: 'success' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="DSA Patterns & Java 21 Templates"
        description="Solved ≠ Mastered. Mastered requires solving independently within 25 minutes and articulating big-O trade-offs with zero stumbling."
        badge={
          <Badge variant="purple" size="sm" dot>
            {dsaProblems.length} High-Yield Patterns
          </Badge>
        }
        actions={
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search pattern or problem..."
              icon={<Search className="w-3.5 h-3.5" />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        }
      />

      {/* Quantitative Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="PROBLEMS TRACKED"
          value={dsaProblems.length}
          icon={<Binary className="w-4 h-4 text-sky-400" />}
        />
        <StatCard
          label="ATTEMPTED"
          value={totalAttempted}
          icon={<Clock className="w-4 h-4 text-purple-400" />}
        />
        <StatCard
          label="SOLVED NO HINTS"
          value={totalSolvedIndependent}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
        <StatCard
          label="MASTERED (REPRODUCIBLE)"
          value={totalMastered}
          icon={<Award className="w-4 h-4 text-amber-400" />}
        />
      </div>

      {/* Pattern Filter Pills */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {patterns.map(pat => (
            <button
              key={pat}
              onClick={() => setSelectedPattern(pat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap border ${
                selectedPattern === pat
                  ? 'bg-purple-500 text-slate-950 font-bold border-purple-400 shadow-sm'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary border-border hover:border-border-muted'
              }`}
            >
              {pat}
            </button>
          ))}
        </div>
      </Card>

      {/* Problem list */}
      <div className="space-y-3">
        {filteredProblems.map(p => {
          const isExpanded = expandedId === p.id;
          const diffBadge = getDifficultyBadge(p.difficulty);

          return (
            <Card 
              key={p.id}
              variant={p.mastered ? 'emphasis' : isExpanded ? 'default' : 'glass'}
              className={`transition-all border-border hover:border-border-muted ${
                p.mastered ? 'border-purple-500/40 ring-1 ring-purple-500/20' : ''
              }`}
            >
              {/* Header */}
              <div 
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge variant="purple" size="sm">
                      {p.pattern}
                    </Badge>
                    <Badge variant={diffBadge.variant} size="sm">
                      {diffBadge.label}
                    </Badge>
                    <span className="text-[11px] font-mono text-text-tertiary">
                      Time Limit: <strong className="text-text-primary">{p.timeLimitMinutes} min</strong>
                    </span>
                    {p.bestTimeMinutes && (
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        Best: {p.bestTimeMinutes} min
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-text-primary">
                      {p.title}
                    </h3>
                    {p.sourceUrl && (
                      <a 
                        href={p.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={e => e.stopPropagation()}
                        className="text-sky-400 hover:underline flex items-center gap-0.5 text-xs font-mono"
                        aria-label={`Open source problem for ${p.title}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions & Mastered Toggle */}
                <div 
                  className="flex items-center gap-2.5 shrink-0 self-end md:self-center"
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    variant={p.mastered ? 'primary' : 'outline'}
                    size="sm"
                    className={`font-mono text-xs ${p.mastered ? 'bg-purple-500 hover:bg-purple-600 text-slate-950 border-purple-400' : ''}`}
                    onClick={() => handleToggleMastered(p.id)}
                    icon={<Award className="w-3.5 h-3.5" />}
                  >
                    {p.mastered ? 'MASTERED' : 'MARK MASTERED'}
                  </Button>

                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expandable Body */}
              {isExpanded && (
                <div className="p-4 pt-2 border-t border-border space-y-4 font-mono text-xs bg-surface-elevated/40">
                  {/* Complexity & Key Insights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-surface-elevated border border-border rounded-lg space-y-1">
                      <div className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">
                        COMPLEXITY GUARANTEES
                      </div>
                      <div className="text-text-primary">Time: <span className="text-emerald-400 font-bold">{p.timeComplexity}</span></div>
                      <div className="text-text-primary">Space: <span className="text-amber-400 font-bold">{p.spaceComplexity}</span></div>
                    </div>

                    <div className="p-3 bg-surface-elevated border border-border rounded-lg space-y-1">
                      <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                        COMMON MISTAKES & TRAPS
                      </div>
                      <p className="text-xs text-text-primary font-sans leading-relaxed">
                        {p.mistakes || 'Ensure edge cases (empty collections, window boundary off-by-one) are validated.'}
                      </p>
                    </div>
                  </div>

                  {/* Pattern Notes */}
                  {p.notes && (
                    <div className="p-3 bg-surface-elevated border border-border rounded-lg space-y-1">
                      <div className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                        ARCHITECTURAL PATTERN BLUEPRINT
                      </div>
                      <p className="text-xs text-text-primary font-sans leading-relaxed">{p.notes}</p>
                    </div>
                  )}

                  {/* Optimal Java Solution with CodeBlock */}
                  {p.optimalSolutionJava && (
                    <div className="space-y-1.5">
                      <CodeBlock
                        code={p.optimalSolutionJava}
                        language="java"
                        title="Optimal Java 21 Implementation"
                        showLineNumbers
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
