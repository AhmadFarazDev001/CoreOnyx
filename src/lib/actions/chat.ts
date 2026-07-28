"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { threadSchema, messageSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

export async function getThreads(type?: "PUBLIC" | "PRIVATE") {
  const { session } = await requireAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};
  if (type) {
    whereClause.type = type;
  }

  // If PRIVATE, a STUDENT can only see their own threads.
  // ADMIN can see all PRIVATE threads.
  if (session.user.role !== "ADMIN") {
    whereClause.OR = [
      { type: "PUBLIC" },
      {
        type: "PRIVATE",
        participants: {
          some: { userId: session.user.id },
        },
      }
    ];
  }

  const threads = await prisma.chatThread.findMany({
    where: whereClause,
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true, role: true } }
        }
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, image: true, role: true } }
        }
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return threads.map(thread => {
    // Find this user's participant record
    const participantRecord = thread.participants.find(p => p.userId === session.user.id);
    const lastReadAt = participantRecord?.lastReadAt || new Date(0);

    // Count messages created after lastReadAt that are NOT from the current user
    const unreadCount = thread.messages.filter(m => 
      m.senderId !== session.user.id && new Date(m.createdAt) > new Date(lastReadAt)
    ).length;

    return {
      ...thread,
      participants: thread.participants.map(p => p.user),
      lastMessage: thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : undefined,
      unreadCount
    };
  });
}

export async function createThread(data: { title: string; type: "PUBLIC" | "PRIVATE"; participantUserId?: string }) {
  const { session } = await requireAuth();
  const validated = threadSchema.parse(data);

  const participants = [{ userId: session.user.id }];
  if (validated.participantUserId && validated.participantUserId !== session.user.id) {
    participants.push({ userId: validated.participantUserId });
  }

  const thread = await prisma.chatThread.create({
    data: {
      title: validated.title,
      type: data.type,
      participants: {
        create: participants,
      },
    },
  });

  revalidatePath("/qna");
  revalidatePath("/admin/qna");
  return thread;
}

export async function sendMessage(threadId: string, content: string, isCodeSnippet: boolean = false) {
  const { session } = await requireAuth();
  
  if (!checkRateLimit(session.user.id, "sendMessage", 20, 60000)) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  const validated = messageSchema.parse({ threadId, content, isCodeSnippet });

  const thread = await prisma.chatThread.findUnique({
    where: { id: validated.threadId },
    include: { participants: true }
  });
  if (!thread) throw new Error("Thread not found");

  const isParticipant = thread.participants.some(p => p.userId === session.user.id);
  const isPublic = thread.type === "PUBLIC";
  if (!isParticipant && !isPublic && session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const message = await prisma.chatMessage.create({
    data: {
      threadId: validated.threadId,
      senderId: session.user.id,
      content: validated.content,
      isCodeSnippet: validated.isCodeSnippet ?? false,
    },
    include: {
      sender: { select: { id: true, name: true, image: true, role: true } },
    },
  });

  // Update thread updatedAt
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/qna");
  revalidatePath("/admin/qna");
  return message;
}

export async function convertToFAQ(threadId: string) {
  await requireAdmin();

  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      isFAQ: true,
      type: "PUBLIC", // Ensure it's public if it's an FAQ
    },
  });

  revalidatePath("/qna");
  revalidatePath("/admin/qna");
  return { success: true };
}

export async function resolveThread(threadId: string) {
  await requireAdmin();

  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      isResolved: true,
    },
  });

  revalidatePath("/qna");
  revalidatePath("/admin/qna");
  return { success: true };
}

export async function deleteThread(threadId: string) {
  await requireAdmin();

  await prisma.chatThread.delete({
    where: { id: threadId },
  });

  revalidatePath("/qna");
  revalidatePath("/admin/qna");
  return { success: true };
}

export async function getChatUsers() {
  const { session, dbUser } = await requireAuth();
  if (dbUser.role !== "ADMIN") return [];
  
  return await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true }
  });
}

export async function markThreadAsRead(threadId: string) {
  const { session } = await requireAuth();

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { participants: true }
  });
  if (!thread) return { success: false };

  const isParticipant = thread.participants.some(p => p.userId === session.user.id);
  const isPublic = thread.type === "PUBLIC";
  if (!isParticipant && !isPublic && session.user.role !== "ADMIN") {
    return { success: false };
  }

  try {
    await prisma.threadParticipant.upsert({
      where: {
        threadId_userId: {
          threadId,
          userId: session.user.id
        }
      },
      update: { lastReadAt: new Date() },
      create: {
        threadId,
        userId: session.user.id,
        lastReadAt: new Date()
      }
    });
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to mark thread as read:", error);
    return { success: false };
  }
}
