import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  wide?: boolean;
}

export function Section({ children, wide = false, className, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        'px-4 py-16 sm:px-6 lg:px-8',
        wide ? 'max-w-content mx-auto' : 'max-w-prose mx-auto',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
