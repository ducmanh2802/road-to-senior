import React, { forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  label: string; // for accessible aria-label
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  label,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded transition-all duration-150 focus-ring select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeClasses = {
    sm: 'w-7 h-7 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-9 h-9 p-2',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  const variantClasses = {
    primary: 'bg-[#38BDF8] text-[#0B0E14] hover:bg-[#0EA5E9]',
    secondary: 'bg-[#151B28] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B]',
    ghost: 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60',
    outline: 'bg-transparent text-[#94A3B8] hover:text-[#38BDF8] border border-[#1E293B] hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/5',
    danger: 'text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444]',
  };

  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';
