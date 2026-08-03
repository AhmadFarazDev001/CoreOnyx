'use client';

import { useState, useTransition } from 'react';
import { DisputeTicket } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, Paperclip, MessageSquare, Trash2 } from 'lucide-react';
import { updateTicketStatus, deleteDispute } from '@/lib/actions/disputes';

/**
 * Client component for rendering the details of a dispute ticket.
 * Allows students to view the status, and admins to resolve or delete tickets.
 * 
 * @param {DisputeTicket} ticket - The dispute ticket data object.
 * @param {boolean} isAdmin - Flag to determine if the user has admin privileges.
 */
export function DisputeDetails({ 
  ticket, 
  isAdmin 
}: { 
  ticket: DisputeTicket;
  isAdmin: boolean;
}) {
  const [resolutionText, setResolutionText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = async (status: 'IN_REVIEW' | 'RESOLVED') => {
    setIsUpdating(true);
    try {
      await updateTicketStatus(ticket.id, status, status === 'RESOLVED' ? resolutionText : undefined);
      if (status === 'RESOLVED') setResolutionText('');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const executeDelete = async () => {
    setIsUpdating(true);
    try {
      await deleteDispute(ticket.id);
      setIsDeleteModalOpen(false);
      window.location.href = isAdmin ? '/admin/tickets' : '/disputes';
    } catch (error) {
      console.error(error);
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-in h-full overflow-y-auto pr-2">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{ticket.subject}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="font-medium">{ticket.assessmentName}</span>
              <span>•</span>
              <span>Opened {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
              {isAdmin && ticket.student && (
                <>
                  <span>•</span>
                  <span className="font-medium text-[var(--accent-primary)]">{ticket.student.name} ({ticket.student.email})</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {ticket.status === 'RESOLVED' && <Badge variant="success" icon>Resolved</Badge>}
            {ticket.status === 'OPEN' && <Badge variant="warning" icon>Open</Badge>}
            {ticket.status === 'IN_REVIEW' && <Badge variant="general" icon>In Review</Badge>}
            {ticket.status === 'ARCHIVED' && <Badge variant="neutral">Archived</Badge>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wider">Rationale</h3>
            <div className="bg-[var(--bg-tertiary)] p-4 rounded-xl text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap break-words">
              {ticket.rationale}
            </div>
          </div>

          {ticket.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wider">Attachments</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {ticket.attachments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--border-subtle)] group block shrink-0">
                    <img src={url} alt={`Attachment ${i+1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <Paperclip className="w-5 h-5 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {ticket.resolution && (
        <Card className="p-6 border-[var(--status-success)]/30 bg-[var(--status-success-bg)]">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-[var(--status-success)]" />
            <h3 className="text-sm font-semibold text-[var(--status-success)] uppercase tracking-wider">Resolution</h3>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {ticket.resolution}
          </p>
          {ticket.resolvedAt && (
            <p className="text-xs text-[var(--status-success)]/70 mt-3">
              Resolved {formatDistanceToNow(new Date(ticket.resolvedAt), { addSuffix: true })}
            </p>
          )}
        </Card>
      )}

      {isAdmin && (
        <Card className="p-6 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Admin Actions</h3>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isUpdating}
              className="text-xs flex items-center gap-1 text-[var(--status-urgent)] hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Ticket
            </button>
          </div>
          
          {ticket.status !== 'RESOLVED' && ticket.status !== 'ARCHIVED' && (
            <div className="flex flex-col gap-3">
              <textarea 
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent-primary)] min-h-[80px]"
                placeholder="Resolution notes (required to resolve)..."
                value={resolutionText}
                onChange={e => setResolutionText(e.target.value)}
                disabled={isUpdating}
              />
              <div className="flex gap-3">
                <Button 
                  variant="primary" 
                  className="flex-1"
                  disabled={isUpdating || !resolutionText.trim()}
                  onClick={() => handleUpdateStatus('RESOLVED')}
                >
                  Resolve Ticket
                </Button>
                {ticket.status === 'OPEN' && (
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('IN_REVIEW')}
                  >
                    Mark as In-Review
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => !isUpdating && setIsDeleteModalOpen(false)}
        title="Delete Dispute Ticket"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Are you sure you want to permanently delete this dispute ticket? This action cannot be undone and the student will no longer see it.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={executeDelete}
              disabled={isUpdating}
              className="!bg-[var(--status-urgent)] hover:!bg-red-600 !text-white"
            >
              {isUpdating ? 'Deleting...' : 'Delete Ticket'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
