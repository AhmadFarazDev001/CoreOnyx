'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Code2, Trash2, X, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { createSolution, deleteSolution } from '@/lib/actions/solutions';
import { Solution, Annotation } from '@/lib/types';

/**
 * Client component for managing code solutions.
 * Provides a UI for publishing, formatting, and deleting golden solutions for lab assignments.
 */
export function AdminSolutionsClient({ 
  solutions,
  viewers
}: { 
  solutions: Solution[];
  viewers: React.ReactNode[];
}) {
  const [title, setTitle] = useState('');
  const [labNumber, setLabNumber] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [type, setType] = useState('Quiz');
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
        type: type,
        labNumber: parseInt(labNumber),
        language: language,
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
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Merge Sort Implementation"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--text-primary)]"
                    >
                      <option value="Lab">Lab</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Assignment">Assignment</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{type} #</label>
                    <Input 
                      type="number"
                      value={labNumber}
                      onChange={(e) => setLabNumber(e.target.value)}
                      placeholder="e.g. 4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-4 lg:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--text-primary)]"
                    >
                      <option value="cpp">C++</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="rust">Rust</option>
                      <option value="c">C</option>
                      <option value="csharp">C#</option>
                      <option value="text">Pseudocode / Text</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-[var(--text-secondary)]">Source Code</label>
                    <button 
                      type="button"
                      onClick={() => setCode(formatCode(code))}
                      className="text-xs text-[var(--accent-primary)] hover:underline"
                      disabled={language !== 'cpp'}
                    >
                      {language === 'cpp' ? 'Auto-Format Code' : ''}
                    </button>
                  </div>
                  <div className="relative">
                    <Textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={`Paste ${language === 'cpp' ? 'C++' : language === 'text' ? 'Pseudocode' : language} code here...`}
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
            <div className="grid grid-cols-1 gap-6">
              {solutions.map((solution, i) => (
                <ExpandableSolutionCard 
                  key={solution.id} 
                  solution={solution} 
                  deletingId={deletingId} 
                  handleDelete={handleDelete}
                  codeViewer={viewers[i]} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpandableSolutionCard({ 
  solution, 
  deletingId, 
  handleDelete,
  codeViewer 
}: { 
  solution: Solution & { type?: string }; 
  deletingId: string | null; 
  handleDelete: (id: string) => void;
  codeViewer: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="flex flex-col relative group overflow-hidden border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
      {/* Clickable Header */}
      <div 
        className="p-5 flex justify-between items-start cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <span className="text-xs font-bold text-[var(--accent-primary)] tracking-wider uppercase">
            {solution.type || 'Quiz'} {solution.labNumber}
          </span>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-1">{solution.title}</h3>
          <div className="mt-2 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span className="capitalize">{solution.language}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(solution.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(solution.id);
            }}
            disabled={deletingId === solution.id}
            className="p-2 bg-[var(--bg-primary)] border border-[var(--status-urgent)] text-[var(--status-urgent)] rounded-full transition-opacity disabled:opacity-50 hover:bg-[var(--status-urgent)] hover:text-white"
            title="Delete Solution"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronDown className={cn("w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300", isOpen && "rotate-180")} />
        </div>
      </div>

      {/* Expandable Body */}
      <div 
        className={cn(
          "grid transition-all duration-500 ease-in-out border-t border-[var(--border-subtle)]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-5 space-y-6">
            {codeViewer}
          </div>
        </div>
      </div>
    </Card>
  );
}
