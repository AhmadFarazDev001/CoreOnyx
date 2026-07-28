import { DisputeListWrapper } from '@/components/disputes/DisputeListWrapper';
import { getStudentDisputes } from '@/lib/actions/disputes';
import { DisputeDetails } from '@/components/disputes/DisputeDetails';
import { EmptyState } from '@/components/shared/EmptyState';
import { AlertTriangle, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { NewDisputeButton } from '@/components/disputes/NewDisputeButton';
import { cn } from '@/lib/utils';

export default async function StudentDisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const myDisputes = await getStudentDisputes();
  
  if (myDisputes.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 animate-page-in">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Disputes</h1>
          <p className="text-[var(--text-secondary)]">Open a ticket if you believe there is an error in your grading.</p>
        </div>
        <EmptyState
          icon={AlertTriangle}
          title="No open disputes"
          description="You haven't opened any grading disputes yet."
          className="animate-page-in"
          action={
            <NewDisputeButton className="mt-4 gap-2" showLabel={true} />
          }
        />
      </div>
    );
  }

  // For desktop, default to the first ticket if no ID is selected.
  // For mobile, we use the presence of params.id to trigger the sliding overlay.
  const activeTicket = params.id 
    ? myDisputes.find((s) => s.id === params.id) 
    : myDisputes[0];

  const isMobileOverlayOpen = !!params.id;

  if (!activeTicket) {
    return (
      <div className="text-center p-8">
        <p className="text-[var(--status-urgent)]">Ticket not found.</p>
        <Link href="/disputes" className="text-[var(--accent-primary)] hover:underline mt-4 inline-block">
          Return to Disputes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-[1400px] mx-auto h-[calc(100vh-140px)]">
      
      {/* Left Sidebar: List of tickets */}
      <div className={cn(
        "w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-2 pb-6 lg:pb-0 transition-transform duration-300",
        "animate-page-in"
      )}>
        <div className="mb-4 hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">My Tickets</h1>
          </div>
          <NewDisputeButton size="sm" className="px-3" showLabel={false} />
        </div>
        
        {/* Mobile New button */}
        <div className="lg:hidden mb-2">
           <NewDisputeButton className="w-full gap-2 justify-center" showLabel={true} />
        </div>

        <div className="flex flex-col">
          <DisputeListWrapper 
            tickets={myDisputes} 
            activeId={activeTicket.id} 
            basePath="/disputes" 
          />
        </div>
      </div>

      {/* Right Content: Ticket View (Desktop) or Sliding Overlay (Mobile) */}
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
            {activeTicket?.subject || 'Select a Ticket'}
          </h2>
          <Link 
            href="/disputes" 
            className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] touch-manipulation bg-[var(--bg-tertiary)] rounded-full"
            scroll={false}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {activeTicket && <DisputeDetails ticket={activeTicket} isAdmin={false} />}
      </div>

    </div>
  );
}
