'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createThread, sendMessage, getChatUsers } from '@/lib/actions/chat';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * NewThreadButton Component
 * 
 * Renders a button that opens a modal to create a new Q&A thread.
 * Supports creating public or private threads. For admins, it fetches the user list
 * to allow creating a private thread on behalf of a specific student.
 */
export function NewThreadButton({ 
  className,
  variant = "primary",
  size = "md",
  children,
  isAdmin = false
}: { 
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  isAdmin?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{id: string, name: string, email: string}[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isOpen && isAdmin) {
      getChatUsers().then(setUsers).catch(console.error);
    }
  }, [isOpen, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);
    try {
      // 1. Create thread
      const thread = await createThread({
        title: title.trim(),
        type: isPrivate ? 'PRIVATE' : 'PUBLIC',
        participantUserId: isAdmin && selectedUser ? selectedUser : undefined
      });

      // 2. Send initial message
      await sendMessage(thread.id, message.trim());

      setIsOpen(false);
      setTitle('');
      setMessage('');
      setIsPrivate(false);
      setSelectedUser('');
      
      // Redirect to the newly created thread
      router.push(`/qna?id=${thread.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
        title={!children ? "New Thread" : undefined}
      >
        {children || <Plus className="w-4 h-4" />}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Start New Thread">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Title
            </label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need help with?"
              required
              disabled={loading}
              className="bg-[var(--bg-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Message
            </label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question or issue in detail..."
              required
              disabled={loading}
              className="w-full min-h-[120px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-y"
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="private-thread"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              disabled={loading}
              className="rounded border-[var(--border-subtle)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] bg-[var(--bg-primary)]"
            />
            <label htmlFor="private-thread" className="text-sm text-[var(--text-secondary)] select-none">
              Make this thread private {isAdmin ? '(only selected student and TAs can see it)' : '(only you and TAs can see it)'}
            </label>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Select Student {isPrivate && "(Required for Private Thread)"}
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                required={isPrivate}
                disabled={loading}
              >
                <option value="">None (Admin only)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading || !title.trim() || !message.trim()}
            >
              {loading ? 'Creating...' : 'Create Thread'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
