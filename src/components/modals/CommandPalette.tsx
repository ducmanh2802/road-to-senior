import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  Map, 
  BookOpen, 
  Binary, 
  Coffee, 
  Leaf, 
  Layers, 
  Cpu, 
  Bot, 
  Languages, 
  FolderGit2, 
  Flame, 
  Award, 
  BarChart3,
  Repeat
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { knowledgeTopics, dsaProblems, setCurrentDay, roadmapDays } = useLearning();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const baseCommands = [
    { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: BarChart3, view: 'dashboard' },
    { id: 'today', label: 'Go to Today Mission Control', category: 'Navigation', icon: Map, view: 'today' },
    { id: 'review', label: 'Start Spaced Review (Active Recall)', category: 'Study', icon: Repeat, view: 'review' },
    { id: 'knowledge', label: 'Open Knowledge System & Dimensions', category: 'Knowledge', icon: BookOpen, view: 'knowledge' },
    { id: 'dsa', label: 'DSA Pattern Practice Tracker', category: 'Coding', icon: Binary, view: 'dsa' },
    { id: 'java', label: 'Core Java & Concurrency Module', category: 'Track', icon: Coffee, view: 'java' },
    { id: 'spring', label: 'Spring Boot 3 Deep Dive', category: 'Track', icon: Leaf, view: 'spring' },
    { id: 'microservices', label: 'Microservices, Kafka & Outbox', category: 'Track', icon: Layers, view: 'microservices' },
    { id: 'systemdesign', label: 'System Design Architecture Lab', category: 'Track', icon: Cpu, view: 'systemdesign' },
    { id: 'claudecode', label: 'Claude Code Agent Masterclass', category: 'Track', icon: Bot, view: 'claudecode' },
    { id: 'english', label: 'Technical English Voice Practice', category: 'Track', icon: Languages, view: 'english' },
    { id: 'project', label: 'E-Commerce Platform Services', category: 'Hands-on', icon: FolderGit2, view: 'project' },
    { id: 'incident', label: 'Incident Lab (Break The System)', category: 'Hands-on', icon: Flame, view: 'incident' },
    { id: 'interview', label: 'Senior Interview Mock Simulator', category: 'Assessment', icon: Award, view: 'interview' },
    { id: 'analytics', label: 'Readiness Radar & Analytics', category: 'Assessment', icon: BarChart3, view: 'analytics' },
  ];

  const filteredCommands = baseCommands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTopics = knowledgeTopics.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredDSA = dsaProblems.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.pattern.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  // Check if query is a day number e.g. "day 45" or "37"
  const dayMatch = query.match(/(?:day\s*)?(\d+)/i);
  const matchedDay = dayMatch ? parseInt(dayMatch[1], 10) : null;
  const isValidDay = matchedDay !== null && matchedDay >= 1 && matchedDay <= 180;

  const handleSelect = (view: string) => {
    onNavigate(view);
    onClose();
  };

  const handleJumpDay = (day: number) => {
    setCurrentDay(day);
    onNavigate('today');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#111622] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Search Input */}
        <div className="p-3 bg-[#0B0E14] border-b border-[#1E293B] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#38BDF8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, topic, pattern, or day (e.g. 'Kafka', 'Day 37', 'Sliding Window')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-hidden text-sm text-[#E5E7EB] placeholder-[#64748B] font-mono"
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <button
            onClick={onClose}
            aria-label="Close command palette"
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B] focus-ring"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3 font-mono text-xs">
          {isValidDay && (
            <div>
              <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
                JUMP TO DAY
              </div>
              <button
                onClick={() => handleJumpDay(matchedDay!)}
                className="w-full flex items-center justify-between p-2 rounded bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 text-[#38BDF8] text-left"
              >
                <span>Switch active workspace to Day {matchedDay} / 180</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {filteredCommands.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
                SYSTEM COMMANDS & VIEWS
              </div>
              <div className="space-y-0.5">
                {filteredCommands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.view)}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-white text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#38BDF8]" />
                        <span className="text-white font-medium">{cmd.label}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] px-1.5 py-0.5 rounded bg-[#0B0E14] border border-[#1E293B]">
                        {cmd.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredTopics.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
                KNOWLEDGE TOPICS
              </div>
              <div className="space-y-0.5">
                {filteredTopics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleSelect('knowledge')}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-[#1E293B] text-left transition-colors"
                  >
                    <div>
                      <div className="text-white font-medium">{topic.title}</div>
                      <div className="text-[10px] text-[#94A3B8]">{topic.category} · {topic.difficulty}</div>
                    </div>
                    <span className="text-[10px] text-[#22C55E] font-semibold">{topic.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredDSA.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
                DSA PROBLEMS
              </div>
              <div className="space-y-0.5">
                {filteredDSA.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect('dsa')}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-[#1E293B] text-left transition-colors"
                  >
                    <div>
                      <div className="text-white font-medium">{p.title}</div>
                      <div className="text-[10px] text-[#94A3B8]">{p.pattern} · {p.difficulty}</div>
                    </div>
                    <span className="text-[10px] text-[#38BDF8]">Java O({p.timeComplexity})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
