import React, { useState } from 'react';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Layers, 
  Coffee, 
  Leaf, 
  Cpu, 
  Binary, 
  Award,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { EmptyState } from '../ui/EmptyState';

interface RoadmapViewProps {
  onNavigate: (view: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onNavigate }) => {
  const { currentDay, setCurrentDay, roadmapDays } = useLearning();
  const [selectedPhase, setSelectedPhase] = useState<number>(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDayDetail, setSelectedDayDetail] = useState<number | null>(37);

  const phases = [
    { number: 1, name: 'Phase 1: Core Java & Concurrency', range: 'Days 1–30', icon: Coffee, desc: 'OOP, JVM Memory, GC, volatile, CompletableFuture, Virtual Threads & Performance' },
    { number: 2, name: 'Phase 2: Spring Boot 3 Deep Dive', range: 'Days 31–60', icon: Leaf, desc: 'IoC, AOP Proxies, @Transactional, Security 6, JPA N+1, Testcontainers & Observability' },
    { number: 3, name: 'Phase 3: Microservices & Event-Driven', range: 'Days 61–100', icon: Layers, desc: 'Kafka Partitioning, Consumer Groups, Outbox Pattern, Saga Orchestrator & Redlock' },
    { number: 4, name: 'Phase 4: System Design at Scale', range: 'Days 101–125', icon: Cpu, desc: 'CAP Theorem, Sharding, Consistent Hashing, Rate Limiting & High-Availability' },
    { number: 5, name: 'Phase 5: DSA Patterns & Speed', range: 'Days 126–150', icon: Binary, desc: 'Sliding Window, Monotonic Stack, Graphs, Topological Sort & Hard DP' },
    { number: 6, name: 'Phase 6: Senior Interview Mastery', range: 'Days 151–180', icon: Award, desc: 'Live System Design, Incident Triaging, Concurrency Grilling, Behavioral STAR & Mock Screens' },
  ];

  const filteredDays = roadmapDays.filter(d => {
    const matchesPhase = selectedPhase === 0 || d.phaseNumber === selectedPhase;
    const matchesSearch = 
      d.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.coreConcepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.dayNumber.toString() === searchQuery;
    return matchesPhase && matchesSearch;
  });

  const activeDayObj = roadmapDays.find(d => d.dayNumber === selectedDayDetail) || roadmapDays[0];

  const handleSetCurrentDay = (dayNum: number) => {
    setCurrentDay(dayNum);
    onNavigate('today');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Canonical Page Header */}
      <PageHeader
        title="180-Day Architect Curriculum"
        description="6 structured phases designed to build deep runtime mastery, distributed consistency, and senior engineering rigor."
        badge={
          <Badge variant="primary" size="sm" dot>
            Day {currentDay} of 180 Active
          </Badge>
        }
        actions={
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search concepts or day..."
              icon={<Search className="w-3.5 h-3.5" />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        }
      />

      {/* Phase Filter Bar */}
      <Card variant="default" className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          <button
            onClick={() => setSelectedPhase(0)}
            className={`p-2.5 rounded text-left border transition-all text-xs font-mono cursor-pointer ${
              selectedPhase === 0
                ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 font-semibold'
                : 'bg-[#151B28] text-[#94A3B8] border-[#1E293B] hover:border-[#334155] hover:text-[#F8FAFC]'
            }`}
          >
            <div className="font-bold">ALL PHASES</div>
            <div className="text-[10px] text-[#64748B]">180 Days</div>
          </button>

          {phases.map(p => {
            const Icon = p.icon;
            const isSelected = selectedPhase === p.number;
            return (
              <button
                key={p.number}
                onClick={() => setSelectedPhase(p.number)}
                className={`p-2.5 rounded text-left border transition-all text-xs font-mono cursor-pointer ${
                  isSelected
                    ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 font-semibold'
                    : 'bg-[#151B28] text-[#94A3B8] border-[#1E293B] hover:border-[#334155] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Icon className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <span className="truncate font-bold">P{p.number}</span>
                </div>
                <div className="text-[10px] text-[#64748B] truncate">{p.range}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Roadmap Split View: List on Left, Day Detail Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline list of days */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDays.length === 0 ? (
            <EmptyState
              title="No days match filter"
              description="No curriculum days found for this search or phase filter. Try resetting your query."
              action={{ label: 'Reset Search & Phase', onClick: () => {
                setSearchQuery('');
                setSelectedPhase(0);
              } }}
            />
          ) : (
            filteredDays.map(day => {
              const isCurrent = day.dayNumber === currentDay;
              const isSelected = day.dayNumber === selectedDayDetail;
              const isPassed = day.dayNumber < currentDay;

              return (
                <Card
                  key={day.dayNumber}
                  variant={isCurrent ? 'emphasis' : isSelected ? 'default' : 'sunken'}
                  interactive
                  onClick={() => setSelectedDayDetail(day.dayNumber)}
                  className={`p-4 transition-all ${
                    isCurrent
                      ? 'border-[#38BDF8]/60 ring-1 ring-[#38BDF8]/30'
                      : isSelected
                      ? 'border-[#38BDF8]/40'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="pt-0.5 shrink-0">
                        {day.completed || isPassed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8] flex items-center justify-center text-[10px] font-mono font-bold text-[#38BDF8]">
                            {day.dayNumber}
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-[#64748B]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <Badge variant="outline" size="sm">
                            DAY {day.dayNumber.toString().padStart(2, '0')}
                          </Badge>
                          <span className="text-[11px] font-mono text-[#38BDF8] font-medium">
                            {day.phaseName}
                          </span>
                          {isCurrent && (
                            <Badge variant="primary" size="sm">
                              ACTIVE
                            </Badge>
                          )}
                          {day.completed && (
                            <Badge variant="success" size="sm">
                              VERIFIED
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-sm font-semibold text-[#F8FAFC]">
                          {day.theme}
                        </h3>

                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {day.coreConcepts.map((concept, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151B28] text-[#94A3B8] border border-[#1E293B]"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="self-center shrink-0 text-[#64748B]">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right 1 Col: Deep Day Blueprint Drawer */}
        {activeDayObj && (
          <div className="lg:sticky lg:top-20 space-y-4 h-fit">
            <Card variant="default" className="p-5 space-y-4 border-[#38BDF8]/30">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <div>
                  <Badge variant="primary" size="sm">
                    DAY {activeDayObj.dayNumber} SPECIFICATION
                  </Badge>
                  <div className="text-xs font-mono text-[#94A3B8] mt-1.5">
                    {activeDayObj.phaseName}
                  </div>
                </div>
                {activeDayObj.dayNumber === currentDay && (
                  <Badge variant="success" size="sm" dot>
                    Active Today
                  </Badge>
                )}
              </div>

              <h2 className="text-base font-bold text-[#F8FAFC] leading-snug">
                {activeDayObj.theme}
              </h2>

              {/* Blueprint Modules */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
                  <div className="text-[10px] text-[#22C55E] uppercase font-bold tracking-wider">
                    HANDS-ON GOAL
                  </div>
                  <p className="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                    {activeDayObj.handsOnGoal}
                  </p>
                </div>

                <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
                  <div className="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider">
                    DSA PATTERN
                  </div>
                  <p className="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                    {activeDayObj.dsaFocus}
                  </p>
                </div>

                {activeDayObj.systemDesignFocus && (
                  <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
                    <div className="text-[10px] text-[#F59E0B] uppercase font-bold tracking-wider">
                      SYSTEM DESIGN
                    </div>
                    <p className="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                      {activeDayObj.systemDesignFocus}
                    </p>
                  </div>
                )}

                {activeDayObj.englishFocus && (
                  <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
                    <div className="text-[10px] text-[#60A5FA] uppercase font-bold tracking-wider">
                      TECHNICAL ENGLISH
                    </div>
                    <p className="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                      {activeDayObj.englishFocus}
                    </p>
                  </div>
                )}

                {activeDayObj.claudeCodeFocus && (
                  <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
                    <div className="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider">
                      CLAUDE CODE AGENT
                    </div>
                    <p className="text-[#F8FAFC] font-sans text-xs leading-relaxed">
                      {activeDayObj.claudeCodeFocus}
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full font-mono text-xs"
                onClick={() => handleSetCurrentDay(activeDayObj.dayNumber)}
                iconRight={ArrowRight}
              >
                Switch Workspace to Day {activeDayObj.dayNumber}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
