import React, { useState } from 'react';
import { 
  FolderGit2, 
  Layers, 
  CheckCircle2, 
  Circle, 
  Terminal, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Sparkles,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearning } from '../../context/LearningContext';
import { ProjectFeature } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

export const ProjectView: React.FC = () => {
  const { projectFeatures, toggleProjectStage } = useLearning();

  const [selectedService, setSelectedService] = useState<string>('ALL');

  const services = [
    'ALL',
    'API_GATEWAY',
    'USER_SERVICE',
    'PRODUCT_SERVICE',
    'ORDER_SERVICE',
    'PAYMENT_SERVICE',
    'INVENTORY_SERVICE',
    'NOTIFICATION_SERVICE'
  ];

  const stageKeys: (keyof ProjectFeature['stages'])[] = [
    'requirement',
    'design',
    'implementation',
    'unitTest',
    'integrationTest',
    'loadTest',
    'failureTest',
    'observability',
    'documentation'
  ];

  const stageLabels: Record<keyof ProjectFeature['stages'], string> = {
    requirement: 'Requirements',
    design: 'Design & Schema',
    implementation: 'Implementation',
    unitTest: 'Unit Tests',
    integrationTest: 'Integration Tests',
    loadTest: 'Load Testing',
    failureTest: 'Chaos & Failures',
    observability: 'Metrics & Traces',
    documentation: 'Documentation'
  };

  const filteredFeatures = projectFeatures.filter((f: ProjectFeature) => 
    selectedService === 'ALL' || f.service === selectedService
  );

  const totalStages = projectFeatures.reduce((acc, f) => 
    acc + Object.values(f.stages).length, 0
  );
  const completedStages = projectFeatures.reduce((acc, f) => 
    acc + Object.values(f.stages).filter(Boolean).length, 0
  );
  const completionPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const handleToggleStage = (featureId: string, stageKey: keyof ProjectFeature['stages']) => {
    toggleProjectStage(featureId, stageKey);
    confetti({ particleCount: 25, spread: 50 });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Capstone Project: High-Throughput E-Commerce Platform"
        description="7 real Spring Boot 3 microservices with Kafka partitions, Postgres WAL CDC, Redis cluster distributed locking, and Jaeger OpenTelemetry tracing."
        badge={
          <Badge variant="primary" size="sm" dot>
            Production Microservices Capstone
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3 bg-[#151B28] border border-[#1E293B] rounded-xl p-3 font-mono">
            <div className="text-right">
              <div className="text-[10px] text-[#94A3B8] uppercase">QUALITY GATES VERIFIED</div>
              <div className="text-sm font-bold text-[#22C55E]">
                {completedStages} / {totalStages} Stages ({completionPercentage}%)
              </div>
            </div>
            <div className="w-24">
              <Progress value={completionPercentage} color="emerald" size="sm" />
            </div>
          </div>
        }
      />

      {/* 7-Service Architecture Topology Bar */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {services.map(svc => (
            <button
              key={svc}
              onClick={() => setSelectedService(svc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap border cursor-pointer ${
                selectedService === svc
                  ? 'bg-[#38BDF8] text-[#0B0E14] font-bold border-[#38BDF8] shadow-sm'
                  : 'bg-[#151B28] text-[#94A3B8] hover:text-[#F8FAFC] border-[#1E293B] hover:border-[#334155]'
              }`}
            >
              {svc}
            </button>
          ))}
        </div>
      </Card>

      {/* Microservice Architecture Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeatures.map((f: ProjectFeature) => {
          const featureCompletedStages = Object.values(f.stages).filter(Boolean).length;
          const featureTotalStages = Object.values(f.stages).length;
          const isAllDone = featureCompletedStages === featureTotalStages;

          return (
            <Card
              key={f.id}
              variant={isAllDone ? 'emphasis' : 'default'}
              className={`p-5 space-y-4 transition-all border-[#1E293B] hover:border-[#334155] ${
                isAllDone ? 'border-[#22C55E]/40' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-xs">
                    <Badge variant="outline" size="sm">
                      {f.service}
                    </Badge>
                    <span className="text-[#94A3B8]">
                      Stages: <strong className="text-[#F8FAFC] font-semibold">{featureCompletedStages}/{featureTotalStages}</strong>
                    </span>
                    {isAllDone && (
                      <Badge variant="success" size="sm">
                        ALL GATES PASSED
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#F8FAFC] leading-tight">
                    {f.title}
                  </h3>
                </div>
              </div>

              {/* Quality Gate Stages Checklist */}
              <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-2 font-mono text-xs">
                <div className="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider">
                  VERIFIED STAGES & GATES:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stageKeys.map(stageKey => {
                    const isDone = f.stages[stageKey];
                    return (
                      <button
                        key={stageKey}
                        onClick={() => handleToggleStage(f.id, stageKey)}
                        className={`p-2 rounded flex items-center justify-between text-left text-xs transition-colors border cursor-pointer ${
                          isDone 
                            ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' 
                            : 'bg-[#0B0E14] border-[#1E293B] text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC]'
                        }`}
                      >
                        <span className="truncate">{stageLabels[stageKey]}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#22C55E]" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 shrink-0 text-[#64748B]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {f.notes && (
                <div className="text-xs text-[#94A3B8] font-mono bg-[#0B0E14] p-2.5 rounded border border-[#1E293B]">
                  <strong>Notes:</strong> {f.notes}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
