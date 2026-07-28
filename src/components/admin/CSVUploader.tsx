'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * CSVUploader Component
 * 
 * Provides an interface for admins to bulk-upload student grades via a CSV file.
 * It parses the CSV in the browser using PapaParse, displays a preview of the first 5 rows,
 * and uploads the file to the backend processing API via FormData.
 */
export function CSVUploader() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
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
          setParsedData(results.data.slice(0, 5)); // Preview first 5 rows
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
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/grades/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      alert(data.message || 'Grades uploaded successfully!');
      setIsOpen(false);
      handleReset();
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      console.error(err);
      alert('Error uploading grades: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button variant="primary" className="gap-2" onClick={() => setIsOpen(true)}>
        <Upload className="w-4 h-4" />
        Upload Grades
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Upload Grades via CSV" className="max-w-2xl">
        {!file ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[var(--border-default)] rounded-xl bg-[var(--bg-tertiary)]/50">
            <div className="w-12 h-12 bg-[var(--accent-muted)] rounded-full flex items-center justify-center mb-4 text-[var(--accent-primary)]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Select CSV File</h3>
            <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm mb-6">
              Upload a CSV file containing student emails and grades. The first row must be the header.
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
                <FileSpreadsheet className="w-8 h-8 text-[var(--status-info)]" />
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{file.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Badge variant="success" icon>Parsed successfully</Badge>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Data Preview (First 5 rows)</h4>
              <div className="border border-[var(--border-subtle)] rounded-xl overflow-x-auto bg-[var(--bg-secondary)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    <tr>
                      {parsedData.length > 0 && Object.keys(parsedData[0]).map(key => (
                        <th key={key} className="px-4 py-2 font-medium whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {parsedData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="px-4 py-2 text-[var(--text-primary)] whitespace-nowrap">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Button variant="ghost" onClick={handleReset} disabled={isProcessing}>Cancel</Button>
              <Button variant="primary" onClick={handleUpload} disabled={isProcessing}>
                {isProcessing ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
