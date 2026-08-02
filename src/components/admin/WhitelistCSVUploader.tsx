'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * WhitelistCSVUploader Component
 * 
 * Provides an interface for admins to bulk-add student emails to the whitelist via CSV.
 * Uses PapaParse to read the CSV on the client side and extracts valid email addresses
 * before sending them to the backend API.
 */
export function WhitelistCSVUploader() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsProcessing(true);
      
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Extract email addresses using common header names or fallback pattern matching
          const emails = results.data.map((row: any) => {
            if (row['Email']) return row['Email'];
            if (row['email']) return row['email'];
            // Fallback: locate the first string containing an '@' symbol
            const values = Object.values(row) as string[];
            return values.find(v => typeof v === 'string' && v.includes('@'));
          }).filter(Boolean) as string[];

          setParsedEmails(emails);
          setIsProcessing(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setIsProcessing(false);
        }
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedEmails([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || parsedEmails.length === 0) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/whitelist/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emails: parsedEmails }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      alert(data.message || `Successfully added ${data.addedCount} new emails to the whitelist!`);
      setIsOpen(false);
      handleReset();
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      console.error(err);
      alert('Error uploading whitelist: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button variant="primary" className="gap-2" onClick={() => setIsOpen(true)}>
        <Upload className="w-4 h-4" />
        Upload Whitelist
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Upload Whitelist via CSV" className="max-w-xl">
        {!file ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[var(--border-default)] rounded-xl bg-[var(--bg-tertiary)]/50">
            <div className="w-12 h-12 bg-[var(--accent-muted)] rounded-full flex items-center justify-center mb-4 text-[var(--accent-primary)]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Select CSV File</h3>
            <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm mb-6">
              Upload a CSV file containing a column named "Email" or "email".
            </p>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Browse Files
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[var(--status-info)]" />
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{file.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Found {parsedEmails.length} valid emails</p>
                </div>
              </div>
              <Badge variant="success" icon>Parsed successfully</Badge>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Data Preview (First 5 emails)</h4>
              <div className="border border-[var(--border-subtle)] rounded-xl overflow-x-auto bg-[var(--bg-secondary)]">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {parsedEmails.slice(0, 5).map((email, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Button variant="ghost" onClick={handleReset} disabled={isProcessing}>Cancel</Button>
              <Button variant="primary" onClick={handleUpload} disabled={isProcessing || parsedEmails.length === 0}>
                {isProcessing ? 'Importing...' : 'Add to Whitelist'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
