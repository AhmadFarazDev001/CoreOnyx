import { redirect } from 'next/navigation';

/**
 * Admin root index route.
 * Redirects admin users to the primary dashboard.
 */
export default function AdminRootRedirect() {
  redirect('/admin/dashboard');
}
