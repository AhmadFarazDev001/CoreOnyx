import { getSolutions } from '@/lib/actions/solutions';
import { AdminSolutionsClient } from './AdminSolutionsClient';
import { CodeViewer } from '@/components/solutions/CodeViewer';

/**
 * Server Component for the Admin Solutions Dashboard.
 * Fetches published coding solutions and hydrates the client management UI.
 */
export default async function AdminSolutionsPage() {
  const solutions = await getSolutions();
  
  const viewers = solutions.map(solution => (
    <CodeViewer key={solution.id} solution={solution as any} />
  ));

  return <AdminSolutionsClient solutions={solutions} viewers={viewers} />;
}
