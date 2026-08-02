import { StudentHeader } from '@/components/layouts/StudentHeader';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { SecurityGuard } from '@/components/shared/SecurityGuard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Student Dashboard | CoreOnyx',
  description: 'Your lab companion, built for clarity.',
};

/**
 * Secure layout wrapper for all student routes.
 * Enforces session authentication and blocks unauthorized or suspended users.
 */
export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isBlocked: true }
  });

  if (!dbUser) {
    redirect('/api/force-logout');
  }

  if (dbUser.isBlocked) {
    redirect('/blocked');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <SecurityGuard />
      <StudentHeader user={{ name: session.user.name || 'User', email: session.user.email || '' }} />
      {/* 
        Add top padding for desktop header (64px = pt-16).
        Add bottom padding for mobile tab bar (64px = pb-16 + safe area).
      */}
      <main className="flex-1 pt-16 pb-20 md:pb-6">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
