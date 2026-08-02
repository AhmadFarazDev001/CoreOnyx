'use client';

import { Announcement } from '@/lib/types';
import { PriorityBadge } from './PriorityBadge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, Sparkles, Pin } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';

/**
 * AnnouncementCard Component
 * 
 * Displays an individual announcement. Supports an expandable body, priority styling,
 * and visually distinct markers for the latest announcement.
 * 
 * @param {Announcement} announcement - The announcement data object from the database.
 * @param {number} index - Index in the list, used for staggered entrance animations.
 * @param {boolean} isLatest - Flag indicating if this is the newest announcement.
 */
export function AnnouncementCard({ 
  announcement, 
  index,
  isLatest = false
}: { 
  announcement: Announcement; 
  index: number;
  isLatest?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(isLatest);

  return (
    <div 
      className={cn(
        'relative bg-[var(--bg-secondary)] rounded-2xl border transition-colors overflow-hidden',
        isOpen ? 'border-[var(--border-default)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]',
        'animate-card-reveal'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Priority Strip */}
      <div 
        className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px]',
          announcement.priority === 'URGENT' ? 'bg-[var(--status-urgent)]' : 'bg-[var(--status-info)]'
        )}
      />
      
      {/* Header (Clickable) */}
      <div 
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="w-full text-left p-5 flex flex-col gap-3 cursor-pointer select-none touch-manipulation"
        role="button"
        tabIndex={0}
      >
        <div className="pointer-events-none w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={announcement.priority} />
            {announcement.isPinned && (
              <div className="flex items-center gap-1 bg-[var(--accent-muted)] text-[var(--accent-primary)] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Pin className="w-3 h-3" />
                Pinned
              </div>
            )}
            {isLatest && !announcement.isPinned && (
              <div className="flex items-center gap-1 bg-[var(--accent-muted)] text-[var(--accent-primary)] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Latest
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isOpen && "rotate-180")} />
          </div>
        </div>

        <h3 className="pointer-events-none text-lg font-semibold text-[var(--text-primary)] pr-8 break-words">
          {announcement.title}
        </h3>
      </div>

      {/* Expandable Body */}
      <div 
        className={cn(
          "grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0">
            <div 
              className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 prose prose-invert max-w-none break-words whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.body) }}
            />

            <div className="flex items-center gap-2 pt-4 border-t border-[var(--border-subtle)]">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-xs shrink-0 pointer-events-none">
                {announcement.author.name[0]}
              </div>
              <div className="pointer-events-none">
                <p className="text-xs font-medium text-[var(--text-primary)]">{announcement.author.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Teaching Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
