import React, { useState, useEffect } from 'react';
import { LearningProvider, useLearning } from './context/LearningContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { CommandPalette } from './components/modals/CommandPalette';

// import { TodayView } from './components/views/TodayView'; // migrated to Vue
// import { RoadmapView } from './components/views/RoadmapView'; // migrated to Vue
import { KnowledgeView } from './components/views/KnowledgeView';
// import { ReviewView } from './components/views/ReviewView'; // migrated to Vue
import { DsaView } from './components/views/DsaView';
import { JavaView } from './components/views/JavaView';
import { SpringView } from './components/views/SpringView';
import { MicroservicesView } from './components/views/MicroservicesView';
import { SystemDesignView } from './components/views/SystemDesignView';
import { ClaudeCodeView } from './components/views/ClaudeCodeView';
import { EnglishView } from './components/views/EnglishView';
import { ProjectView } from './components/views/ProjectView';
import { IncidentLabView } from './components/views/IncidentLabView';
import { InterviewView } from './components/views/InterviewView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.isContentEditable
      ) {
        return;
      }

      // Command / Ctrl + K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // Single Key shortcuts
      switch (e.key.toLowerCase()) {
        case 'd':
          setCurrentView('dashboard');
          break;
        case 't':
          setCurrentView('today');
          break;
        case 'r':
          setCurrentView('review');
          break;
        case 'k':
          setCurrentView('knowledge');
          break;
        case 'a':
          setCurrentView('dsa');
          break;
        case 'j':
          setCurrentView('java');
          break;
        case 's':
          setCurrentView('spring');
          break;
        case 'm':
          setCurrentView('microservices');
          break;
        case 'y':
          setCurrentView('systemdesign');
          break;
        case 'c':
          setCurrentView('claudecode');
          break;
        case 'e':
          setCurrentView('english');
          break;
        case 'p':
          setCurrentView('project');
          break;
        case 'i':
          setCurrentView('interview');
          break;
        case '?':
          setIsShortcutsOpen(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="p-8 text-center text-sm text-[#94A3B8] border border-dashed border-[#1E293B] rounded-lg">
            Dashboard slice retired — migrated to Vue at / (Command Center)
          </div>
        );
      case 'today':
        return (
          <div className="p-8 text-center text-sm text-[#94A3B8] border border-dashed border-[#1E293B] rounded-lg">
            Today View slice retired — migrated to Vue at /today
          </div>
        );
      case 'roadmap':
        return (
          <div className="p-8 text-center text-sm text-[#94A3B8] border border-dashed border-[#1E293B] rounded-lg">
            Roadmap slice retired — migrated to Vue at /learning/roadmap
          </div>
        );
      case 'knowledge':
        return <KnowledgeView />;
      case 'review':
        return (
          <div className="p-8 text-center text-sm text-[#94A3B8] border border-dashed border-[#1E293B] rounded-lg">
            Review View slice retired — migrated to Vue at /review
          </div>
        );
      case 'dsa':
        return <DsaView />;
      case 'java':
        return <JavaView />;
      case 'spring':
        return <SpringView />;
      case 'microservices':
        return <MicroservicesView />;
      case 'systemdesign':
        return <SystemDesignView />;
      case 'claudecode':
        return <ClaudeCodeView />;
      case 'english':
        return <EnglishView />;
      case 'project':
        return <ProjectView />;
      case 'incident':
        return <IncidentLabView />;
      case 'interview':
        return <InterviewView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="p-8 text-center text-sm text-[#94A3B8] border border-dashed border-[#1E293B] rounded-lg">
            Dashboard slice retired — migrated to Vue at / (Command Center)
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0E14] text-[#E5E7EB] font-sans antialiased">
      {/* Navigation Sidebar (Desktop + Tablet) */}
      <Sidebar 
        currentView={currentView} 
        onSelectView={setCurrentView} 
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header 
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onNavigate={setCurrentView}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8 custom-scrollbar">
          {renderView()}
        </main>

        <MobileNav 
          currentView={currentView} 
          onSelectView={setCurrentView} 
        />
      </div>

      {/* Modals */}
      <ShortcutsModal 
        isOpen={isShortcutsOpen} 
        onClose={() => setIsShortcutsOpen(false)} 
      />

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
      />
    </div>
  );
};

export function App() {
  return (
    <LearningProvider>
      <MainAppContent />
    </LearningProvider>
  );
}

export default App;
