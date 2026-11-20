import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const pillVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        green: 'bg-pill-green-bg text-pill-green-text',
        yellow: 'bg-pill-yellow-bg text-pill-yellow-text',
        orange: 'bg-pill-orange-bg text-pill-orange-text',
        red: 'bg-pill-red-bg text-pill-red-text',
        blue: 'bg-pill-blue-bg text-pill-blue-text',
        purple: 'bg-pill-purple-bg text-pill-purple-text',
        amber: 'bg-pill-amber-bg text-pill-amber-text',
        gray: 'bg-slate-100 text-slate-700',
        mint: 'bg-accent-brand/20 text-[#074b33] font-semibold',
      },
      size: {
        sm: 'px-2 py-0.2 text-[11px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'green',
      size: 'md',
    },
  }
);

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {
  dot?: boolean;
  dotColor?: string;
}

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(
  ({ className, variant, size, dot, dotColor, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(pillVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full mr-0.5',
              dotColor || 'bg-current'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);
Pill.displayName = 'Pill';
