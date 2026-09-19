import React from 'react';
import { LucideIcon, Inbox, AlertOctagon } from 'lucide-react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateActionConfig {
  label: string;
  onClick: () => void;
  icon?: LucideIcon | React.ReactNode;
  variant?: ButtonProps['variant'];
}

export interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateActionConfig | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  children,
  className = '',
}) => {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const IconComp = Icon as LucideIcon;
    return <IconComp className="w-6 h-6" />;
  };

  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) return action;
    const act = action as EmptyStateActionConfig;
    return (
      <Button
        size="sm"
        variant={act.variant || 'primary'}
        icon={act.icon}
        onClick={act.onClick}
      >
        {act.label}
      </Button>
    );
  };

  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center border border-dashed border-[#1E293B] rounded-lg bg-[#0B0E14]/40 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#151B28] border border-[#1E293B] flex items-center justify-center text-[#64748B] mb-3">
        {renderIcon()}
      </div>
      <h4 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">{title}</h4>
      {description && (
        <p className="text-xs text-[#94A3B8] max-w-sm mt-1 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {renderAction()}
      {children}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 text-center flex flex-col items-center justify-center border border-[#EF4444]/30 rounded-lg bg-[#EF4444]/5 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mb-2.5">
        <AlertOctagon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
      <p className="text-xs text-[#FCA5A5] max-w-sm mt-1 mb-3 font-mono leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button size="sm" variant="danger" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
