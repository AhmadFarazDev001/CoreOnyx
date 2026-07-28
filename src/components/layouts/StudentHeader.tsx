'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { signOut } from 'next-auth/react';

import { LayoutDashboard, Code2, MessageCircle, AlertTriangle, LogOut, Megaphone, Hexagon } from 'lucide-react';

const TABS = [
  { name: 'Announcements', path: '/announcements', icon: Megaphone },
  { name: 'Grades', path: '/grades', icon: LayoutDashboard },
  { name: 'Solutions', path: '/solutions', icon: Code2 },
  { name: 'Q&A', path: '/qna', icon: MessageCircle },
  { name: 'Disputes', path: '/disputes', icon: AlertTriangle },
];

/**
 * StudentHeader Component
 * 
 * Renders the responsive top navigation bar for the Student dashboard.
 * On desktop, it displays tabs horizontally. On mobile, it displays a bottom navigation bar.
 * 
 * @param {{ name: string, email: string }} user - The currently authenticated student.
 */
export function StudentHeader({ user }: { user: { name: string, email: string } }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] px-4 md:px-6 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Hexagon className="w-7 h-7 text-[var(--accent-primary)] pointer-events-none select-none" />
          <span className="font-sans font-semibold text-lg text-[var(--text-primary)] pointer-events-none select-none">
            CoreOnyx
          </span>
        </div>

        {/* Center: Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-muted)] text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Dropdown
            trigger={
              <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-[var(--border-subtle)] pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-xs shrink-0 pointer-events-none">
                  {user.name[0]}
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-[var(--text-primary)] pointer-events-none select-none">
                  {user.name}
                </span>
              </div>
            }
          >
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] pointer-events-none select-none">
              <p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="block w-full text-left">
              <DropdownItem danger className="flex items-center gap-2 w-full">
                <LogOut className="w-4 h-4 pointer-events-none" />
                <span className="pointer-events-none select-none">Sign Out</span>
              </DropdownItem>
            </button>
          </Dropdown>
        </div>
      </header>

      {/* Mobile Nav (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[env(safe-area-inset-bottom,4rem)] min-h-16 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)] flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.1)]">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 pt-1 pb-[env(safe-area-inset-bottom,4px)] touch-manipulation select-none ${
                isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon className={`w-5 h-5 pointer-events-none ${isActive ? 'drop-shadow-[0_0_8px_var(--accent-glow)]' : ''}`} />
              <span className="text-[10px] font-medium pointer-events-none">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
