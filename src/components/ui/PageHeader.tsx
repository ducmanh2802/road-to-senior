import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  badge,
  breadcrumbs,
  actions,
  className = '',
}) => {
  const displaySubtitle = description || subtitle;
  return (
    <div className={`mb-6 space-y-2 ${className}`}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-2" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {typeof title === 'string' ? (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
                {title}
              </h1>
            ) : (
              title
            )}
            {badge}
          </div>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
              {displaySubtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
