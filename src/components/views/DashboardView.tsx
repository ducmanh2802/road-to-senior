import React from 'react';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  Repeat, 
  Binary, 
  FolderGit2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Activity,
  Zap
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { 
  StatCard, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  Badge, 
  Button, 
  Progress,
  PageHeader 
} from '../ui';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    currentDay, 
    streak, 
    studyTimeMinutes, 
    tasks, 
    reviewCards, 
    dsaProblems, 
    projectFeatures, 
    getWeakestDimension,
    getNextBestAction,
    getCompetencies
  } = useLearning();

  const completedTasksCount = tasks.filter(t => t.state === 'COMPLETED').length;
  const totalTasksCount = tasks.length;
  const dueReviewsCount = reviewCards.filter(c => new Date(c.nextReviewAt) <= new Date()).length;
  const solvedDsaCount = dsaProblems.filter(p => p.attempts > 0).length;
  const masteredDsaCount = dsaProblems.filter(p => p.mastered).length;
  
  // Calculate project feature stages completed
  let totalStages = 0;
  let completedStages = 0;
  projectFeatures.forEach(f => {
    Object.values(f.stages).forEach(val => {
      totalStages++;
      if (val) completedStages++;
    });
  });
  const projectProgressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const weakest = getWeakestDimension();
  const nextAction = getNextBestAction();
  const competencies = getCompetencies();
  const daysRemaining = 180 - currentDay;

  const formatStudyTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 5-Second System Status Card */}
      <Card variant="default" padding="md" className="border-[#1E293B]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
              <Activity className="w-4 h-4 text-[#38BDF8]" />
              <span>5-SECOND SYSTEM STATUS</span>
              <Badge variant="primary" size="sm">Phase 2: Spring Boot 3 & Microservices</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
              DAY {currentDay.toString().padStart(2, '0')} · {daysRemaining} Days Remaining
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              Today's core target: <span className="text-[#F8FAFC] font-medium">CompletableFuture Asynchronous Pipelines & @Transactional Pitfalls</span>.
            </p>
          </div>

          {/* Recommended Next Action Box */}
          <div className="lg:w-80 bg-[#0B0E14] border border-[#1E293B] rounded-lg p-3.5 flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span className="uppercase font-semibold text-[#38BDF8] flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#38BDF8]" />
                RECOMMENDED ACTION
              </span>
              <span className="text-[#94A3B8]">PRIORITY #1</span>
            </div>
            <div className="text-xs font-semibold text-[#F8FAFC] mt-1.5 truncate">
              {nextAction.title}
            </div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">
              {nextAction.description}
            </div>
            <Button
              size="sm"
              variant="primary"
              iconRight={ArrowRight}
              className="mt-3 w-full"
              onClick={() => onNavigate(nextAction.targetView)}
            >
              {nextAction.actionLabel}
            </Button>
          </div>
        </div>
      </Card>

      {/* Engineering Signal Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="STREAK"
          value={streak}
          subValue="days"
          icon={Flame}
          iconColor="text-[#F59E0B]"
          iconBg="bg-[#F59E0B]/10 border-[#F59E0B]/30"
          trend={{ value: 'Active flow', direction: 'up' }}
        />

        <StatCard
          label="TIME TODAY"
          value={formatStudyTime(studyTimeMinutes)}
          icon={Clock}
          iconColor="text-[#38BDF8]"
          iconBg="bg-[#38BDF8]/10 border-[#38BDF8]/30"
          trend={{ value: 'Hands-on focus', direction: 'neutral' }}
        />

        <StatCard
          label="DAILY TASKS"
          value={`${completedTasksCount} / ${totalTasksCount}`}
          icon={CheckCircle2}
          iconColor="text-[#22C55E]"
          iconBg="bg-[#22C55E]/10 border-[#22C55E]/30"
          trend={{ 
            value: `${totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% done`, 
            direction: completedTasksCount === totalTasksCount ? 'up' : 'neutral' 
          }}
        />

        <StatCard
          label="REVIEWS DUE"
          value={dueReviewsCount}
          subValue="cards"
          icon={Repeat}
          iconColor="text-[#F59E0B]"
          iconBg="bg-[#F59E0B]/10 border-[#F59E0B]/30"
          trend={{ value: 'Spaced recall', direction: dueReviewsCount > 0 ? 'down' : 'up' }}
          onClick={() => onNavigate('review')}
        />

        <StatCard
          label="DSA MASTERED"
          value={masteredDsaCount}
          subValue={`/ ${solvedDsaCount}`}
          icon={Binary}
          iconColor="text-[#38BDF8]"
          iconBg="bg-[#38BDF8]/10 border-[#38BDF8]/30"
          trend={{ value: 'Pattern recall', direction: 'up' }}
          onClick={() => onNavigate('dsa')}
        />

        <StatCard
          label="PROJECT"
          value={`${projectProgressPercent}%`}
          icon={FolderGit2}
          iconColor="text-[#22C55E]"
          iconBg="bg-[#22C55E]/10 border-[#22C55E]/30"
          trend={{ value: '7 Services', direction: 'up' }}
          onClick={() => onNavigate('project')}
        />
      </div>

      {/* Main Grid: Competency Readiness + Weakest Area / Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Competency Readiness Model */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="md" className="h-full">
            <CardHeader border>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                  <span>Senior Competency Readiness Model</span>
                </CardTitle>
                <CardDescription>
                  Evaluated across 6 dimensions: Theory, Hands-on, Active Recall, Explanation, Debugging & Interview.
                </CardDescription>
              </div>
              <Badge variant="neutral" size="sm">REAL SIGNALS</Badge>
            </CardHeader>

            <div className="space-y-3.5 mt-4">
              {competencies.map((comp) => {
                let badgeVariant: 'success' | 'primary' | 'warning' | 'default' = 'default';
                if (comp.level === 'Senior Ready') badgeVariant = 'success';
                else if (comp.level === 'Advanced') badgeVariant = 'primary';
                else if (comp.level === 'Competent') badgeVariant = 'warning';

                return (
                  <div key={comp.name} className="bg-[#0B0E14] border border-[#1E293B] rounded-lg p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-[#F8FAFC] tracking-wide">
                          {comp.name}
                        </span>
                        <Badge variant={badgeVariant} size="sm">
                          {comp.level}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-[#94A3B8]">
                          Weakest: <span className="text-[#F59E0B] capitalize font-medium">{comp.weakestDimension}</span>
                        </span>
                        <span className="text-[#38BDF8] font-bold">{comp.score}%</span>
                      </div>
                    </div>

                    <Progress
                      value={comp.score}
                      variant={comp.score >= 80 ? 'success' : comp.score >= 60 ? 'primary' : 'warning'}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Weakest Area Alert & Incident Quick Launch */}
        <div className="space-y-4">
          {/* Weakest Dimension Radar Callout */}
          {weakest && (
            <Card variant="default" padding="md" className="border-[#F59E0B]/40 bg-[#111622]">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#F59E0B] uppercase mb-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <span>IDENTIFIED WEAKEST DIMENSION</span>
              </div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">
                {weakest.topicTitle}
              </h3>
              <div className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
                Dimension: <span className="text-[#F59E0B] font-mono uppercase font-bold">{weakest.dimension}</span> ({weakest.score}/5).
                <p className="mt-1 text-[#E5E7EB]">
                  {weakest.action}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                iconRight={ArrowRight}
                className="mt-4 w-full"
                onClick={() => onNavigate('knowledge')}
              >
                Drill Weak Dimension
              </Button>
            </Card>
          )}

          {/* Incident Lab Chaos Quick Box */}
          <Card variant="default" padding="md" className="border-[#EF4444]/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#EF4444] uppercase">
                <Flame className="w-4 h-4" />
                <span>INCIDENT LAB</span>
              </div>
              <Badge variant="danger" size="sm">CHAOS READY</Badge>
            </div>
            <div className="text-xs font-semibold text-[#F8FAFC]">
              Break The System Scenarios
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Practice root cause analysis for HikariCP pool exhaustion, Kafka rebalance storms, and memory leaks.
            </p>
            <Button
              variant="danger"
              size="sm"
              iconRight={ArrowRight}
              className="mt-3 w-full"
              onClick={() => onNavigate('incident')}
            >
              Launch Incident Lab
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

