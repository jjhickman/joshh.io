import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantStyles = {
  primary:
    'bg-accent text-white hover:bg-accent-dark dark:hover:bg-accent-light focus-visible:ring-accent',
  secondary:
    'border border-neutral-300 dark:border-neutral-700 text-text-light dark:text-text-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-accent',
  ghost:
    'text-text-light-muted dark:text-text-dark-muted hover:text-text-light dark:hover:text-text-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-accent',
} as const;

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
