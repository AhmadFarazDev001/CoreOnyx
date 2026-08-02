'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Code2, Trash2, X } from 'lucide-react';
import { createSolution, deleteSolution } from '@/lib/actions/solutions';
import { Solution, Annotation } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

/**
 * Client component for managing code solutions.
 * Provides a UI for publishing, formatting, and deleting golden solutions for lab assignments.
 */
export function AdminSolutionsClient({ solutions }: { solutions: Solution[] }) {
  const [title, setTitle] = useState('');
  const [labNumber, setLabNumber] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Smart formatter for C++ code
  const formatCode = (rawCode: string) => {
    let indentLevel = 0;
    const rawLines = rawCode.replace(/\t/g, '    ').split('\n');
    const formattedLines = [];

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i].trim();
      if (!line) {
        formattedLines.push('');
        continue;
      }
      
      // Decrease indent if line starts with closing brace
      if (line.match(/^}/)) {
        indentLevel = Math.max(0, indentLevel - 1);
      } else if (line.match(/^(public:|private:|protected:)/)) {
        // access specifiers usually indented one level less
        formattedLines.push('    '.repeat(Math.max(0, indentLevel - 1)) + line);
        continue;
      }

      formattedLines.push('    '.repeat(indentLevel) + line);

      // Increase indent for next lines if this line contains unmatched opening braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      indentLevel += (openBraces - closeBraces);
      indentLevel = Math.max(0, indentLevel);
    }

    return formattedLines.join('\n').trim();
  };

  const handlePublish = async () => {
    if (!title || !labNumber || !code) return;
    
    setLoading(true);
    try {
      await createSolution({
        title,
        labNumber: parseInt(labNumber),
        language: 'cpp',
        code: code,
        consoleOutput: output,
      });
      setTitle('');
      setLabNumber('');
      setCode('');
      setOutput('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSolution(id);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Compose Section */}
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Publish Golden Solution</h1>
          <p className="text-[var(--text-secondary)]">Share official lab solutions with annotated explanations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Solution Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Merge Sort Implementation"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Quiz #</label>
                    <Input 
                      type="number"
                      value={labNumber}
                      onChange={(e) => setLabNumber(e.target.value)}
                      placeholder="e.g. 4"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-[var(--text-secondary)]">Source Code (C++)</label>
                    <button 
                      type="button"
                      onClick={() => setCode(formatCode(code))}
                      className="text-xs text-[var(--accent-primary)] hover:underline"
                    >
                      Auto-Format Code
                    </button>
                  </div>
                  <div className="relative">
                    <Textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste C++ code here..."
                      className="min-h-[300px] font-mono text-sm bg-[var(--editor-bg)] text-[var(--text-primary)] leading-relaxed whitespace-pre"
                    />
                    <div className="absolute top-3 right-3 text-[var(--text-muted)]">
                      <Code2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Console Output</label>
                  <Textarea 
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    placeholder="$ g++ main.cpp -o main&#10;$ ./main&#10;Success."
                    className="min-h-[120px] font-mono text-sm bg-[var(--editor-bg)] text-[#8B949E]"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <Button 
                variant="primary" 
                className="w-full justify-center"
                onClick={handlePublish}
                disabled={loading || !title || !labNumber || !code}
              >
                {loading ? 'Publishing...' : 'Publish Solution'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Published Solutions Section */}
      <div className="pt-8 border-t border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Published Solutions</h2>
        <div className="flex flex-col gap-4">
          {solutions.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm">No solutions published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solutions.map((solution) => (
                <Card key={solution.id} className="p-5 flex flex-col relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-[var(--accent-primary)] tracking-wider uppercase">Quiz {solution.labNumber}</span>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-1">{solution.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(solution.id)}
                      disabled={deletingId === solution.id}
                      className="p-2 bg-[var(--bg-primary)] border border-[var(--status-urgent)] text-[var(--status-urgent)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-[var(--status-urgent)] hover:text-white"
                      title="Delete Solution"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                    <span>{formatDistanceToNow(new Date(solution.createdAt), { addSuffix: true })}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
