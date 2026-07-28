import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'urgent' | 'general' | 'success' | 'warning' | 'neutral';
  icon?: boolean;
}

/**
 * Semantic badge component with optional icons.
 */
export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'neutral', icon = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border';
    
    const variants = {
      urgent: 'bg-[var(--status-urgent-bg)] text-[var(--status-urgent)] border-[var(--status-urgent)]/20',
      general: 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info)]/20',
      success: 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/20',
      warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/20',
      neutral: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    };

    const Icons = {
      urgent: AlertTriangle,
      general: Info,
      success: CheckCircle,
      warning: AlertCircle,
      neutral: Info,
    };

    const Icon = icon ? Icons[variant] : null;

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';
