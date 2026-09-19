import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { Badge, BadgeVariant } from './Badge';

export interface TrendConfig {
  value: string | number;
  direction: 'up' | 'down' | 'neutral';
  label?: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  icon?: LucideIcon | React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral' | TrendConfig;
  badge?: {
    text: string;
    variant?: BadgeVariant;
  };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  change,
  icon: Icon,
  iconColor = 'text-[#38BDF8]',
  iconBg = 'bg-[#38BDF8]/10 border-[#38BDF8]/20',
  trend,
  badge,
  className = '',
  onClick,
}) => {
  const displaySub = change || subValue;

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return (
        <div className="w-6 h-6 rounded flex items-center justify-center bg-[#151B28] border border-[#1E293B] shrink-0">
          {Icon}
        </div>
      );
    }
    const IconComp = Icon as LucideIcon;
    return (
      <div className={`w-6 h-6 rounded flex items-center justify-center border ${iconBg} ${iconColor} shrink-0`}>
        <IconComp className="w-3.5 h-3.5" />
      </div>
    );
  };

  const trendObj: TrendConfig | null = typeof trend === 'string' 
    ? { value: displaySub || '', direction: trend }
    : trend || null;

  return (
    <Card 
      variant={onClick ? 'interactive' : 'default'}
      padding="sm" 
      className={`flex flex-col justify-between ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono tracking-wide text-[#94A3B8] uppercase">
          {label}
        </span>
        {renderIcon()}
        {badge && (
          <Badge variant={badge.variant || 'default'} size="sm">
            {badge.text}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#F8FAFC] tracking-tight">
            {value}
          </span>
          {displaySub && !trendObj && (
            <span className="text-xs font-mono text-[#64748B]">
              {displaySub}
            </span>
          )}
        </div>

        {trendObj && (
          <div className={`flex items-center gap-1 text-[11px] font-mono font-medium ${
            trendObj.direction === 'up' ? 'text-[#22C55E]' : trendObj.direction === 'down' ? 'text-[#EF4444]' : 'text-[#94A3B8]'
          }`}>
            {trendObj.direction === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : trendObj.direction === 'down' ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            <span>{trendObj.value}</span>
            {trendObj.label && <span className="text-[#64748B] text-[10px]">{trendObj.label}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export const Metric: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  mono?: boolean;
  className?: string;
}> = ({ label, value, unit, mono = true, className = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider mb-0.5">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={`text-base font-semibold text-[#F8FAFC] ${mono ? 'font-mono' : 'font-sans'}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-[#94A3B8]">{unit}</span>}
      </div>
    </div>
  );
};
