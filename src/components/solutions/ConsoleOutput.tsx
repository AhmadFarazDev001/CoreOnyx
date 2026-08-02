'use client';

import { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Client component for rendering console output of code solutions.
 * Supports a collapsible accordion view with basic syntax highlighting for errors and prompt lines.
 * 
 * @param {string} output - The raw console output string.
 */
export function ConsoleOutput({ output }: { output: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = output.split('\n');

  return (
    <div className="flex flex-col border-t border-[var(--border-subtle)]">
      {/* Toggle Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between h-10 px-4 bg-[var(--editor-gutter)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <Terminal className="w-4 h-4" />
          <span>Console Output</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>

      {/* Terminal Content */}
      <div 
        className={cn(
          'bg-[var(--editor-bg)] font-mono text-sm overflow-auto whitespace-pre transition-all duration-300',
          isExpanded ? 'h-[200px] p-4' : 'h-0 p-0'
        )}
      >
        {lines.map((line, idx) => {
          let className = 'text-[#8B949E]'; // default
          if (line.startsWith('$')) {
            className = 'text-[var(--accent-primary)]';
          } else if (line.toLowerCase().includes('error')) {
            className = 'text-[var(--status-urgent)]';
          }
          return (
            <div key={idx} className={`min-h-[1.5rem] ${className}`}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
