import { Card } from '@/components/ui/Card';
import { Users, MessageCircle, Ticket, Activity } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { UserManagementList } from '@/components/admin/UserManagementList';

export default async function AdminDashboardPage() {
  const activeStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
  const openThreads = await prisma.chatThread.count({ where: { isResolved: false } });
  const openTickets = await prisma.disputeTicket.count({ where: { status: 'OPEN' } });
  
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, image: true, role: true, isBlocked: true, createdAt: true }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-page-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Overview</h1>
        <p className="text-[var(--text-secondary)] mt-1">Key metrics and system status at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="flex flex-col p-6 border-l-4 border-l-[var(--accent-primary)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-4">
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Active Students</span>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{activeStudents}</div>
        </Card>

        {/* Metric 2 */}
        <Card className="flex flex-col p-6 border-l-4 border-l-[var(--status-info)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-4">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Active Q&A Threads</span>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{openThreads}</div>
        </Card>

        {/* Metric 3 */}
        <Card className="flex flex-col p-6 border-l-4 border-l-[var(--status-warning)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-4">
            <Ticket className="w-5 h-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Unsolved Tickets</span>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{openTickets}</div>
        </Card>

        {/* Metric 4 */}
        <Card className="flex flex-col p-6 border-l-4 border-l-[var(--status-success)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-4">
            <Activity className="w-5 h-5" />
            <span className="font-medium text-sm uppercase tracking-wider">System Status</span>
          </div>
          <div className="text-2xl font-bold text-[var(--status-success)]">Healthy</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-[var(--text-primary)] pt-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/announcements">
          <Card hoverable className="h-full group cursor-pointer border-[var(--border-subtle)] bg-transparent hover:bg-[var(--bg-tertiary)] flex flex-col items-center justify-center py-8">
             <div className="w-12 h-12 bg-[var(--accent-muted)] rounded-full flex items-center justify-center text-[var(--accent-primary)] mb-3 group-hover:scale-110 transition-transform">
               <span className="text-xl font-bold">+</span>
             </div>
             <span className="font-medium text-[var(--text-primary)]">New Announcement</span>
          </Card>
        </Link>
        <Link href="/admin/solutions">
          <Card hoverable className="h-full group cursor-pointer border-[var(--border-subtle)] bg-transparent hover:bg-[var(--bg-tertiary)] flex flex-col items-center justify-center py-8">
             <div className="w-12 h-12 bg-[var(--accent-muted)] rounded-full flex items-center justify-center text-[var(--accent-primary)] mb-3 group-hover:scale-110 transition-transform">
               <span className="text-xl font-bold">+</span>
             </div>
             <span className="font-medium text-[var(--text-primary)]">New Solution</span>
          </Card>
        </Link>
        <Link href="/admin/tickets">
          <Card hoverable className="h-full group cursor-pointer border-[var(--border-subtle)] bg-transparent hover:bg-[var(--bg-tertiary)] flex flex-col items-center justify-center py-8">
             <div className="w-12 h-12 bg-[var(--status-warning-bg)] rounded-full flex items-center justify-center text-[var(--status-warning)] mb-3 group-hover:scale-110 transition-transform">
               <Ticket className="w-5 h-5" />
             </div>
             <span className="font-medium text-[var(--text-primary)]">Review Tickets</span>
          </Card>
        </Link>
      </div>

      <div className="pt-8">
        <UserManagementList users={allUsers} />
      </div>

    </div>
  );
}
