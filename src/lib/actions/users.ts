"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

/**
 * Toggles a user's blocked status.
 * Requires ADMIN role. Prevents an admin from blocking themselves.
 */
export async function toggleUserBlock(userId: string) {
  const { session } = await requireAdmin();

  // Prevent an admin from blocking themselves
  if (session.user.id === userId) {
    throw new Error("You cannot block yourself.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBlocked: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: !user.isBlocked },
  });

  revalidatePath("/admin/dashboard");
  return { success: true };
}

