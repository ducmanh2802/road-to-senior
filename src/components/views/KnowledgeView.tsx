import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  HelpCircle
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { KnowledgeTopic, MasteryDimensions, KnowledgeStatus } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge, BadgeVariant } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export const KnowledgeView: React.FC = () => {
  const { knowledgeTopics, updateKnowledgeDimensions } = useLearning();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>('topic-kafka-internals');

  const categories = ['ALL', 'JAVA', 'SPRING', 'MICROSERVICES', 'DATABASE', 'SYSTEM_DESIGN'];

  const filteredTopics = knowledgeTopics.filter(topic => {
    const matchesCat = selectedCategory === 'ALL' || topic.category === selectedCategory;
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const dimensionKeys: (keyof MasteryDimensions)[] = [
    'theory', 'handsOn', 'recall', 'explanation', 'debugging', 'interview'
  ];

  const dimensionLabels: Record<keyof MasteryDimensions, string> = {
    theory: 'Theory',
    handsOn: 'Hands-on',
    recall: 'Active Recall',
    explanation: 'Explanation',
    debugging: 'Debugging',
    interview: 'Interview'
  };

  const getStatusBadgeConfig = (status: KnowledgeStatus): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'MASTERED':
        return { label: 'MASTERED', variant: 'success' };
      case 'UNDERSTOOD':
        return { label: 'UNDERSTOOD', variant: 'primary' };
      case 'PRACTICING':
        return { label: 'PRACTICING', variant: 'warning' };
      case 'LEARNING':
        return { label: 'LEARNING', variant: 'purple' };
      case 'NEEDS_REVIEW':
        return { label: 'NEEDS REVIEW', variant: 'danger' };
      default:
        return { label: 'NOT STARTED', variant: 'neutral' };
    }
  };

  const handleDimensionChange = (topicId: string, dim: keyof MasteryDimensions, value: number) => {
    updateKnowledgeDimensions(topicId, { [dim]: value });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Multi-Dimensional Knowledge Base"
        description="A concept is not mastered by passive reading alone. Track and verify 6 dimensions: Theory, Hands-on, Recall, Explanation, Debugging & Interview."
        badge={
          <Badge variant="primary" size="sm" dot>
            {knowledgeTopics.length} Curated Knowledge Nodes
          </Badge>
        }
        actions={
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search topics, pitfalls..."
              icon={<Search className="w-3.5 h-3.5" />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        }
      />

      {/* Category Filter Pills */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-sm'
                  : 'bg-surface-elevated text-text-muted hover:text-text-primary border-border hover:border-border-muted'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Topics list */}
      <div className="space-y-3">
        {filteredTopics.map(topic => {
          const isExpanded = expandedTopicId === topic.id;
          const statusBadge = getStatusBadgeConfig(topic.status);

          // Find weakest dimension for this topic
          let lowestVal = 999;
          let lowestDimName = '';
          Object.entries(topic.dimensions).forEach(([d, val]) => {
            if (val < lowestVal) {
              lowestVal = val;
              lowestDimName = d;
            }
          });

          return (
            <Card
              key={topic.id}
              variant={isExpanded ? 'default' : 'glass'}
              className="overflow-hidden transition-all border-border hover:border-border-muted"
            >
              {/* Header Bar */}
              <div 
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge variant="outline" size="sm">
                      {topic.category} · {topic.subcategory}
                    </Badge>
                    <Badge variant={statusBadge.variant} size="sm">
                      {statusBadge.label}
                    </Badge>
                    <span className="text-[11px] font-mono text-text-tertiary">
                      Difficulty: <strong className="text-text-primary font-semibold">{topic.difficulty}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary leading-tight">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {topic.description}
                  </p>
                </div>

                {/* Right: Weakest Dimension Pill & Chevron */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {lowestVal <= 2 && (
                    <Badge variant="warning" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                      Weakest: <span className="capitalize ml-1 font-bold">{lowestDimName}</span> ({lowestVal}/5)
                    </Badge>
                  )}

                  <div className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Breakdown */}
              {isExpanded && (
                <div className="p-4 pt-2 border-t border-border space-y-4 font-mono text-xs bg-surface-elevated/40">
                  {/* 6 Dimension Sliders */}
                  <div>
                    <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider mb-2.5">
                      6-DIMENSION MASTERY GRADING (1 = UNFAMILIAR, 5 = INTERVIEW READY)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      {dimensionKeys.map(dim => {
                        const val = topic.dimensions[dim];
                        return (
                          <div key={dim} className="p-2.5 bg-surface-elevated border border-border rounded-lg space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-text-secondary font-medium">{dimensionLabels[dim]}</span>
                              <span className={`font-bold ${val >= 4 ? 'text-emerald-400' : val >= 3 ? 'text-sky-400' : 'text-amber-400'}`}>
                                {val}/5
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(rating => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDimensionChange(topic.id, dim, rating);
                                  }}
                                  className={`flex-1 h-5 rounded text-[10px] font-bold transition-colors ${
                                    rating <= val
                                      ? val >= 4 
                                        ? 'bg-emerald-500 text-slate-950' 
                                        : val >= 3 
                                        ? 'bg-sky-500 text-slate-950' 
                                        : 'bg-amber-500 text-slate-950'
                                      : 'bg-surface text-text-muted hover:bg-surface-hover'
                                  }`}
                                >
                                  {rating}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Production Pitfalls */}
                  {topic.keyPitfalls && topic.keyPitfalls.length > 0 && (
                    <Alert
                      variant="danger"
                      title="CRITICAL PRODUCTION PITFALLS"
                      icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
                    >
                      <ul className="list-disc list-inside space-y-1 text-xs text-text-primary font-sans mt-1">
                        {topic.keyPitfalls.map((pitfall, idx) => (
                          <li key={idx}>{pitfall}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {/* Interview Questions */}
                  {topic.interviewQuestions && topic.interviewQuestions.length > 0 && (
                    <div className="p-3.5 bg-surface-elevated border border-border rounded-lg space-y-2">
                      <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        SENIOR INTERVIEW QUESTIONS
                      </div>
                      <ul className="space-y-2 text-xs text-text-primary font-sans">
                        {topic.interviewQuestions.map((q, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-sky-400 font-mono font-bold shrink-0">Q{idx + 1}:</span>
                            <span className="leading-relaxed">{q}</span>
                          </li>
                        ))}
                      </ul>
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
