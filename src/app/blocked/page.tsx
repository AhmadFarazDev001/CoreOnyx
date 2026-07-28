import { ShieldAlert } from 'lucide-react';
import { signOut, auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Suspended | CoreOnyx',
  description: 'Your account has been suspended.',
};

export default async function BlockedPage() {
  const session = await auth();
  
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isBlocked: true, role: true }
    });
    
    // If user is logged in but NOT blocked in the DB, redirect them to safety
    if (dbUser && !dbUser.isBlocked) {
      if (dbUser.role === 'ADMIN') {
        redirect('/admin/dashboard');
      } else {
        redirect('/announcements');
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--status-urgent)]/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Urgent gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--status-urgent)]/5 to-transparent pointer-events-none"></div>
        
        <div className="w-20 h-20 bg-[var(--status-urgent-bg)] rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-[var(--status-urgent)]/20 rounded-full animate-ping"></div>
          <ShieldAlert className="w-10 h-10 text-[var(--status-urgent)] relative z-10" />
        </div>
        
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-3">
          Account Suspended
        </h1>
        
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          Your account has been temporarily blocked or suspended by an administrator. You do not have permission to access the application at this time.
        </p>
        
        <div className="space-y-4">
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-xl text-sm text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            If you believe this is a mistake, please contact your course instructor or TA to request account restoration. All your existing data has been safely archived.
          </div>
          
          <form action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}>
            <button 
              type="submit"
              className="block w-full bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold py-3 px-4 rounded-xl transition-colors text-center"
            >
              Sign Out & Return
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
