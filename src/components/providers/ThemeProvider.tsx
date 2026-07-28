'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to dark, but we will sync with localStorage immediately on mount
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // 1. Check local storage
    const storedTheme = window.localStorage.getItem('coreonyx-theme') as Theme | null;
    
    // 2. If stored, use it. Else default to dark.
    const initialTheme = storedTheme || 'dark';
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    window.localStorage.setItem('coreonyx-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Prevent hydration mismatch by returning a hidden shell or nothing until mounted,
  // but since we want the page to render instantly, we render children always.
  // The inline script in layout.tsx will handle the HTML attribute FOUC.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
