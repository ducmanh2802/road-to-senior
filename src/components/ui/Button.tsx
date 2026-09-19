import React, { forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: LucideIcon | React.ReactNode;
  iconRight?: LucideIcon | React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus-ring select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 h-7',
    md: 'text-xs px-3.5 py-1.5 gap-2 h-9',
    lg: 'text-sm px-4 py-2 gap-2.5 h-10',
  };

  const variantClasses = {
    primary: 'bg-[#38BDF8] text-[#0B0E14] font-semibold hover:bg-[#0EA5E9] active:bg-[#0284C7] shadow-sm',
    secondary: 'bg-[#151B28] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#1E293B] hover:border-[#334155]',
    ghost: 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60',
    outline: 'bg-transparent text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8]/10 hover:border-[#38BDF8]',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] font-medium shadow-sm',
    success: 'bg-[#22C55E] text-[#0B0E14] font-semibold hover:bg-[#16A34A] shadow-sm',
  };

  const renderIcon = (iconItem: LucideIcon | React.ReactNode) => {
    if (!iconItem) return null;
    if (React.isValidElement(iconItem)) {
      return iconItem;
    }
    const IconComponent = iconItem as LucideIcon;
    return <IconComponent className="w-3.5 h-3.5 shrink-0" />;
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon ? (
        renderIcon(Icon)
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && IconRight && renderIcon(IconRight)}
    </button>
  );
});

Button.displayName = 'Button';
