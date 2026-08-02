import { getAnnouncements } from '@/lib/actions/announcements';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { PinnedBanner } from '@/components/announcements/PinnedBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Megaphone, Pin } from 'lucide-react';

/**
 * Server Component for the Student Announcements feed.
 * Displays pinned and chronological announcements to keep students updated.
 */
export default async function StudentAnnouncementsPage() {
  const announcements = await getAnnouncements();
  
  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const feedAnnouncements = announcements.filter(a => !a.isPinned);

  return (
    <div className="w-full max-w-7xl mx-auto min-h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-8 animate-page-in">
      
      {/* Pinned Announcements */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0">
        <div className="flex items-center gap-2 mb-2 text-[var(--status-urgent)]">
          <Pin className="w-5 h-5 fill-current" />
          <h2 className="text-xl font-bold">Pinned</h2>
        </div>
        
        {pinnedAnnouncements.length > 0 ? (
          pinnedAnnouncements.map((announcement) => (
            <PinnedBanner key={announcement.id} announcement={announcement} />
          ))
        ) : (
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 text-center">
            <p className="text-sm text-[var(--text-muted)]">No pinned announcements.</p>
          </div>
        )}
      </div>

      {/* Feed Announcements */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2 text-[var(--text-primary)]">
          <Megaphone className="w-5 h-5" />
          <h2 className="text-xl font-bold">Latest Updates</h2>
        </div>

        {feedAnnouncements.length > 0 ? (
          <div className="flex flex-col gap-3">
            {feedAnnouncements.map((announcement, index) => (
              <AnnouncementCard 
                key={announcement.id} 
                announcement={announcement} 
                index={index}
                isLatest={index === 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Your TA will post updates here."
            className="mt-4"
          />
        )}
      </div>

    </div>
  );
}
