'use client';

import { Announcement } from '@/lib/types';
import { Pin, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sanitizeHtml } from '@/lib/sanitize';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * UI Component for displaying the top-pinned announcement.
 * Renders a distinct banner with highlight styling.
 * Now supports expansion on click to read long texts.
 * 
 * @param {Announcement} announcement - The pinned announcement object.
 */
export function PinnedBanner({ announcement }: { announcement: Announcement }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={(e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
      }}
      className="bg-[var(--accent-muted)] border-l-4 border-[var(--accent-primary)] rounded-xl p-4 mb-6 flex items-start gap-3 cursor-pointer transition-colors hover:bg-[var(--accent-muted)]/80 touch-manipulation"
      role="button"
      tabIndex={0}
    >
      <div className="mt-0.5">
        <Pin className="w-5 h-5 text-[var(--accent-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider">Pinned</span>
            <span className="text-xs text-[var(--text-secondary)]">
              • {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-[var(--accent-primary)] transition-transform duration-300", isOpen && "rotate-180")} />
        </div>
        
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1 break-words pr-6">
          {announcement.title}
        </h3>

        {/* Collapsed Preview */}
        <div className={cn("transition-opacity duration-300", isOpen ? "hidden" : "block")}>
          <div 
            className="text-sm text-[var(--text-secondary)] line-clamp-2 break-words whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.body) }}
          />
        </div>

        {/* Expanded Full Content */}
        <div 
          className={cn(
            "grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div 
              className="text-sm text-[var(--text-secondary)] break-words whitespace-pre-wrap pb-2"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.body) }}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
