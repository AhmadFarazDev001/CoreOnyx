import { getStudentGrades } from '@/lib/actions/grades';
import { GradeTable } from '@/components/grades/GradeTable';

/**
 * Server Component for the Student Grades page.
 * Fetches the authenticated student's grade records and displays them in a unified table.
 */
export default async function StudentGradesPage() {
  const studentGrades = await getStudentGrades();

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[calc(100vh-140px)] animate-page-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">My Grades</h1>
        <p className="text-[var(--text-secondary)]">Track your performance and assessment scores.</p>
      </div>

      <GradeTable record={studentGrades || undefined} />
    </div>
  );
}
