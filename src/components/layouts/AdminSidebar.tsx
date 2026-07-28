'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { signOut } from 'next-auth/react';


import { 
  LayoutDashboard, 
  Megaphone, 
  Code2, 
  Ticket, 
  MessageCircle, 
  Users, 
  LogOut,
  Menu,
  X,
  Hexagon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const LINKS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { name: 'Solutions', path: '/admin/solutions', icon: Code2 },
  { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
  { name: 'Q&A', path: '/admin/qna', icon: MessageCircle },
  { name: 'Roster', path: '/admin/roster', icon: Users },
];

/**
 * AdminSidebar Component
 * 
 * Renders the responsive sidebar navigation for the Admin dashboard.
 * On desktop, it is a persistent sidebar. On mobile, it acts as a slide-out drawer
 * with a hamburger menu toggle.
 * 
 * @param {{ name: string, email: string }} user - The currently authenticated admin user.
 */
export function AdminSidebar({ user }: { user: { name: string, email: string } }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on path change (mobile)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Hexagon className="w-6 h-6 text-[var(--accent-primary)]" />
          <span className="font-sans font-semibold text-base text-[var(--text-primary)]">Admin</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="relative h-full">
          {/* Sidebar Content */}
          <div className="flex flex-col h-full bg-[var(--bg-secondary)] w-[260px] border-r border-[var(--border-subtle)]">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-[var(--border-subtle)] gap-3 shrink-0">
              <Hexagon className="w-7 h-7 text-[var(--accent-primary)]" />
              <span className="font-sans font-semibold text-lg text-[var(--text-primary)]">CoreOnyx</span>
              <span className="bg-[var(--accent-muted)] text-[var(--accent-primary)] text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ml-auto">
                Admin
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {LINKS.map((link) => {
                const isActive = pathname.startsWith(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-[var(--accent-muted)] text-[var(--accent-primary)] pl-5'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:pl-5'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_8px_var(--accent-glow)]')} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-[var(--border-subtle)] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent-primary)] font-bold shrink-0">
                    {user.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                  </div>
                <ThemeToggle />
              </div>
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full mt-4 block">
                <div className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--status-urgent)] bg-[var(--status-urgent-bg)] rounded-xl hover:bg-[var(--status-urgent)]/20 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          {isOpen && (
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden absolute top-4 -right-12 p-2 bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)]"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
