'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

/**
 * Global error boundary UI.
 * Intercepts unhandled exceptions and provides a recovery mechanism.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-8">
      <div className="w-16 h-16 bg-[var(--status-urgent-bg)] rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-[var(--status-urgent)]" />
      </div>
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Something went wrong!</h1>
      <p className="text-[var(--text-secondary)] text-center max-w-md mb-8">
        An unexpected error occurred. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
