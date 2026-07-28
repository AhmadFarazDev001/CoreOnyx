'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { deleteGradeRecord } from '@/lib/actions/grades';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GradeTable } from '@/components/grades/GradeTable';

/**
 * AdminRosterRow Component
 * 
 * Renders a single row in the Admin Dashboard Grades roster table.
 * It displays student information, their total grade, and allows the admin to expand
 * the row to see a detailed grade breakdown (via GradeTable) or delete the student's
 * grade records entirely.
 * 
 * @param {any} record - The aggregated grade data for a single student.
 * @param {number} index - The row index (used for alternating row colors).
 * @param {number} percentage - The calculated total percentage score.
 * @param {string} letter - The calculated letter grade.
 * @param {string} gradeColor - The CSS color class string for the letter grade badge.
 */
export function AdminRosterRow({ 
  record, 
  index, 
  percentage, 
  letter, 
  gradeColor 
}: { 
  record: any;
  index: number;
  percentage: number;
  letter: string;
  gradeColor: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGradeRecord(record.studentEmail);
      setIsDeleteModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <tr 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`hover:bg-[var(--bg-tertiary)]/50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-secondary)]/30'}`}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="font-medium text-[var(--text-primary)]">{record.studentName}</div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{record.studentEmail}</td>
        <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">
          {record.totalAbsScore} <span className="text-[var(--text-muted)] font-normal text-xs">/ {record.totalAbsMax}</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="neutral" className={`font-bold ${gradeColor}`}>
              {letter} ({percentage}%)
            </Badge>
            <button 
              onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
              disabled={isDeleting}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--status-urgent)] hover:bg-[var(--status-urgent-bg)] rounded-md transition-colors disabled:opacity-50"
              title="Delete Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-[var(--bg-tertiary)]/10">
          <td colSpan={4} className="p-4 border-b border-[var(--border-subtle)]">
            <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-sm">
              <GradeTable record={record} hideHeader />
            </div>
          </td>
        </tr>
      )}
      
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Grade Record"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Are you sure you want to completely remove all grade data for <strong>{record.studentEmail}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={executeDelete}
              disabled={isDeleting}
              className="!bg-[var(--status-urgent)] hover:!bg-red-600 !text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Record'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
