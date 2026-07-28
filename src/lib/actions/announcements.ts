"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { announcementSchema } from "@/lib/validations";

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

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);

  return announcements.map((a) => ({
    ...a,
    body: purify.sanitize(a.body, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "h2", "h3", "code", "pre"],
      ALLOWED_ATTR: ["href", "target", "rel"],
    }),
  }));
}

export async function createAnnouncement(data: { title: string; body: string; priority: "NORMAL" | "URGENT"; isPinned: boolean }) {
  const { session } = await requireAdmin();

  const validated = announcementSchema.parse(data);

  const window = new JSDOM("").window;
  const purify = DOMPurify(window);
  const sanitizedBody = purify.sanitize(validated.body, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "h2", "h3", "code", "pre"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

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

export async function deleteAnnouncement(id: string) {
  await requireAdmin();

  await prisma.announcement.delete({
    where: { id },
  });

  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  return { success: true };
}
