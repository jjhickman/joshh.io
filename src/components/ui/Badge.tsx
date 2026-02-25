import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'outline';
  children: string;
}

const variantStyles = {
  default:
    'bg-neutral-100 dark:bg-neutral-800 text-text-light-muted dark:text-text-dark-muted',
  accent:
    'bg-accent/10 text-accent-dark dark:text-accent-light border border-accent/20',
  outline:
    'border border-neutral-300 dark:border-neutral-700 text-text-light-muted dark:text-text-dark-muted',
} as const;

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
