import { getSolutions } from '@/lib/actions/solutions';
import { SolutionCard } from '@/components/solutions/SolutionCard';
import { CodeViewer } from '@/components/solutions/CodeViewer';
import { EmptyState } from '@/components/shared/EmptyState';
import { Code2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

export default async function SolutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const solutions = await getSolutions();
  
  if (solutions.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 animate-page-in">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Solution Hub</h1>
          <p className="text-[var(--text-secondary)]">Review golden solutions and annotations.</p>
        </div>
        <EmptyState
          icon={Code2}
          title="No solutions yet"
          description="Your TA will post golden solutions here after deadlines."
          className="animate-page-in"
        />
      </div>
    );
  }

  // For desktop, default to the first solution if no ID is selected.
  // For mobile, we use the presence of params.id to trigger the sliding overlay.
  const activeSolution = params.id 
    ? solutions.find((s) => s.id === params.id) 
    : solutions[0];

  const isMobileOverlayOpen = !!params.id;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-[1400px] mx-auto h-[calc(100vh-140px)] relative overflow-hidden">
      
      {/* Left Sidebar: List of solutions */}
      <div className={cn(
        "w-full lg:w-[350px] flex flex-col gap-4 overflow-y-auto pr-2 pb-6 lg:pb-0 transition-transform duration-300",
        // On mobile, if a solution is active, we can slightly push the list back, but we don't need to if the overlay covers it.
        "animate-page-in"
      )}>
        <div className="mb-2 hidden lg:block">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Solutions</h1>
          <p className="text-sm text-[var(--text-secondary)]">Select a quiz to view.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          {solutions.map((solution) => (
            <Link key={solution.id} href={`/solutions?id=${solution.id}`} scroll={false}>
              <SolutionCard 
                solution={solution}
                isActive={solution.id === params.id}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Right Content: Code Viewer (Desktop) or Sliding Overlay (Mobile) */}
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
            {activeSolution?.title || 'Select a Solution'}
          </h2>
          <Link 
            href="/solutions" 
            className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] touch-manipulation bg-[var(--bg-tertiary)] rounded-full"
            scroll={false}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {activeSolution && <CodeViewer solution={activeSolution} />}
      </div>
    </div>
  );
}
