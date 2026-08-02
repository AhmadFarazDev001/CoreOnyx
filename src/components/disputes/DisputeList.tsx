import { DisputeTicket } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { Ticket } from 'lucide-react';

/**
 * UI Component for rendering a list of dispute tickets.
 * Displays ticket subjects, statuses, and timestamps with interactive selection.
 */
export function DisputeList({ 
  tickets, 
  activeId, 
  onSelect 
}: { 
  tickets: DisputeTicket[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/30';
      case 'in-review': return 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info)]/30';
      case 'resolved': return 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/30';
      case 'archived': return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-subtle)]';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {tickets.map((ticket) => {
        const isActive = ticket.id === activeId;
        return (
          <div
            key={ticket.id}
            onClick={() => onSelect(ticket.id)}
            className={`cursor-pointer rounded-xl transition-all duration-200 border p-4 ${
              isActive 
                ? 'bg-[var(--bg-tertiary)] border-[var(--border-default)]' 
                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
            }`}
          >
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">
                {ticket.subject}
              </h3>
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-1">
              <span className="font-medium px-2 py-0.5 bg-[var(--bg-tertiary)] rounded-md">
                {ticket.assessmentName}
              </span>
              <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
