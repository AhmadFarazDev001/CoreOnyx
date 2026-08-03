'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Upload, X, FileText } from 'lucide-react';
import { createDispute, uploadFileToBlob } from '@/lib/actions/disputes';
import imageCompression from 'browser-image-compression';

interface CompressedFile {
  file: File;
  originalSize: number;
  compressedSize: number;
  previewUrl: string;
}

/**
 * NewDisputeModal Component
 * 
 * Renders a modal form for students to create a new grading dispute ticket.
 * It automatically compresses uploaded images on the client side before uploading 
 * to Vercel Blob storage, saving bandwidth and storage costs.
 * 
 * @param {boolean} isOpen - Controls the visibility of the modal.
 * @param {function} onClose - Callback function when the modal requests to be closed.
 */
export function NewDisputeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  const [rationale, setRationale] = useState('');
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsCompressing(true);
      const newFiles = Array.from(e.target.files);
      const processed: CompressedFile[] = [];
      
      for (const file of newFiles) {
        if (file.type.startsWith('image/')) {
          if (file.size > 20 * 1024 * 1024) {
            setError(`File ${file.name} is larger than 20MB`);
            continue;
          }
          try {
            const options = { maxSizeMB: 1.5, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedBlob = await imageCompression(file, options);
            const compressedFile = new File([compressedBlob], file.name, { type: file.type });
            processed.push({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              previewUrl: URL.createObjectURL(compressedFile)
            });
          } catch (error) {
            console.error('Error compressing image', error);
            processed.push({
              file: file,
              originalSize: file.size,
              compressedSize: file.size,
              previewUrl: URL.createObjectURL(file)
            });
          }
        } else {
          setError(`File ${file.name} is not a supported image format.`);
        }
      }
      
      setFiles((prev) => [...prev, ...processed]);
      setIsCompressing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !assessmentName.trim() || !rationale.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Upload files to Vercel Blob if any
      const uploadedUrls: string[] = [];
      
      for (const item of files) {
        const formData = new FormData();
        formData.append('file', item.file);
        const url = await uploadFileToBlob(formData);
        uploadedUrls.push(url);
      }

      await createDispute({
        subject,
        assessmentName,
        rationale,
        attachments: uploadedUrls,
      });
      
      // Reset form
      setSubject('');
      setAssessmentName('');
      setRationale('');
      setFiles([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit dispute ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Open a Dispute Ticket" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-[var(--status-urgent-bg)] text-[var(--status-urgent)] rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Assessment Name <span className="text-[var(--status-urgent)]">*</span>
            </label>
            <Input
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              placeholder="e.g. Midterm, Quiz 1, Lab 3"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Subject <span className="text-[var(--status-urgent)]">*</span>
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Question 4 was marked incorrect but matches solution"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Rationale / Description <span className="text-[var(--status-urgent)]">*</span>
            </label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Please explain in detail why you believe your grade is incorrect..."
              className="w-full h-32 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Attachments (Optional)
          </label>
          <div className="p-4 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-subtle)] border-dashed flex flex-col items-center justify-center gap-3 relative hover:bg-[var(--bg-tertiary)] transition-colors">
            <Upload className="w-5 h-5 text-[var(--text-muted)]" />
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">Click to upload or drag and drop</p>
              <p className="text-xs text-[var(--text-secondary)]">PNG, JPG up to 20MB</p>
            </div>
            <input 
              type="file" 
              multiple 
              accept=".png,.jpg,.jpeg" 
              onChange={handleFileChange}
              disabled={isSubmitting || isCompressing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          {isCompressing && (
            <div className="mt-2 text-sm text-[var(--accent-primary)] animate-pulse flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin"></span>
              Compressing images...
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {item.previewUrl ? (
                      <div className="w-10 h-10 shrink-0 rounded border border-[var(--border-subtle)] overflow-hidden">
                        <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 shrink-0 rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-[var(--text-primary)] truncate">{item.file.name}</span>
                      <div className="flex items-center gap-2 text-xs">
                        {item.originalSize !== item.compressedSize ? (
                          <>
                            <span className="line-through text-[var(--text-muted)]">{(item.originalSize / 1024).toFixed(1)} KB</span>
                            <span className="text-[var(--status-success)]">{(item.compressedSize / 1024).toFixed(1)} KB</span>
                          </>
                        ) : (
                          <span className="text-[var(--text-muted)]">{(item.originalSize / 1024).toFixed(1)} KB</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFile(i)}
                    disabled={isSubmitting}
                    className="p-2 shrink-0 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--status-urgent)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
