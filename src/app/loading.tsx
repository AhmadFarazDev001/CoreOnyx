import { Loader2 } from "lucide-react";

/**
 * Global suspense fallback UI displayed during server-side page transitions.
 */
export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] gap-4 animate-page-in">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-primary)] opacity-20 h-16 w-16" />
        {/* Inner rotating loader */}
        <div className="relative bg-[var(--bg-tertiary)] p-4 rounded-full shadow-lg border border-[var(--border-subtle)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">
        Loading...
      </p>
    </div>
  );
}
