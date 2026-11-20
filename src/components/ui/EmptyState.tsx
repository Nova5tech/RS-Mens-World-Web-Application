import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center bg-white rounded-card border border-dashed border-border-card/80',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-primary-brand mb-3 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-app-text">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-app-muted max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
