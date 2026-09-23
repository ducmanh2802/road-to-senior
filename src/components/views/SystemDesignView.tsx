import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Layers,
  Database,
  ShieldAlert,
  Activity,
  Award,
  ChevronRight,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { SystemDesignProblem } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CodeBlock } from '../ui/CodeBlock';

export const SystemDesignView: React.FC = () => {
  const { systemDesignProblems } = useLearning();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(systemDesignProblems[0]?.id || 'sd-1');
  const [activeSection, setActiveSection] = useState<string>('requirements');

  // 45-Minute Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const currentScenario = systemDesignProblems.find((s: SystemDesignProblem) => s.id === selectedScenarioId) || systemDesignProblems[0];

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sections = [
    { id: 'requirements', label: '1. Functional & Non-Functional' },
    { id: 'capacity', label: '2. Capacity & Scale Math' },
    { id: 'api', label: '3. Core API Signatures' },
    { id: 'datamodel', label: '4. Data Model & Partition Key' },
    { id: 'architecture', label: '5. High-Level Architecture' },
    { id: 'scaling', label: '6. Scaling & Partitioning' },
    { id: 'failure', label: '7. Failure Modes & SPOF' },
    { id: 'tradeoffs', label: '8. Trade-Off Analysis' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="System Design & Scale Masterclass"
        description="Practice 45-minute architectural whiteboard simulations covering scale estimations, partition keys, CAP theorem, and consistency trade-offs."
        badge={
          <Badge variant="pink" size="sm" dot>
            {systemDesignProblems.length} Real-World Architect Scenarios
          </Badge>
        }
        actions={
          /* 45-Min Timer Widget */
          <div className="flex items-center gap-3 bg-[#151B28] border border-[#1E293B] rounded-xl p-2.5 font-mono">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#94A3B8] uppercase font-bold">45-MIN SIMULATION</span>
              <span className={`text-xl font-bold ${timerSeconds < 300 ? 'text-[#EF4444] animate-pulse' : 'text-[#F8FAFC]'}`}>
                {formatTimer(timerSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-[#1E293B]">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  isTimerRunning ? 'bg-[#F59E0B] text-[#0B0E14]' : 'bg-[#22C55E] text-[#0B0E14]'
                }`}
                aria-label={isTimerRunning ? 'Pause simulation timer' : 'Start simulation timer'}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(45 * 60);
                }}
                className="p-1.5 rounded-lg bg-[#0B0E14] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Scenario Selector Bar */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {systemDesignProblems.map((s: SystemDesignProblem) => (
            <button
              key={s.id}
              onClick={() => setSelectedScenarioId(s.id)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-mono border cursor-pointer ${
                selectedScenarioId === s.id
                  ? 'bg-[#EC4899]/15 text-[#F472B6] border-[#EC4899]/40 font-bold'
                  : 'bg-[#151B28] text-[#94A3B8] border-[#1E293B] hover:border-[#334155] hover:text-[#F8FAFC]'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Architecture Workspace */}
      {currentScenario && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left 1 Col: Standard 8 Sections Navigation */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="text-[10px] text-[#64748B] uppercase font-bold px-2 mb-1">
              ARCHITECTURAL BLUEPRINT SECTIONS
            </div>
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center justify-between border cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-[#EC4899]/15 text-[#F472B6] font-bold border-[#EC4899]/40'
                    : 'bg-[#151B28] text-[#94A3B8] hover:text-[#F8FAFC] border-[#1E293B] hover:border-[#334155]'
                }`}
              >
                <span className="truncate">{sec.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>
            ))}
          </div>

          {/* Right 3 Cols: Active Section Screen */}
          <div className="lg:col-span-3 space-y-4">
            <Card variant="default" className="p-6 space-y-5">
              <div>
                <Badge variant="pink" size="sm" className="mb-2">
                  DIFFICULTY: {currentScenario.difficulty}
                </Badge>
                <h2 className="text-xl font-bold text-[#F8FAFC] mt-1">{currentScenario.title}</h2>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{currentScenario.description}</p>
              </div>

              {/* 1. Requirements */}
              {activeSection === 'requirements' && (
                <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                  <div className="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
                    <div className="text-xs font-mono text-[#22C55E] font-bold uppercase tracking-wider">
                      FUNCTIONAL REQUIREMENTS (P0)
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-[#F8FAFC] font-sans leading-relaxed">
                      {currentScenario.requirements?.functional?.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
                    <div className="text-xs font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                      NON-FUNCTIONAL REQUIREMENTS (SLOs)
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-[#F8FAFC] font-sans leading-relaxed">
                      {currentScenario.requirements?.nonFunctional?.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 2. Capacity & Scale Math */}
              {activeSection === 'capacity' && (
                <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                  <div className="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-3 font-mono text-xs">
                    <div className="text-xs text-[#F59E0B] font-bold uppercase tracking-wider">
                      BACK-OF-THE-ENVELOPE SCALE CALCULATIONS
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-lg">
                        <span className="text-[#94A3B8]">Daily Active Users (DAU):</span>
                        <div className="text-sm font-bold text-[#F8FAFC] mt-0.5">{currentScenario.capacityEstimation?.dau}</div>
                      </div>
                      <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-lg">
                        <span className="text-[#94A3B8]">Queries Per Second (QPS):</span>
                        <div className="text-sm font-bold text-[#38BDF8] mt-0.5">{currentScenario.capacityEstimation?.qps}</div>
                      </div>
                      <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-lg">
                        <span className="text-[#94A3B8]">Storage Growth / Day:</span>
                        <div className="text-sm font-bold text-[#F8FAFC] mt-0.5">{currentScenario.capacityEstimation?.storagePerDay}</div>
                      </div>
                      <div className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded-lg">
                        <span className="text-[#94A3B8]">Network Bandwidth:</span>
                        <div className="text-sm font-bold text-[#22C55E] mt-0.5">{currentScenario.capacityEstimation?.networkBandwidth}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Core API Signatures */}
              {activeSection === 'api' && (
                <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                  <div className="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
                    <div className="text-xs font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                      IDEMPOTENT REST & GRPC API CONTRACTS
                    </div>
                    <ul className="space-y-2 font-mono text-xs text-[#38BDF8]">
                      {currentScenario.apiDesign?.map((api: string, idx: number) => (
                        <li key={idx} className="p-2.5 bg-[#0B0E14] border border-[#1E293B] rounded-lg">
                          {api}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 4. Data Model */}
              {activeSection === 'datamodel' && (
                <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                  <div className="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
                    <div className="text-xs font-mono text-[#C084FC] font-bold uppercase tracking-wider">
                      DATA SCHEMA & PARTITION KEY STRATEGY
                    </div>
                    <ul className="space-y-2 font-mono text-xs text-[#F8FAFC]">
                      {currentScenario.dataModel?.map((item: string, idx: number) => (
                        <li key={idx} className="p-2.5 bg-[#0B0E14] border border-[#1E293B] rounded-lg">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 5. High-Level Architecture */}
              {activeSection === 'architecture' && (
                <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                  <div className="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2 font-mono text-xs">
                    <div className="text-xs text-[#22C55E] font-bold uppercase tracking-wider">
                      END-TO-END ARCHITECTURAL TOPOLOGY (ASCII)
                    </div>
                    <pre className="p-4 bg-[#0B0E14] border border-[#1E293B] rounded-lg text-[#F8FAFC] overflow-x-auto leading-relaxed">
                      {currentScenario.architectureDiagramAscii}
                    </pre>
                  </div>
                </div>
              )}

              {/* 6. Scaling & Partitioning */}
              {activeSection === 'scaling' && (
                <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                  <div className="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
                    <div className="text-xs font-mono text-[#F472B6] font-bold uppercase tracking-wider">
                      SCALING & PARTITIONING TECHNIQUES
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-xs text-[#F8FAFC] font-sans leading-relaxed">
                      {currentScenario.scalingTechniques?.map((tech: string, idx: number) => (
                        <li key={idx}>{tech}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 7. Failure Modes & SPOF */}
              {activeSection === 'failure' && (
                <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                  <div className="p-4 bg-[#151B28] border border-[#EF4444]/30 rounded-xl space-y-2">
                    <div className="text-xs font-mono text-[#EF4444] font-bold uppercase tracking-wider">
                      FAILURE MODES & SPOF RESILIENCY
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-xs text-[#F8FAFC] font-sans leading-relaxed">
                      {currentScenario.failureModes?.map((mode: string, idx: number) => (
                        <li key={idx}>{mode}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 8. Trade-Off Analysis */}
              {activeSection === 'tradeoffs' && (
                <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                  <div className="p-4 bg-[#151B28] border border-[#1E293B] rounded-xl space-y-2">
                    <div className="text-xs font-mono text-[#F59E0B] font-bold uppercase tracking-wider">
                      ARCHITECTURAL TRADE-OFFS & JUSTIFICATIONS
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-xs text-[#F8FAFC] font-sans leading-relaxed">
                      {currentScenario.tradeoffs?.map((tradeoff: string, idx: number) => (
                        <li key={idx}>{tradeoff}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
