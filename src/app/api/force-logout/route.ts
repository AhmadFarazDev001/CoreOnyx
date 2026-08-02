import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { signOut } from '@/lib/auth';

/**
 * API Route Handler for forced logout.
 * Used to immediately terminate sessions for blocked or deleted users.
 */
export async function GET() {
  try {
    await signOut({ redirectTo: '/login' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Let Next.js handle the normal redirect
    }
    
    console.error('Force logout DB/Auth error:', error);
    
    // If DB reset wiped the session, NextAuth might crash before clearing cookies.
    // We manually clear the known NextAuth cookies to break the error loop.
    const cookieStore = await cookies();
    cookieStore.delete('authjs.session-token');
    cookieStore.delete('authjs.callback-url');
    cookieStore.delete('authjs.csrf-token');
    
    // Also handle secure cookies if deployed
    cookieStore.delete('__Secure-authjs.session-token');
    cookieStore.delete('__Secure-authjs.callback-url');
    cookieStore.delete('__Host-authjs.csrf-token');

    redirect('/login');
  }
}
