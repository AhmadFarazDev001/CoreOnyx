import { NextResponse } from 'next/server';
import { bulkAddEmails } from '@/lib/actions/roster';
import { auth } from '@/lib/auth';

/**
 * API Route Handler for bulk whitelist uploads via CSV.
 * Validates admin role and CSRF headers before calling the bulkAddEmails action.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Robust CSRF Protection for API Route (works locally and on Vercel)
    const origin = request.headers.get('origin');
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let isValidOrigin = false;
    if (origin) {
      const originHost = new URL(origin).host;
      if (origin === appUrl || originHost === host) {
        isValidOrigin = true;
      }
    }

    if (!isValidOrigin) {
      return NextResponse.json({ error: 'CSRF rejected' }, { status: 403 });
    }

    const body = await request.json();
    const emails = body.emails as string[];
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
    }

    const result = await bulkAddEmails(emails);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${result.addedCount} new emails to the whitelist!`,
      addedCount: result.addedCount
    });
    
  } catch (error: any) {
    console.error('Whitelist CSV Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process whitelist CSV' },
      { status: 500 }
    );
  }
}
