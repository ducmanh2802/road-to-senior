import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gradient';
  color?: 'emerald' | 'sky' | 'amber' | 'rose' | 'purple' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'primary',
  color,
  size = 'md',
  showLabel = false,
  label,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses: Record<string, string> = {
    primary: 'bg-[#38BDF8]',
    sky: 'bg-[#38BDF8]',
    success: 'bg-[#22C55E]',
    emerald: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    amber: 'bg-[#F59E0B]',
    danger: 'bg-[#EF4444]',
    rose: 'bg-[#EF4444]',
    purple: 'bg-[#C084FC]',
    gradient: 'bg-gradient-to-r from-[#38BDF8] to-[#22C55E]',
  };

  const activeColor = color ? variantClasses[color] || variantClasses.primary : variantClasses[variant];

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-mono">
          {label && <span className="text-[#94A3B8]">{label}</span>}
          {showLabel && <span className="text-[#F8FAFC] font-semibold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#0B0E14] border border-[#1E293B] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${activeColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  children?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 64,
  strokeWidth = 6,
  variant = 'primary',
  children,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantStroke = {
    primary: '#38BDF8',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variantStroke[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center font-mono">
          {children}
        </div>
      )}
    </div>
  );
};
