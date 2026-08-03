import { StudentHeader } from '@/components/layouts/StudentHeader';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { SecurityGuard } from '@/components/shared/SecurityGuard';
import { SupportFooter } from '@/components/shared/SupportFooter';

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
    select: { isBlocked: true, role: true }
  });

  if (!dbUser) {
    redirect('/api/force-logout');
  }

  if (dbUser.isBlocked) {
    redirect('/blocked');
  }

  // If they are a student, ensure they are still in the Whitelist.
  // If an admin removes them, they will be kicked out on their next navigation.
  if (dbUser.role === 'STUDENT') {
    const whitelistEntry = await prisma.whitelist.findUnique({
      where: { email: session.user.email }
    });
    
    if (!whitelistEntry) {
      redirect('/api/force-logout');
    }
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
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8">
          {children}
        </div>
      </main>
      <SupportFooter className="mt-auto pb-24 md:pb-6" />
    </div>
  );
}
