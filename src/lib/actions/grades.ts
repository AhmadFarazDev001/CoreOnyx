"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { upsertGradeSchema } from "@/lib/validations";

export async function getStudentGrades() {
  const { session } = await requireAuth();
  if (!session.user.email) throw new Error("Unauthorized");

  return prisma.gradeRecord.findUnique({
    where: { studentEmail: session.user.email },
  });
}

export async function getAllGrades() {
  await requireAdmin();

  return prisma.gradeRecord.findMany({
    orderBy: { studentEmail: "asc" },
  });
}

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

  // Auto-whitelist the student so they can log in to view their grades
  await prisma.whitelist.upsert({
    where: { email: validated.studentEmail },
    update: {},
    create: { email: validated.studentEmail }
  });

  revalidatePath("/grades");
  revalidatePath("/admin/grades");
  revalidatePath("/admin/roster");
  return record;
}

export async function deleteGradeRecord(studentEmail: string) {
  await requireAdmin();

  await prisma.gradeRecord.delete({
    where: { studentEmail },
  });

  revalidatePath("/admin/roster");
  return { success: true };
}
