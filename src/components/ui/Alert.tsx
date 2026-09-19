import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X,
  LucideIcon 
} from 'lucide-react';
import { IconButton } from './IconButton';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  title?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  variant?: AlertVariant;
  icon?: LucideIcon | React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  children,
  variant = 'info',
  icon: CustomIcon,
  onClose,
  className = '',
}) => {
  const content = children || description;
  const variantConfig = {
    info: {
      bg: 'bg-[#60A5FA]/10 border-[#60A5FA]/30 text-[#93C5FD]',
      icon: Info,
      iconColor: 'text-[#60A5FA]',
    },
    success: {
      bg: 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#86EFAC]',
      icon: CheckCircle2,
      iconColor: 'text-[#22C55E]',
    },
    warning: {
      bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#FDE68A]',
      icon: AlertTriangle,
      iconColor: 'text-[#F59E0B]',
    },
    danger: {
      bg: 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#FCA5A5]',
      icon: AlertCircle,
      iconColor: 'text-[#EF4444]',
    },
  };

  const config = variantConfig[variant];

  const renderIcon = () => {
    if (CustomIcon) {
      if (React.isValidElement(CustomIcon)) return CustomIcon;
      const CustomIconComp = CustomIcon as LucideIcon;
      return <CustomIconComp className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />;
    }
    const DefaultIcon = config.icon;
    return <DefaultIcon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />;
  };

  return (
    <div
      role="alert"
      className={`border rounded-md p-3.5 flex items-start gap-3 text-xs ${config.bg} ${className}`}
    >
      {renderIcon()}
      <div className="flex-1 space-y-0.5">
        {title && <h4 className="font-semibold text-white tracking-tight">{title}</h4>}
        {content && <div className="leading-relaxed opacity-90">{content}</div>}
      </div>
      {onClose && (
        <IconButton
          icon={X}
          size="sm"
          variant="ghost"
          label="Dismiss alert"
          onClick={onClose}
          className="shrink-0 -mr-1.5 -mt-1.5 opacity-70 hover:opacity-100"
        />
      )}
    </div>
  );
};
