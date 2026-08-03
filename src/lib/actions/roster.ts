"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { emailWhitelistSchema, bulkEmailWhitelistSchema } from "@/lib/validations";
import { del } from '@vercel/blob';

/**
 * Retrieves the full list of whitelisted student emails.
 * Requires ADMIN role.
 */
export async function getWhitelistedEmails() {
  await requireAdmin();

  return prisma.whitelist.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Adds a single email to the whitelist.
 * Requires ADMIN role. Validates email format and ensures uniqueness.
 */
export async function addEmailToWhitelist(email: string) {
  await requireAdmin();
  const validated = emailWhitelistSchema.parse({ email });

  const existing = await prisma.whitelist.findUnique({
    where: { email: validated.email },
  });

  if (existing) {
    throw new Error("Email is already whitelisted");
  }

  const result = await prisma.whitelist.create({
    data: { email: validated.email },
  });

  revalidatePath("/admin/roster");
  return result;
}

/**
 * Removes an email from the whitelist.
 * Requires ADMIN role.
 */
export async function removeEmailFromWhitelist(email: string) {
  await requireAdmin();

  // Find user to cascade delete their records
  const user = await prisma.user.findUnique({
    where: { email },
    include: { disputes: true }
  });

  if (user) {
    // 1. Delete attachments from Vercel Blob
    const allAttachments = user.disputes.flatMap(d => d.attachments);
    if (allAttachments.length > 0) {
      try {
        await del(allAttachments);
      } catch (err) {
        console.error('Failed to delete blobs during user removal:', err);
      }
    }

    // 2. Delete all records sequentially in a transaction to respect foreign keys
    await prisma.$transaction([
      prisma.chatMessage.deleteMany({ where: { senderId: user.id } }),
      prisma.threadParticipant.deleteMany({ where: { userId: user.id } }),
      prisma.disputeTicket.deleteMany({ where: { studentId: user.id } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);
  }

  // 3. Delete GradeRecord (independent of User)
  await prisma.gradeRecord.deleteMany({ where: { studentEmail: email } });

  // 4. Finally, remove them from the Whitelist
  await prisma.whitelist.delete({
    where: { email },
  });

  revalidatePath("/admin/roster");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/qna");
  
  return { success: true };
}

/**
 * Bulk adds a list of emails to the whitelist.
 * Requires ADMIN role. Filters out already existing emails before inserting.
 */
export async function bulkAddEmails(emails: string[]) {
  await requireAdmin();
  const validated = bulkEmailWhitelistSchema.parse({ emails });

  const existing = await prisma.whitelist.findMany({
    where: { email: { in: validated.emails } },
    select: { email: true },
  });

  const existingEmails = new Set(existing.map((e) => e.email));
  const newEmails = validated.emails.filter((e) => !existingEmails.has(e));

  if (newEmails.length > 0) {
    await prisma.whitelist.createMany({
      data: newEmails.map((email) => ({ email })),
    });
  }

  revalidatePath("/admin/roster");
  return { success: true, addedCount: newEmails.length };
}

/**
 * Retrieves the full list of whitelisted emails, along with their login/onboarded status.
 * Requires ADMIN role.
 */
export async function getWhitelistWithStatus() {
  await requireAdmin();

  const whitelist = await prisma.whitelist.findMany({
    orderBy: { createdAt: "desc" },
  });

  const emails = whitelist.map(w => w.email);

  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true, onboarded: true, isBlocked: true },
  });

  // Map users by email for quick lookup
  const userMap = new Map(users.map(u => [u.email, u]));

  return whitelist.map(w => {
    const user = userMap.get(w.email);
    return {
      email: w.email,
      createdAt: w.createdAt,
      hasLoggedIn: !!user,
      isOnboarded: user?.onboarded ?? false,
      isBlocked: user?.isBlocked ?? false,
    };
  });
}
