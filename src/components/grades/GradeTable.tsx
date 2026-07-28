import { GradeRecord } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { GraduationCap } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

/**
 * GradeTable Component
 * 
 * Displays a detailed breakdown of a student's grades across all their assessments.
 * Used on the student dashboard as well as expanded inside the Admin Roster.
 * 
 * @param {GradeRecord} record - The full grade record object for the student.
 * @param {boolean} hideHeader - If true, hides the "Your Grades" title (used in admin view).
 */
export function GradeTable({ record, hideHeader = false }: { record?: GradeRecord, hideHeader?: boolean }) {
  if (!record) {
    return (
      <Card className="mt-8 animate-page-in">
        <EmptyState
          icon={GraduationCap}
          title="Your Grades"
          description="Grades will appear here once your TA uploads them."
        />
      </Card>
    );
  }

  const assessmentsObj = (record.assessments as Record<string, { score: number, max: number, absMax: number, absScore: number }>) || {};
  
  const assessments = Object.entries(assessmentsObj).map(([name, data]) => ({
    name,
    score: Number(data.score),
    max: Number(data.max),
    absMax: Number(data.absMax),
    absScore: Number(data.absScore)
  }));

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-[var(--status-success)]';
    if (percentage >= 60) return 'text-[var(--status-warning)]';
    return 'text-[var(--status-urgent)]';
  };

  return (
    <Card className="mt-8 animate-page-in overflow-hidden p-0">
      {!hideHeader && (
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Grades</h2>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Assessment</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Max</th>
              <th className="px-5 py-3 font-medium">Percentage</th>
              <th className="px-5 py-3 font-medium">ABS Earned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {assessments.map((a, i) => {
              const percentage = Math.round((a.score / a.max) * 100);
              return (
                <tr key={a.name} className={i % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-secondary)]/50'}>
                  <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{a.name}</td>
                  <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{a.score}</td>
                  <td className="px-5 py-3 text-sm text-[var(--text-muted)]">{a.max}</td>
                  <td className={`px-5 py-3 text-sm font-semibold ${getPercentageColor(percentage)}`}>
                    {percentage}%
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-[var(--accent-primary)]">
                    {a.absScore} / {a.absMax}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-[var(--bg-tertiary)]/50 border-t-2 border-[var(--accent-primary)]">
              <td colSpan={4} className="px-5 py-4 text-base font-bold text-[var(--text-primary)] text-right">Total ABS:</td>
              <td className="px-5 py-4 text-base font-bold text-[var(--accent-primary)]">
                {record.totalAbsScore} / {record.totalAbsMax}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
