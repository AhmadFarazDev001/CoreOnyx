'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ChatThread } from '@/lib/types';
import { ThreadList } from './ThreadList';
import { cn } from '@/lib/utils';

export function ThreadListWrapper({ threads, activeId, currentUser }: { threads: ChatThread[], activeId: string, currentUser: User }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  const filteredThreads = threads.filter(thread => thread.type === activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Segmented Control for Tabs */}
      <div className="flex p-1 bg-[var(--bg-tertiary)] rounded-lg">
        <button
          onClick={() => setActiveTab('PUBLIC')}
          className={cn(
            "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === 'PUBLIC' 
              ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Public
        </button>
        <button
          onClick={() => setActiveTab('PRIVATE')}
          className={cn(
            "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === 'PRIVATE' 
              ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Private
        </button>
      </div>

      <ThreadList 
        threads={filteredThreads} 
        activeId={activeId} 
        currentUser={currentUser}
        onSelect={(id) => {
          // Determine the correct route based on user role (Admin vs Student)
          const basePath = currentUser.role === 'ADMIN' ? '/admin/qna' : '/qna';
          router.push(`${basePath}?id=${id}`, { scroll: false });
        }}
      />
    </div>
  );
}
