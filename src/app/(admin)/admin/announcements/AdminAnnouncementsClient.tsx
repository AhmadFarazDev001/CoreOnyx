'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Info, AlertTriangle, Pin, Trash2 } from 'lucide-react';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { Announcement } from '@/lib/types';
import { createAnnouncement, deleteAnnouncement, togglePin } from '@/lib/actions/announcements';

/**
 * Client component for managing course announcements.
 * Handles the creation, preview, and deletion of announcements via Server Actions.
 */
export function AdminAnnouncementsClient({ announcements }: { announcements: Announcement[] }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pinningId, setPinningId] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!title || !body) return;
    
    setLoading(true);
    try {
      await createAnnouncement({
        title,
        body,
        priority: priority,
        isPinned,
      });
      setTitle('');
      setBody('');
      setIsPinned(false);
      setPriority('NORMAL');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAnnouncement(id);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    setPinningId(id);
    try {
      await togglePin(id, !currentlyPinned);
    } catch (error) {
      console.error(error);
    } finally {
      setPinningId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {/* Compose Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">New Announcement</h1>
            <p className="text-[var(--text-secondary)]">Draft and publish updates to all students.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Title</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title..."
              className="text-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Priority</label>
              <div className="flex items-center p-1 bg-[var(--bg-tertiary)] rounded-xl w-fit">
                <button
                  onClick={() => setPriority('NORMAL')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    priority === 'NORMAL' 
                      ? 'bg-[var(--status-info-bg)] text-[var(--status-info)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Info className="w-4 h-4" /> Normal
                </button>
                <button
                  onClick={() => setPriority('URGENT')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    priority === 'URGENT' 
                      ? 'bg-[var(--status-urgent-bg)] text-[var(--status-urgent)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" /> Urgent
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Pin Status</label>
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  isPinned
                    ? 'bg-[var(--accent-muted)] border-[var(--accent-primary)]/30 text-[var(--accent-primary)]'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Pin className="w-4 h-4" />
                Pin to Top
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Message Body</label>
            <Textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement... (HTML allowed for preview)"
              className="min-h-[200px]"
            />
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
            <Button 
              variant="primary" 
              onClick={handlePublish} 
              disabled={loading || !title || !body}
            >
              {loading ? 'Publishing...' : 'Publish Announcement'}
            </Button>
          </div>
        </div>
      </div>

      {/* Published Announcements Section */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Published Announcements</h2>
        <div className="flex flex-col gap-4">
          {announcements.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm">No announcements published yet.</p>
          ) : (
            announcements.map((announcement, i) => (
              <div key={announcement.id} className="relative group">
                <AnnouncementCard 
                  announcement={announcement as any} 
                  index={i} 
                  isLatest={i === 0 && !announcement.isPinned} 
                  adminActions={
                    <>
                      <button
                        onClick={() => handleTogglePin(announcement.id, announcement.isPinned)}
                        disabled={pinningId === announcement.id}
                        className={`p-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                          announcement.isPinned 
                            ? 'bg-[var(--accent-muted)] border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white' 
                            : 'bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
                        }`}
                        title={announcement.isPinned ? "Unpin Announcement" : "Pin Announcement"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        disabled={deletingId === announcement.id}
                        className="p-1.5 bg-[var(--bg-primary)] border border-[var(--status-urgent)] text-[var(--status-urgent)] rounded-full hover:bg-[var(--status-urgent)] hover:text-white transition-colors disabled:opacity-50"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  }
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
