"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { emailWhitelistSchema, bulkEmailWhitelistSchema } from "@/lib/validations";

export async function getWhitelistedEmails() {
  await requireAdmin();

  return prisma.whitelist.findMany({
    orderBy: { createdAt: "desc" },
  });
}

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

export async function removeEmailFromWhitelist(email: string) {
  await requireAdmin();

  await prisma.whitelist.delete({
    where: { email },
  });

  revalidatePath("/admin/roster");
  return { success: true };
}

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
