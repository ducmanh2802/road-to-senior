import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Map, 
  BookOpen, 
  Repeat, 
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
  Settings,
  Terminal,
  Sparkles,
  X,
  LucideIcon
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onSelectView,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentDay, reviewCards, incidents } = useLearning();

  const dueReviewsCount = reviewCards.filter(c => new Date(c.nextReviewAt) <= new Date()).length;
  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  const navSections: NavSection[] = [
    {
      title: 'CORE OS',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'D' },
        { id: 'today', label: 'Today', icon: CalendarDays, shortcut: 'T', badge: `Day ${currentDay}` },
        { id: 'roadmap', label: 'Roadmap', icon: Map, badge: '180d' },
      ]
    },
    {
      title: 'KNOWLEDGE & RECALL',
      items: [
        { id: 'knowledge', label: 'Knowledge', icon: BookOpen, shortcut: 'K' },
        { id: 'review', label: 'Spaced Review', icon: Repeat, shortcut: 'R', badge: dueReviewsCount > 0 ? `${dueReviewsCount}` : undefined, badgeColor: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30' },
      ]
    },
    {
      title: 'DEEP TRACKS',
      items: [
        { id: 'dsa', label: 'DSA Practice', icon: Binary, shortcut: 'A' },
        { id: 'java', label: 'Java 21 & JVM', icon: Coffee, shortcut: 'J' },
        { id: 'spring', label: 'Spring Boot 3', icon: Leaf, shortcut: 'S' },
        { id: 'microservices', label: 'Microservices & Kafka', icon: Layers, shortcut: 'M' },
        { id: 'systemdesign', label: 'System Design', icon: Cpu, shortcut: 'Y' },
      ]
    },
    {
      title: 'SPECIALIZATIONS',
      items: [
        { id: 'claudecode', label: 'Claude Code Agent', icon: Bot, shortcut: 'C' },
        { id: 'english', label: 'Tech English Voice', icon: Languages, shortcut: 'E' },
      ]
    },
    {
      title: 'HANDS-ON LABS',
      items: [
        { id: 'project', label: 'E-Commerce Platform', icon: FolderGit2, shortcut: 'P', badge: '7 Svcs' },
        { id: 'incident', label: 'Incident Lab', icon: Flame, badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} Live` : 'Chaos', badgeColor: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30' },
      ]
    },
    {
      title: 'ASSESSMENT',
      items: [
        { id: 'interview', label: 'Interview Center', icon: Award, shortcut: 'I' },
        { id: 'analytics', label: 'Analytics & Readiness', icon: BarChart3 },
        { id: 'settings', label: 'Settings & Data', icon: Settings },
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    onSelectView(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              SENIOR JAVA <span className="text-[#38BDF8]">180</span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-mono tracking-wider">
              ARCHITECT LEARNING OS
            </div>
          </div>
        </div>

        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded text-[#94A3B8] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Status Pill */}
      <div className="px-3 pt-3">
        <div className="bg-[#0B0E14] border border-[#1E293B] rounded p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[11px] font-mono text-[#94A3B8]">CURRENT RUN</span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-[#38BDF8]">
            DAY {currentDay.toString().padStart(2, '0')} / 180
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-mono tracking-wider text-[#64748B] font-semibold uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 shadow-sm font-semibold'
                      : 'text-[#94A3B8] hover:text-[#E5E7EB] hover:bg-[#1E293B]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#38BDF8]' : 'text-[#64748B]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        item.badgeColor || 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <kbd className="hidden lg:inline-block text-[9px] font-mono text-[#475569] bg-[#0B0E14] px-1 py-0.5 rounded border border-[#1E293B]">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Core Loop indicator */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0B0E14]/70 mt-auto">
        <div className="text-[10px] font-mono text-[#64748B] mb-1.5 flex items-center justify-between">
          <span>ENGINEERING LOOP</span>
          <Sparkles className="w-3 h-3 text-[#38BDF8]" />
        </div>
        <div className="text-[9px] font-mono text-[#94A3B8] leading-tight flex flex-wrap gap-1">
          <span className="text-[#38BDF8]">LEARN</span>
          <span>→</span>
          <span className="text-[#22C55E]">BUILD</span>
          <span>→</span>
          <span className="text-[#EF4444]">BREAK</span>
          <span>→</span>
          <span className="text-[#F59E0B]">DEBUG</span>
          <span>→</span>
          <span className="text-[#38BDF8]">EXPLAIN</span>
          <span>→</span>
          <span className="text-[#A855F7]">INTERVIEW</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#111622] border-r border-[#1E293B] flex-col h-screen shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs" 
            onClick={onCloseMobile} 
          />
          <aside className="relative w-72 bg-[#111622] border-r border-[#1E293B] flex flex-col h-full z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
