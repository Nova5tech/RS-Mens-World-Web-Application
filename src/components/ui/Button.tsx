import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-brand text-white hover:bg-[#0c3e2f] shadow-sm active:scale-[0.98]',
        secondary:
          'bg-white text-app-text border border-border-card hover:bg-slate-50 shadow-sm active:scale-[0.98]',
        outline:
          'border border-border-card bg-transparent text-app-text hover:bg-slate-100',
        ghost:
          'text-app-text hover:bg-slate-100 hover:text-app-text',
        soft:
          'bg-accent-soft text-primary-brand hover:bg-[#d8f2e4] font-medium',
        danger:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
        md: 'h-9 px-4 py-2 text-sm gap-2 rounded-lg',
        lg: 'h-11 px-6 text-base gap-2.5 rounded-lg',
        icon: 'h-9 w-9 p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
