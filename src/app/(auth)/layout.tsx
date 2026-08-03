import { Metadata } from 'next';
import { SupportFooter } from '@/components/shared/SupportFooter';

export const metadata: Metadata = {
  title: 'Authentication | CoreOnyx',
  description: 'Login to access your CoreOnyx dashboard.',
};

/**
 * Base layout for authentication routes.
 * Provides a clean, unencumbered canvas for login and onboarding flows.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {/* 
        The footer will overlay or sit at the bottom depending on the page content.
        For pages with absolute min-h-screen backgrounds (like login), we z-index the footer.
      */}
      <SupportFooter className="mt-auto absolute bottom-0 bg-transparent border-t-0 !py-4 z-50 text-white/50 [&>p]:text-white/50" />
    </div>
  );
}
