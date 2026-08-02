import { signOut } from '@/lib/auth';

/**
 * API Route Handler for forced logout.
 * Used to immediately terminate sessions for blocked or deleted users.
 */
export async function GET() {
  await signOut({ redirectTo: '/login' });
}
