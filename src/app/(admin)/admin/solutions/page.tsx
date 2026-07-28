import { getSolutions } from '@/lib/actions/solutions';
import { AdminSolutionsClient } from './AdminSolutionsClient';

export default async function AdminSolutionsPage() {
  const solutions = await getSolutions();
  
  return <AdminSolutionsClient solutions={solutions} />;
}
