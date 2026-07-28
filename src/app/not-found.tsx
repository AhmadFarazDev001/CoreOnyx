import { Button } from '@/components/ui/Button';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-8">
      <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">404 - Not Found</h1>
      <p className="text-[var(--text-secondary)] text-center max-w-md mb-8">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Link href="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
