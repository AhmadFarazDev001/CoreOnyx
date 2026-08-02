import { getSolutions } from '@/lib/actions/solutions';
import { AdminSolutionsClient } from './AdminSolutionsClient';

/**
 * Server Component for the Admin Solutions Dashboard.
 * Fetches published coding solutions and hydrates the client management UI.
 */
export default async function AdminSolutionsPage() {
  const solutions = await getSolutions();
  
  return <AdminSolutionsClient solutions={solutions} />;
}
