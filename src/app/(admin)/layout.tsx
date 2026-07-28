import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | CoreOnyx',
  description: 'Manage students, tickets, and announcements.',
};

export default async function AdminLayout({
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
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      <AdminSidebar user={{ name: session.user.name || 'Admin', email: session.user.email || '' }} />
      {/* 
        Add left margin on desktop to account for 260px sidebar.
        Add top padding on mobile to account for 64px header.
      */}
      <main className="flex-1 md:ml-[260px] pt-16 md:pt-0 min-w-0">
        <div className="px-6 md:px-8 py-6 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
