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

/**
 * Adds a student to the whitelist manually.
 * Also provisions an empty GradeRecord for them to appear in the Admin Roster immediately.
 */
export async function addStudentToWhitelist(email: string) {
  await requireAdmin();
  
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error("Invalid email address.");
  }
  
  try {
    // 1. Add to Whitelist so they can log in
    await prisma.whitelist.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail }
    });
    
    // 2. Create an empty GradeRecord so they immediately appear in the Admin Roster UI
    await prisma.gradeRecord.upsert({
      where: { studentEmail: normalizedEmail },
      update: {},
      create: { 
        studentEmail: normalizedEmail,
        studentName: normalizedEmail.split('@')[0], // Guess name from email
      }
    });
    
    revalidatePath("/admin/roster");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to add student.");
  }
}
