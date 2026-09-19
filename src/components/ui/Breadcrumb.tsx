import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-xs font-mono text-[#94A3B8] ${className}`}>
      <span className="flex items-center text-[#64748B] hover:text-[#F8FAFC] transition-colors cursor-pointer">
        <Home className="w-3.5 h-3.5" />
      </span>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-[#475569] shrink-0" />
          {item.onClick && !item.active ? (
            <button
              onClick={item.onClick}
              className="hover:text-[#38BDF8] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span className={item.active ? 'text-[#F8FAFC] font-semibold' : 'text-[#94A3B8]'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
