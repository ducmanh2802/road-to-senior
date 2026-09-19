import React from 'react';
import { LucideIcon } from 'lucide-react';

export type BadgeVariant = 
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'cyan'
  | 'pink'
  | 'neutral'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  icon?: LucideIcon | React.ReactNode;
  mono?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  icon: Icon,
  mono = true,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
  };

  const variantClasses: Record<BadgeVariant, { bg: string; dot: string }> = {
    default: {
      bg: 'bg-[#151B28] text-[#94A3B8] border border-[#1E293B]',
      dot: 'bg-[#94A3B8]',
    },
    primary: {
      bg: 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30',
      dot: 'bg-[#38BDF8]',
    },
    success: {
      bg: 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30',
      dot: 'bg-[#22C55E]',
    },
    warning: {
      bg: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30',
      dot: 'bg-[#F59E0B]',
    },
    danger: {
      bg: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30',
      dot: 'bg-[#EF4444]',
    },
    info: {
      bg: 'bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30',
      dot: 'bg-[#60A5FA]',
    },
    purple: {
      bg: 'bg-[#A855F7]/10 text-[#C084FC] border border-[#A855F7]/30',
      dot: 'bg-[#A855F7]',
    },
    cyan: {
      bg: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30',
      dot: 'bg-[#06B6D4]',
    },
    pink: {
      bg: 'bg-[#EC4899]/10 text-[#F472B6] border border-[#EC4899]/30',
      dot: 'bg-[#EC4899]',
    },
    neutral: {
      bg: 'bg-[#0B0E14] text-[#64748B] border border-[#1E293B]',
      dot: 'bg-[#64748B]',
    },
    outline: {
      bg: 'bg-transparent text-[#94A3B8] border border-[#1E293B]',
      dot: 'bg-[#94A3B8]',
    },
  };

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const IconComp = Icon as LucideIcon;
    return <IconComp className="w-3 h-3 shrink-0" />;
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded ${mono ? 'font-mono' : 'font-sans'} ${sizeClasses[size]} ${variantClasses[variant].bg} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${variantClasses[variant].dot} ${pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {renderIcon()}
      <span>{children}</span>
    </span>
  );
};
