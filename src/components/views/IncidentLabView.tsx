import React, { useState } from 'react';
import { 
  Flame, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  RotateCcw, 
  Bug, 
  ShieldCheck, 
  Search, 
  ChevronRight,
  Sparkles,
  Server,
  Zap,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearning } from '../../context/LearningContext';
import { IncidentScenario } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CodeBlock } from '../ui/CodeBlock';
import { Alert } from '../ui/Alert';

export const IncidentLabView: React.FC = () => {
  const { incidents, investigateIncident, resolveIncident } = useLearning();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || 'inc-1');
  const [selectedHypothesisIndex, setSelectedHypothesisIndex] = useState<number | null>(null);
  const [hypothesisResult, setHypothesisResult] = useState<{ isCorrect: boolean; message: string; explanation?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'fix' | 'postmortem'>('logs');

  const currentIncident = incidents.find((i: IncidentScenario) => i.id === selectedIncidentId) || incidents[0];

  const handleTestHypothesis = (index: number) => {
    setSelectedHypothesisIndex(index);
    const result = investigateIncident(currentIncident.id, index);
    setHypothesisResult(result);

    if (result.isCorrect) {
      resolveIncident(currentIncident.id);
      confetti({ particleCount: 50, spread: 70 });
    }
  };

  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Production Incident Lab & Chaos Triage"
        description="Diagnose high-severity production outages in simulated real-time. Correlate thread dumps, GC spikes, deadlock logs, and Kafka lag to formulate root cause hypotheses."
        badge={
          <Badge variant={activeIncidentsCount > 0 ? 'danger' : 'success'} size="sm" pulse={activeIncidentsCount > 0} dot>
            {activeIncidentsCount > 0 ? `${activeIncidentsCount} Active War Room Outages` : 'All Systems Nominal'}
          </Badge>
        }
        actions={
          <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-xl font-mono text-xs text-right">
            <div className="text-[10px] text-[#94A3B8] uppercase">TRIAGE PROTOCOL:</div>
            <div className="text-sm font-bold text-[#EF4444] mt-0.5">P0 War Room Simulator</div>
          </div>
        }
      />

      {/* Incident Selection Tabs */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {incidents.map((inc: IncidentScenario) => (
            <button
              key={inc.id}
              onClick={() => {
                setSelectedIncidentId(inc.id);
                setSelectedHypothesisIndex(null);
                setHypothesisResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                selectedIncidentId === inc.id
                  ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40 font-bold'
                  : 'bg-[#151B28] text-[#94A3B8] hover:text-[#F8FAFC] border-[#1E293B] hover:border-[#334155]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{inc.title}</span>
              {inc.status === 'RESOLVED' ? (
                <Badge variant="success" size="sm">RESOLVED</Badge>
              ) : (
                <Badge variant="danger" size="sm">{inc.severity.split(' - ')[0]}</Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Incident Workspace */}
      {currentIncident && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Incident Details, Live Telemetry & Hypotheses */}
          <div className="lg:col-span-2 space-y-4">
            {/* Incident Header Card */}
            <Card variant="default" className="p-5 space-y-4 border-[#EF4444]/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs mb-1">
                    <Badge variant="danger" size="sm">
                      {currentIncident.severity}
                    </Badge>
                    <span className="text-[#94A3B8]">
                      Service: <strong className="text-[#F8FAFC]">{currentIncident.serviceAffected}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F8FAFC]">
                    {currentIncident.title}
                  </h2>
                </div>

                <Badge variant={currentIncident.status === 'RESOLVED' ? 'success' : 'danger'} size="md">
                  {currentIncident.status}
                </Badge>
              </div>

              {/* Symptoms */}
              <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1.5 font-mono text-xs">
                <div className="text-[10px] text-[#F59E0B] uppercase font-bold tracking-wider">
                  ACTIVE SYMPTOMS:
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#F8FAFC] font-sans text-xs">
                  {currentIncident.symptoms?.map((symptom: string, idx: number) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Telemetry Tabs */}
            <Card variant="default" className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeTab === 'logs' ? 'bg-[#38BDF8] text-[#0B0E14]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Live Logs & Stack Trace
                </button>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeTab === 'metrics' ? 'bg-[#38BDF8] text-[#0B0E14]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Micrometer & Prometheus Metrics
                </button>
                <button
                  onClick={() => setActiveTab('fix')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeTab === 'fix' ? 'bg-[#38BDF8] text-[#0B0E14]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Remediation & Fix
                </button>
                {currentIncident.postmortem && (
                  <button
                    onClick={() => setActiveTab('postmortem')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      activeTab === 'postmortem' ? 'bg-[#22C55E] text-[#0B0E14]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    Postmortem & Root Cause
                  </button>
                )}
              </div>

              {/* Tab 1: Live Logs */}
              {activeTab === 'logs' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-[#94A3B8] uppercase">KUBERNETES CONTAINER STDOUT:</div>
                  <pre className="p-4 bg-[#0B0E14] border border-[#1E293B] rounded-lg font-mono text-xs text-[#EF4444] overflow-x-auto leading-relaxed max-h-80 overflow-y-auto">
                    {currentIncident.liveLogs?.join('\n')}
                  </pre>
                </div>
              )}

              {/* Tab 2: Metrics Dashboard */}
              {activeTab === 'metrics' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {currentIncident.metrics?.map((metric, idx: number) => (
                    <div key={idx} className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8] text-[10px] uppercase">{metric.name}</span>
                        <Badge 
                          variant={metric.status === 'CRITICAL' ? 'danger' : metric.status === 'WARNING' ? 'warning' : 'success'} 
                          size="sm"
                        >
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-base font-bold text-[#F8FAFC]">{metric.currentValue}</span>
                        <span className="text-[10px] text-[#64748B]">Normal: {metric.normalValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Fix & Remediation */}
              {activeTab === 'fix' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-2">
                    <div className="text-[10px] text-[#38BDF8] uppercase font-bold">HOTFIX SHELL SCRIPT:</div>
                    <pre className="p-3 bg-[#0B0E14] border border-[#1E293B] rounded text-[#22C55E] overflow-x-auto">
                      {currentIncident.fixCommand}
                    </pre>
                  </div>

                  <div className="p-3 bg-[#151B28] border border-[#1E293B] rounded-lg space-y-1.5 font-sans">
                    <div className="text-[10px] font-mono text-[#F59E0B] uppercase font-bold">VERIFICATION CRITERIA:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-[#F8FAFC]">
                      {currentIncident.verificationSteps?.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 4: Postmortem */}
              {activeTab === 'postmortem' && currentIncident.postmortem && (
                <div className="p-4 bg-[#151B28] border border-[#22C55E]/30 rounded-xl space-y-3 font-mono text-xs">
                  <div className="text-xs font-bold text-[#22C55E] uppercase tracking-wider">
                    PRODUCTION POSTMORTEM (INCIDENT RESOLVED)
                  </div>
                  <div className="space-y-2 text-[#F8FAFC]">
                    <div><strong>Root Cause:</strong> {currentIncident.postmortem.rootCause}</div>
                    <div><strong>Impact:</strong> {currentIncident.postmortem.impact}</div>
                    <div><strong>Resolution:</strong> {currentIncident.postmortem.resolution}</div>
                    <div><strong>Prevention:</strong> {currentIncident.postmortem.prevention}</div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right 1 Col: War Room Hypotheses Selection */}
          <div className="space-y-4">
            <Card variant="default" className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-base font-bold text-[#F8FAFC]">Formulate Hypothesis</h3>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Select the root cause hypothesis that explains the logs, thread states, and metric anomalies:
              </p>

              <div className="space-y-2.5">
                {currentIncident.hypothesisOptions?.map((optionText: string, index: number) => {
                  const isSelected = selectedHypothesisIndex === index;
                  const isCorrectOption = index === currentIncident.correctHypothesisIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => handleTestHypothesis(index)}
                      className={`w-full text-left p-3 rounded-lg text-xs transition-all border cursor-pointer ${
                        isSelected
                          ? isCorrectOption
                            ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E] font-bold'
                            : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444] font-bold'
                          : 'bg-[#151B28] border-[#1E293B] text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold text-[#38BDF8] shrink-0">{index + 1}.</span>
                        <span className="leading-snug">{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {hypothesisResult && (
                <Alert
                  variant={hypothesisResult.isCorrect ? 'success' : 'danger'}
                  title={hypothesisResult.isCorrect ? 'Root Cause Verified' : 'Hypothesis Refuted'}
                  description={hypothesisResult.message || hypothesisResult.explanation}
                />
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
