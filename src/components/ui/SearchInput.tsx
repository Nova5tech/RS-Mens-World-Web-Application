import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  wrapperClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className,
  wrapperClassName,
  ...props
}) => {
  return (
    <div className={cn('relative flex items-center min-w-[240px]', wrapperClassName)}>
      <Search className="absolute left-3 w-4 h-4 text-app-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-9 pl-9 pr-8 bg-white border border-border-card rounded-lg text-xs placeholder:text-app-muted focus:outline-none focus:ring-1 focus:ring-primary-brand focus:border-primary-brand transition-all',
          className
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-2.5 p-0.5 text-app-muted hover:text-app-text rounded-full"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
