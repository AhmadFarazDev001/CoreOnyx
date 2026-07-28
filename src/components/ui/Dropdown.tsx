'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    // Bind to both mouse and touch for mobile compatibility
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div 
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer select-none touch-manipulation"
        role="button"
        tabIndex={0}
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[200px] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-xl shadow-black/30',
            align === 'right' ? 'right-0' : 'left-0',
            'animate-page-in',
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  danger?: boolean;
}

export function DropdownItem({ className, danger, ...props }: DropdownItemProps) {
  return (
    <div
      className={cn(
        'px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)]',
        danger ? 'text-[var(--status-urgent)]' : 'text-[var(--text-primary)]',
        className
      )}
      {...props}
    />
  );
}
