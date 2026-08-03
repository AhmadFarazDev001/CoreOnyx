import { getAllGrades } from '@/lib/actions/grades';
import { Card } from '@/components/ui/Card';
import { CSVUploader } from '@/components/admin/CSVUploader';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminRosterRow } from '@/components/admin/AdminRosterRow';
import { SearchInput } from '@/components/shared/SearchInput';

/**
 * Server Component for the Admin Grades Dashboard.
 * Displays student grades and allows CSV uploads.
 */
export default async function AdminGradesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || '').toLowerCase();
  
  let grades = await getAllGrades();
  
  if (query) {
    grades = grades.filter(g => 
      (g.studentName && g.studentName.toLowerCase().includes(query)) ||
      (g.studentEmail && g.studentEmail.toLowerCase().includes(query))
    );
  }
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Grades Management</h1>
          <p className="text-[var(--text-secondary)]">Manage enrolled students' grades and upload batch updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <CSVUploader />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-tertiary)]/30">
          <div className="w-full sm:w-72">
            <SearchInput placeholder="Search by name or email..." />
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
