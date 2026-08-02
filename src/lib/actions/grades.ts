"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { upsertGradeSchema } from "@/lib/validations";

/**
 * Retrieves the grade record for the currently authenticated student.
 */
export async function getStudentGrades() {
  const { session } = await requireAuth();
  if (!session.user.email) throw new Error("Unauthorized");

  return prisma.gradeRecord.findUnique({
    where: { studentEmail: session.user.email },
  });
}

/**
 * Retrieves all grade records for all students.
 * Requires ADMIN role.
 */
export async function getAllGrades() {
  await requireAdmin();

  return prisma.gradeRecord.findMany({
    orderBy: { studentEmail: "asc" },
  });
}

/**
 * Upserts (creates or updates) a grade record for a student.
 * Requires ADMIN role.
 */
export async function upsertGradeRecord(data: {
  studentEmail: string;
  studentName?: string;
  assessments: Prisma.InputJsonValue;
  totalAbsScore: number;
  totalAbsMax: number;
}) {
  await requireAdmin();
  const validated = upsertGradeSchema.parse(data);

  const record = await prisma.gradeRecord.upsert({
    where: { studentEmail: validated.studentEmail },
    update: {
      studentName: validated.studentName,
      assessments: validated.assessments as Prisma.InputJsonValue,
      totalAbsScore: validated.totalAbsScore,
      totalAbsMax: validated.totalAbsMax,
      uploadedAt: new Date(),
    },
    create: {
      studentEmail: validated.studentEmail,
      studentName: validated.studentName,
      assessments: validated.assessments as Prisma.InputJsonValue,
      totalAbsScore: validated.totalAbsScore,
      totalAbsMax: validated.totalAbsMax,
    },
  });

  revalidatePath("/grades");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/roster");
  return record;
}

/**
 * Deletes a grade record for a specific student.
 * Requires ADMIN role.
 */
export async function deleteGradeRecord(studentEmail: string) {
  await requireAdmin();

  await prisma.gradeRecord.delete({
    where: { studentEmail },
  });

  revalidatePath("/admin/roster");
  return { success: true };
}
