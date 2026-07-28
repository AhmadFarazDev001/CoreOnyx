import { ChatThread, User } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

import { formatDistanceToNow } from 'date-fns';
import { Lock, Globe, CheckCircle, Clock } from 'lucide-react';

export function ThreadList({ 
  threads, 
  activeId, 
  onSelect,
  currentUser
}: { 
  threads: ChatThread[]; 
  activeId?: string;
  onSelect: (id: string) => void;
  currentUser: User;
}) {
  return (
    <div className="flex flex-col gap-2">
      {threads.map((thread) => {
        const isActive = thread.id === activeId;
        const otherParticipant = thread.participants.find(p => p.id !== currentUser.id);

        return (
          <div
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            className={`cursor-pointer rounded-xl transition-all duration-200 border ${
              isActive 
                ? 'bg-[var(--bg-tertiary)] border-[var(--border-default)]' 
                : 'bg-transparent border-transparent hover:bg-[var(--bg-secondary)] hover:border-[var(--border-subtle)]'
            } p-3`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                {thread.type === 'PRIVATE' ? (
                  <Lock className="w-3.5 h-3.5 text-[var(--status-warning)]" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-[var(--status-info)]" />
                )}
                <span className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
                  {thread.type === 'PRIVATE' && otherParticipant ? otherParticipant.name : thread.title}
                </span>
                {thread.isFAQ && <Badge variant="general">FAQ</Badge>}
              </div>
              <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: false })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {thread.lastMessage ? thread.lastMessage.content : 'No messages yet'}
              </p>
              {thread.unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[var(--accent-primary)] text-[var(--bg-primary)] text-[10px] font-bold">
                  {thread.unreadCount}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
