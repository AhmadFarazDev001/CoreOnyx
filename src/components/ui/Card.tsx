import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

/**
 * Basic Card component for holding content.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-5',
          hoverable && 'hover:border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] transition-all duration-200',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';
