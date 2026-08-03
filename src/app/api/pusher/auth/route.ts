import { NextRequest, NextResponse } from 'next/server';
import { pusher } from '@/lib/pusher';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { session } = await requireAuth();

    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return new NextResponse('Missing socket_id or channel_name', { status: 400 });
    }

    // Extract thread ID from channel name (format: private-chat-thread-[ID])
    const threadId = channelName.replace('private-chat-thread-', '');

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: { participants: true },
    });

    if (!thread) {
      return new NextResponse('Thread not found', { status: 404 });
    }

    const isParticipant = thread.participants.some(p => p.userId === session.user.id);
    const isPublic = thread.type === 'PUBLIC';
    
    // Only admins, participants, or anyone for a public thread can subscribe
    if (!isParticipant && !isPublic && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return new NextResponse('Unauthorized', { status: 401 });
  }
}
