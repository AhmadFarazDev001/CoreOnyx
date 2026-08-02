"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { sanitizeAnnouncementHtml } from "@/lib/sanitize";
import { announcementSchema } from "@/lib/validations";

/**
 * Fetches all announcements from the database.
 * Requires authentication. Sorts by pinned status first, then by creation date.
 * Sanitizes the HTML body before returning.
 */
export async function getAnnouncements() {
  await requireAuth();

  const announcements = await prisma.announcement.findMany({
    include: {
      author: {
        select: { id: true, name: true, image: true, role: true }
      },
    },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
  });

  return announcements.map((a) => ({
    ...a,
    body: sanitizeAnnouncementHtml(a.body),
  }));
}

/**
 * Creates a new announcement.
 * Requires ADMIN role. Validates and sanitizes the input body.
 */
export async function createAnnouncement(data: { title: string; body: string; priority: "NORMAL" | "URGENT"; isPinned: boolean }) {
  const { session } = await requireAdmin();

  const validated = announcementSchema.parse(data);

  const sanitizedBody = sanitizeAnnouncementHtml(validated.body);

  await prisma.announcement.create({
    data: {
      title: validated.title,
      body: sanitizedBody,
      priority: validated.priority,
      isPinned: validated.isPinned,
      authorId: session.user.id,
    },
  });

  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { success: true };
}

/**
 * Toggles the pinned status of an announcement.
 * Requires ADMIN role.
 */
export async function togglePin(id: string, isPinned: boolean) {
  await requireAdmin();

  await prisma.announcement.update({
    where: { id },
    data: { isPinned },
  });

  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { success: true };
}

/**
 * Deletes an announcement by ID.
 * Requires ADMIN role.
 */
export async function deleteAnnouncement(id: string) {
  await requireAdmin();

  await prisma.announcement.delete({
    where: { id },
  });

  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { success: true };
}
