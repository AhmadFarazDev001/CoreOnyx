'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Safe fallback to prevent hydration mismatch while theme loads
  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] animate-pulse" />;
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        toggleTheme();
      }}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer select-none touch-manipulation"
      aria-label="Toggle theme"
      role="button"
      tabIndex={0}
    >
      <Sun 
        className={`absolute w-5 h-5 transition-all duration-300 pointer-events-none ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} 
      />
      <Moon 
        className={`absolute w-5 h-5 transition-all duration-300 pointer-events-none ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} 
      />
    </div>
  );
}
