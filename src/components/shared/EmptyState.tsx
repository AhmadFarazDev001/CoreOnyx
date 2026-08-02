import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable component for displaying empty states across the application.
 * Used when lists are empty or content is unavailable.
 */
export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, className, action }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl', className)}>
      <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
