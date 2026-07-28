import { ThreadListWrapper } from '@/components/qna/ThreadListWrapper';
import { getThreads } from '@/lib/actions/chat';
import { auth } from '@/lib/auth';
import { ThreadList } from '@/components/qna/ThreadList';
import { ChatThreadView } from '@/components/qna/ChatThreadView';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageSquare, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { NewThreadButton } from '@/components/qna/NewThreadButton';
import { cn } from '@/lib/utils';

export default async function StudentQNAPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const currentUser = session?.user;
  
  if (!currentUser) redirect('/login');

  const threads = await getThreads();
  
  if (threads.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 animate-page-in">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Q&A System</h1>
          <p className="text-[var(--text-secondary)]">Ask questions publicly or privately to your TA.</p>
        </div>
        <EmptyState
          icon={MessageSquare}
          title="No discussions yet"
          description="Start a new thread to get help with your labs."
          className="animate-page-in"
          action={
            <NewThreadButton className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> New Thread
            </NewThreadButton>
          }
        />
      </div>
    );
  }

  // For desktop, default to the first thread if no ID is selected.
  // For mobile, we use the presence of params.id to trigger the sliding overlay.
  const activeThread = params.id 
    ? threads.find((s) => s.id === params.id) 
    : threads[0];

  const isMobileOverlayOpen = !!params.id;

  // Remove early return for !activeThread so we can render the sidebar
  // We will handle !activeThread inside the main layout below

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-[1400px] mx-auto h-[calc(100vh-140px)]">
      
      {/* Left Sidebar: List of threads */}
      <div className={cn(
        "w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-2 pb-6 lg:pb-0 transition-transform duration-300",
        "animate-page-in"
      )}>
        <div className="mb-4 hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Discussions</h1>
          </div>
          <NewThreadButton size="sm" className="px-3" />
        </div>
        
        {/* Mobile New Thread button */}
        <div className="lg:hidden mb-2">
           <NewThreadButton className="w-full justify-center gap-2">
             <Plus className="w-4 h-4" /> New Thread
           </NewThreadButton>
        </div>

        <div className="flex flex-col">

          <ThreadListWrapper threads={threads as any} activeId={params.id || activeThread?.id || ''} currentUser={currentUser as any} />
        </div>
      </div>

      {/* Right Content: Chat Thread View (Desktop) or Sliding Overlay (Mobile) */}
      <div className={cn(
        "flex-1 flex-col min-w-0 bg-[var(--bg-primary)] lg:bg-transparent",
        "fixed inset-0 z-50 lg:static lg:flex lg:z-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isMobileOverlayOpen 
          ? "translate-y-0 flex pt-16 lg:pt-0 px-4 lg:px-0 pb-[env(safe-area-inset-bottom)] lg:pb-0" 
          : "translate-y-[100%] lg:translate-y-0 hidden lg:flex"
      )}>
        {/* Mobile Header / Close Button inside the sliding overlay */}
        <div className="lg:hidden flex items-center justify-between gap-2 mb-4 shrink-0">
          <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">
            {activeThread?.title || 'Select a Thread'}
          </h2>
          <Link 
            href="/qna" 
            className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] touch-manipulation bg-[var(--bg-tertiary)] rounded-full"
            scroll={false}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {activeThread ? (
          <ChatThreadView key={activeThread.id} thread={activeThread as any} currentUser={currentUser as any} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-page-in">
            <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mb-4" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Thread not found</h2>
            <p className="text-[var(--text-secondary)] mb-6">This discussion may have been deleted or resolved.</p>
            <Link href="/qna">
              <Button variant="primary">Return to Q&A</Button>
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}


