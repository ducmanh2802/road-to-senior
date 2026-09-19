import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Flame, 
  Activity, 
  Calendar, 
  Binary, 
  FolderGit2, 
  Award,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

export const AnalyticsView: React.FC = () => {
  const { 
    currentDay, 
    streak, 
    studyTimeMinutes, 
    tasks, 
    reviewCards, 
    dsaProblems, 
    projectFeatures, 
    getCompetencies, 
    getWeakestDimension 
  } = useLearning();

  const competencies = getCompetencies();
  const weakest = getWeakestDimension();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.state === 'COMPLETED').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalDsa = dsaProblems.length;
  const masteredDsa = dsaProblems.filter(p => p.mastered).length;

  const averageIntervalDays = reviewCards.length > 0
    ? Math.round(reviewCards.reduce((acc, c) => acc + c.intervalDays, 0) / reviewCards.length)
    : 0;

  // Estimated Readiness date (180 - currentDay) days from today
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (180 - currentDay));
  const formattedTargetDate = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Readiness Signals & Retention Velocity"
        description="No vanity streaks. Measured by real code verification, active recall stability, and incident triaging velocity."
        badge={
          <Badge variant="primary" size="sm" dot>
            Readiness Analytics & Competency Radar
          </Badge>
        }
        actions={
          <div className="p-3 bg-surface-elevated border border-border rounded-xl font-mono text-xs text-right">
            <div className="text-[10px] text-text-tertiary uppercase">SENIOR READINESS TARGET:</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">{formattedTargetDate}</div>
            <div className="text-[10px] text-sky-400">{180 - currentDay} days remaining</div>
          </div>
        }
      />

      {/* 4 Core Quantitative Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="EXECUTION DISCIPLINE"
          value={`${taskCompletionRate}%`}
          change={`${completedTasks}/${totalTasks} tasks finished`}
          trend="up"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
        <StatCard
          label="MEMORY STABILITY (SM-2)"
          value={`${averageIntervalDays}d`}
          change="Average recall interval"
          trend="neutral"
          icon={<Activity className="w-4 h-4 text-amber-400" />}
        />
        <StatCard
          label="DSA REPRODUCIBILITY"
          value={`${masteredDsa}/${totalDsa}`}
          change="Mastered with zero hints"
          trend="up"
          icon={<Binary className="w-4 h-4 text-purple-400" />}
        />
        <StatCard
          label="DEEP FOCUS HOURS"
          value={`${(studyTimeMinutes / 60).toFixed(1)}h`}
          change="Total deliberate practice"
          trend="up"
          icon={<Clock className="w-4 h-4 text-sky-400" />}
        />
      </div>

      {/* Competency Readiness Deep Breakdown */}
      <Card variant="default" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Senior Competency Distribution</span>
          </h2>
          <span className="text-[11px] font-mono text-text-tertiary">Graded on 1-5 scale</span>
        </div>

        <div className="space-y-3">
          {competencies.map(comp => (
            <div key={comp.name} className="p-4 bg-surface-elevated border border-border rounded-xl space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary text-sm">{comp.name}</span>
                  <Badge variant="outline" size="sm">
                    {comp.level}
                  </Badge>
                </div>
                <div className="text-sm font-bold text-sky-400">{comp.score}%</div>
              </div>

              {/* Progress bar */}
              <Progress 
                value={comp.score} 
                color={comp.score >= 80 ? 'emerald' : comp.score >= 60 ? 'sky' : 'amber'} 
                size="md" 
              />

              <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                <span>Identified Bottleneck: <strong className="text-amber-400 capitalize">{comp.weakestDimension}</strong></span>
                <span className="text-text-tertiary">Dimension balance: 88%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
