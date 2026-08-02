'use client';

import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addEmailToWhitelist } from '@/lib/actions/roster';

/**
 * Client component modal for manually adding a student to the whitelist.
 * Allows admins to bypass the CSV upload for single-student additions.
 */
export function AddStudentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      await addEmailToWhitelist(email);
      setIsOpen(false);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="gap-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white"
      >
        <UserPlus className="w-4 h-4" /> Add Student
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Add Student</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-[var(--status-urgent-bg)] border border-[var(--status-urgent)]/30 text-[var(--status-urgent)] text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Student Email
                </label>
                <Input 
                  type="email"
                  placeholder="student@nu.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  This email will be whitelisted so the student can log in.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !email}
                  className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white"
                >
                  {loading ? 'Adding...' : 'Add Student'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
