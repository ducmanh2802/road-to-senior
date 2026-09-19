import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'sunken' | 'outline' | 'interactive' | 'emphasis' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  as?: React.ElementType;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  as: Component = 'div',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  const variantClasses = {
    default: 'bg-[#111622] border border-[#1E293B]',
    elevated: 'bg-[#151B28] border border-[#1E293B] shadow-lg shadow-black/20',
    sunken: 'bg-[#0B0E14] border border-[#1E293B]',
    outline: 'bg-transparent border border-[#1E293B]',
    interactive: 'bg-[#111622] border border-[#1E293B] hover:border-[#38BDF8]/40 hover:bg-[#151B28] transition-all duration-150 cursor-pointer',
    emphasis: 'bg-[#151B28] border border-[#38BDF8]/30 shadow-md shadow-[#38BDF8]/5',
    glass: 'bg-[#111622]/80 backdrop-blur-xs border border-[#1E293B]',
  };

  const interactiveClass = interactive ? 'hover:border-[#38BDF8]/40 hover:bg-[#151B28] transition-all duration-150 cursor-pointer' : '';

  return (
    <Component
      className={`rounded-md ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  border = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${border ? 'pb-3 mb-3 border-b border-[#1E293B]' : 'mb-3'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`text-sm sm:text-base font-semibold text-[#F8FAFC] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p
      className={`text-xs text-[#94A3B8] leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`pt-3 mt-3 border-t border-[#1E293B] flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Panel alias with default styled header
export const Panel: React.FC<CardProps & { title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode }> = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  ...props
}) => {
  return (
    <Card className={className} {...props}>
      {(title || actions) && (
        <CardHeader border>
          <div>
            {typeof title === 'string' ? <CardTitle>{title}</CardTitle> : title}
            {subtitle && (
              typeof subtitle === 'string' ? <CardDescription>{subtitle}</CardDescription> : subtitle
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      {children}
    </Card>
  );
};
