import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  icon?: React.ReactNode;
  onChange: (value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  icon,
  onChange,
}) => {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 h-9 px-3 bg-white border border-border-card rounded-lg text-xs font-medium text-app-text hover:bg-slate-50 transition-colors">
        {icon && <span className="text-app-muted">{icon}</span>}
        <span className="text-app-muted">{label}:</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="bg-transparent font-semibold text-app-text outline-none cursor-pointer pr-1"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export interface FilterBarProps {
  children?: React.ReactNode;
  className?: string;
  onOpenAdvancedFilters?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  className,
  onOpenAdvancedFilters,
}) => {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-card border border-border-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1">{children}</div>
      {onOpenAdvancedFilters && (
        <button
          type="button"
          onClick={onOpenAdvancedFilters}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-white border border-border-card rounded-lg text-xs font-medium text-app-text hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-app-muted" />
          <span>Filters</span>
        </button>
      )}
    </div>
  );
};
