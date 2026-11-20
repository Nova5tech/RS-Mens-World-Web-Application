import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className,
}) => {
  const isSm = size === 'sm';

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2.5 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-brand focus:ring-offset-1',
          isSm ? 'h-5 w-9' : 'h-6 w-11',
          checked ? 'bg-accent-brand' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            isSm ? 'h-3.5 w-3.5 translate-x-0.5' : 'h-4.5 w-4.5 translate-x-1',
            checked && (isSm ? 'translate-x-4.5' : 'translate-x-5.5'),
            'mt-0.5'
          )}
        />
      </button>
      {label && <span className="text-xs font-medium text-app-text">{label}</span>}
    </label>
  );
};
