import React from 'react';
import { 
  CalendarDays, 
  BookOpen, 
  Repeat, 
  FolderGit2, 
  BarChart3 
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';

interface MobileNavProps {
  currentView: string;
  onSelectView: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onSelectView }) => {
  const { reviewCards } = useLearning();
  const dueReviewsCount = reviewCards.filter(c => new Date(c.nextReviewAt) <= new Date()).length;

  const items = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'knowledge', label: 'Learn', icon: BookOpen },
    { 
      id: 'review', 
      label: 'Review', 
      icon: Repeat, 
      badge: dueReviewsCount > 0 ? `${dueReviewsCount}` : undefined 
    },
    { id: 'project', label: 'Project', icon: FolderGit2 },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#111622] border-t border-[#1E293B] flex items-center justify-around z-30 px-2">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`flex flex-col items-center justify-center w-14 py-1 relative ${
              isActive ? 'text-[#38BDF8]' : 'text-[#94A3B8]'
            }`}
          >
            <div className="relative">
              <Icon className="w-4 h-4" />
              {item.badge && (
                <span className="absolute -top-1 -right-2 bg-[#F59E0B] text-black font-mono font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
