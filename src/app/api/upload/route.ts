import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  // Strict CSRF Protection for API Route
  const origin = request.headers.get('origin');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (!origin || origin !== appUrl) {
    return NextResponse.json({ error: 'CSRF rejected' }, { status: 403 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth();
        
        if (!session?.user || session.user.role !== 'ADMIN') {
          throw new Error('Unauthorized');
        }

        // Return user info so it can be stored in the blob's metadata if needed
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'text/plain',
            'text/csv',
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            role: session.user.role,
          }),
        };
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to authorize upload' },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
