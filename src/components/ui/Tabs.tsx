import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from './Badge';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  size?: 'sm' | 'md';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-2.5 gap-1.5',
    md: 'text-xs sm:text-sm py-2 px-3.5 gap-2',
  };

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 bg-[#0B0E14] border border-[#1E293B] rounded-md gap-1 ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center font-medium rounded transition-all duration-150 select-none cursor-pointer focus-ring ${sizeClasses[size]} ${
                isActive
                  ? 'bg-[#1E293B] text-[#F8FAFC] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151B28]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <Badge 
                  variant={tab.badgeVariant || (isActive ? 'primary' : 'default')} 
                  size="sm"
                >
                  {tab.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center font-medium rounded-md border transition-all duration-150 select-none cursor-pointer focus-ring ${sizeClasses[size]} ${
                isActive
                  ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/40'
                  : 'bg-[#111622] text-[#94A3B8] border-[#1E293B] hover:text-[#F8FAFC] hover:border-[#334155]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <Badge 
                  variant={tab.badgeVariant || (isActive ? 'primary' : 'default')} 
                  size="sm"
                >
                  {tab.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: underline
  return (
    <div className={`flex items-center border-b border-[#1E293B] gap-2 overflow-x-auto custom-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center font-medium border-b-2 -mb-[1px] transition-all duration-150 select-none cursor-pointer whitespace-nowrap focus-ring ${sizeClasses[size]} ${
              isActive
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <Badge 
                variant={tab.badgeVariant || (isActive ? 'primary' : 'default')} 
                size="sm"
              >
                {tab.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
};
