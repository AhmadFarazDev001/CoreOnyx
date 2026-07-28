import { Solution } from '@/lib/types';
import { codeToHtml } from 'shiki';
import { ConsoleOutput } from './ConsoleOutput';

export async function CodeViewer({ solution }: { solution: Solution }) {
  // Server-side syntax highlighting
  const html = await codeToHtml(solution.code, {
    lang: solution.language,
    theme: 'github-dark', // Dark theme as required
  });

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-[var(--editor-bg)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-lg animate-page-in">
      <div className="flex items-center px-4 py-3 border-b border-[var(--editor-gutter)] bg-[var(--bg-secondary)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Quiz {solution.labNumber}: {solution.title}
        </h2>
      </div>

      <div className="flex-1 overflow-auto relative min-w-max">
        <div 
          className="shiki-container font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <ConsoleOutput output={solution.consoleOutput} />
    </div>
  );
}
