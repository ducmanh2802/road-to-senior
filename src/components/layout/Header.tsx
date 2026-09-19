import React from 'react';
import { 
  Flame, 
  Clock, 
  Play, 
  Pause, 
  Search, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Zap,
  Menu
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onToggleMobileNav: () => void;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenCommandPalette, 
  onOpenShortcuts, 
  onToggleMobileNav,
  onNavigate
}) => {
  const { 
    currentDay, 
    streak, 
    studyTimeMinutes, 
    isTimerRunning, 
    toggleTimer, 
    getNextBestAction 
  } = useLearning();

  const progressPercent = Math.round((currentDay / 180) * 100);
  const nextAction = getNextBestAction();

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <header className="h-14 bg-[#111622] border-b border-[#1E293B] px-4 flex items-center justify-between gap-3 shrink-0 select-none z-20">
      {/* Left: Mobile Menu & Day Tracker */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-1.5 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xs text-[#94A3B8] font-medium hidden sm:inline">DAY</span>
            <span className="text-base font-bold text-white tracking-tight">
              {currentDay.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-[#64748B]">/ 180</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1E293B]">
            <div className="w-20 bg-[#0B0E14] h-2 rounded-full overflow-hidden border border-[#1E293B]">
              <div 
                className="h-full bg-gradient-to-r from-[#38BDF8] to-[#22C55E] transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-medium text-[#38BDF8]">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Center: Next Best Action Banner */}
      <div className="hidden lg:flex items-center flex-1 max-w-xl mx-2">
        <button
          onClick={() => onNavigate(nextAction.targetView)}
          className="w-full group bg-[#0B0E14] hover:bg-[#0B0E14]/90 border border-[#1E293B] hover:border-[#38BDF8]/40 rounded px-3 py-1.5 flex items-center justify-between text-left transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-5 h-5 rounded bg-[#38BDF8]/10 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 text-[#38BDF8]" />
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] uppercase">
              NEXT ACTION
            </span>
            <span className="text-xs text-[#E5E7EB] font-medium truncate">
              {nextAction.title}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-[#38BDF8] group-hover:translate-x-0.5 transition-transform shrink-0 pl-2">
            <span>{nextAction.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Right: Streak, Study Time, Command Palette, Shortcuts */}
      <div className="flex items-center gap-2">
        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0E14] border border-[#1E293B] font-mono text-xs">
          <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="font-semibold text-[#E5E7EB]">{streak}</span>
          <span className="text-[10px] text-[#94A3B8] hidden sm:inline">DAYS</span>
        </div>

        {/* Study Timer */}
        <div className="flex items-center gap-1 bg-[#0B0E14] border border-[#1E293B] rounded px-2.5 py-1">
          <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-[#22C55E] animate-pulse' : 'text-[#64748B]'}`} />
          <span className="text-xs font-mono text-[#E5E7EB] font-medium">
            {formatTime(studyTimeMinutes)}
          </span>
          <button
            onClick={toggleTimer}
            className={`p-0.5 rounded transition-colors ${
              isTimerRunning 
                ? 'text-[#F59E0B] hover:text-[#EF4444]' 
                : 'text-[#22C55E] hover:text-[#22C55E]/80'
            }`}
            title={isTimerRunning ? 'Pause Study Session' : 'Start Focus Timer'}
          >
            {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>

        {/* Search / Command Palette */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0B0E14] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-white transition-colors"
          title="Search Topics & Commands (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <kbd className="hidden xl:inline text-[9px] font-mono text-[#64748B]">⌘K</kbd>
        </button>

        {/* Shortcuts Help */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded bg-[#0B0E14] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-white transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
