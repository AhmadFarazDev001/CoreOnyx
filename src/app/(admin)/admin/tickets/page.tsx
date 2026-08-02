import { DisputeListWrapper } from '@/components/disputes/DisputeListWrapper';
import { getAllDisputes } from '@/lib/actions/disputes';
import { DisputeDetails } from '@/components/disputes/DisputeDetails';
import { EmptyState } from '@/components/shared/EmptyState';
import { Ticket, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Server Component for the Admin Tickets Dashboard.
 * Handles desktop/mobile responsive ticket viewing and state management.
 */
export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const allTickets = await getAllDisputes();
  
  if (allTickets.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 animate-page-in">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Ticketing System</h1>
          <p className="text-[var(--text-secondary)]">Manage grading disputes and student tickets.</p>
        </div>
        <EmptyState
          icon={Ticket}
          title="No open tickets"
          description="You are all caught up!"
          className="animate-page-in"
        />
      </div>
    );
  }

  const activeTicket = params.id 
    ? allTickets.find((s) => s.id === params.id) 
    : allTickets[0];

  const isMobileOverlayOpen = !!params.id;

  if (!activeTicket) {
    return (
      <div className="text-center p-8">
        <p className="text-[var(--status-urgent)]">Ticket not found.</p>
        <Link href="/admin/tickets" className="text-[var(--accent-primary)] hover:underline mt-4 inline-block">
          Return to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-[1400px] mx-auto h-[calc(100vh-140px)]">
      
      {/* Ticket List Sidebar */}
      <div className={cn(
        "w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-2 pb-6 lg:pb-0 transition-transform duration-300",
        "animate-page-in"
      )}>
        <div className="mb-4 hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">All Tickets</h1>
          </div>
          <Button variant="secondary" size="sm" className="px-3" title="Filter">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col">
          <DisputeListWrapper 
            tickets={allTickets as any} 
            activeId={activeTicket.id} 
            basePath="/admin/tickets" 
          />
        </div>
      </div>

      {/* Active Ticket View */}
      <div className={cn(
        "flex-1 flex-col min-w-0 bg-[var(--bg-primary)] lg:bg-transparent",
        "fixed inset-0 z-50 lg:static lg:flex lg:z-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isMobileOverlayOpen 
          ? "translate-y-0 flex pt-16 lg:pt-0 px-4 lg:px-0 pb-[env(safe-area-inset-bottom)] lg:pb-0" 
          : "translate-y-[100%] lg:translate-y-0 hidden lg:flex"
      )}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 mb-4 shrink-0">
          <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">
            {activeTicket?.subject || 'Select a Ticket'}
          </h2>
          <Link 
            href="/admin/tickets" 
            className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] touch-manipulation bg-[var(--bg-tertiary)] rounded-full"
            scroll={false}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {activeTicket && <DisputeDetails ticket={activeTicket as any} isAdmin={true} />}
      </div>

    </div>
  );
}
