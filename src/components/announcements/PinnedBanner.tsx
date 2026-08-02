import { Announcement } from '@/lib/types';
import { Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sanitizeHtml } from '@/lib/sanitize';

/**
 * UI Component for displaying the top-pinned announcement.
 * Renders a distinct banner with highlight styling.
 * 
 * @param {Announcement} announcement - The pinned announcement object.
 */
export function PinnedBanner({ announcement }: { announcement: Announcement }) {
  return (
    <div className="bg-[var(--accent-muted)] border-l-4 border-[var(--accent-primary)] rounded-xl p-4 mb-6 flex items-start gap-3">
      <div className="mt-0.5">
        <Pin className="w-5 h-5 text-[var(--accent-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider">Pinned</span>
          <span className="text-xs text-[var(--text-secondary)]">
            • {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
          </span>
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          {announcement.title}
        </h3>
        <div 
          className="text-sm text-[var(--text-secondary)] line-clamp-2"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.body) }}
        />
      </div>
    </div>
  );
}
