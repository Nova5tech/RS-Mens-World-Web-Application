import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsWithCountsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const TabsWithCounts: React.FC<TabsWithCountsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer select-none',
              isActive
                ? 'bg-primary-brand text-white shadow-sm ring-1 ring-primary-brand'
                : 'bg-white text-app-muted border border-border-card hover:text-app-text hover:border-slate-300'
            )}
          >
            {tab.icon && (
              <span className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-app-muted')}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[11px] font-medium px-1.5 py-0.2 rounded-full',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                ({tab.count.toLocaleString()})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
