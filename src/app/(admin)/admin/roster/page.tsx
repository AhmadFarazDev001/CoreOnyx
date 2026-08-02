import { getAllGrades } from '@/lib/actions/grades';
import { Card } from '@/components/ui/Card';
import { CSVUploader } from '@/components/admin/CSVUploader';
import { AddStudentModal } from '@/components/admin/AddStudentModal';
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AdminRosterRow } from '@/components/admin/AdminRosterRow';

/**
 * Server Component for the Admin Roster Dashboard.
 * Displays student grades, allows CSV uploads, and manual student additions.
 */
export default async function AdminRosterPage() {
  const grades = await getAllGrades();
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-[var(--status-success)]';
    if (percentage >= 80) return 'text-[var(--status-info)]';
    if (percentage >= 70) return 'text-[var(--status-warning)]';
    return 'text-[var(--status-urgent)]';
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 86) return 'A-';
    if (percentage >= 82) return 'B+';
    if (percentage >= 78) return 'B';
    if (percentage >= 74) return 'B-';
    if (percentage >= 70) return 'C+';
    if (percentage >= 66) return 'C';
    if (percentage >= 62) return 'C-';
    if (percentage >= 58) return 'D+';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-page-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Roster Management</h1>
          <p className="text-[var(--text-secondary)]">Manage enrolled students and upload batch grades.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <CSVUploader />
          <AddStudentModal />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-tertiary)]/30">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <Input className="pl-10 h-9" placeholder="Search by name or email..." />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="h-9 w-full sm:w-auto gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Total ABS</th>
                <th className="px-6 py-4 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {grades.map((record, i) => {
                const max = record.totalAbsMax > 0 ? record.totalAbsMax : 1;
                const percentage = Math.round((record.totalAbsScore / max) * 100);
                const letter = getLetterGrade(percentage);
                const gradeColor = getGradeColor(percentage);
                
                return (
                  <AdminRosterRow 
                    key={record.id}
                    record={record}
                    index={i}
                    percentage={percentage}
                    letter={letter}
                    gradeColor={gradeColor}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30 flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>Showing 1 to {grades.length} of {grades.length} students</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled>Previous</Button>
            <Button variant="ghost" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
