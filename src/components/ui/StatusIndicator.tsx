import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock, 
  PlayCircle, 
  Lock, 
  Flame,
  MinusCircle
} from 'lucide-react';
import { Badge } from './Badge';

export type SemanticStatus = 
  | 'SUCCESS'
  | 'WARNING'
  | 'DANGER'
  | 'INFO'
  | 'NEUTRAL'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'LOCKED'
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'TODO'
  | 'OVERDUE'
  | 'MASTERED'
  | 'UNDERSTOOD'
  | 'PRACTICING'
  | 'LEARNING'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'UNRESOLVED';

export interface StatusIndicatorProps {
  status: SemanticStatus | string;
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  showDot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  showIcon = false,
  showDot = true,
  pulse,
  className = '',
}) => {
  const normStatus = (status || 'NEUTRAL').toUpperCase();

  const getStatusConfig = () => {
    switch (normStatus) {
      case 'SUCCESS':
      case 'COMPLETED':
      case 'RESOLVED':
      case 'MASTERED':
        return {
          variant: 'success' as const,
          icon: CheckCircle2,
          defaultLabel: 'Completed',
          pulse: false,
        };
      case 'WARNING':
      case 'PRACTICING':
      case 'INVESTIGATING':
        return {
          variant: 'warning' as const,
          icon: AlertTriangle,
          defaultLabel: 'Investigating',
          pulse: true,
        };
      case 'DANGER':
      case 'OVERDUE':
      case 'UNRESOLVED':
        return {
          variant: 'danger' as const,
          icon: Flame,
          defaultLabel: 'Critical / Overdue',
          pulse: true,
        };
      case 'ACTIVE':
      case 'IN_PROGRESS':
      case 'UNDERSTOOD':
        return {
          variant: 'primary' as const,
          icon: PlayCircle,
          defaultLabel: 'In Progress',
          pulse: true,
        };
      case 'TODO':
      case 'LEARNING':
        return {
          variant: 'info' as const,
          icon: Clock,
          defaultLabel: 'Todo',
          pulse: false,
        };
      case 'LOCKED':
        return {
          variant: 'neutral' as const,
          icon: Lock,
          defaultLabel: 'Locked',
          pulse: false,
        };
      case 'INACTIVE':
      case 'SKIPPED':
      default:
        return {
          variant: 'default' as const,
          icon: MinusCircle,
          defaultLabel: normStatus,
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={showDot && !showIcon}
      pulse={pulse !== undefined ? pulse : config.pulse}
      icon={showIcon ? config.icon : undefined}
      className={className}
    >
      {displayLabel}
    </Badge>
  );
};
