"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { solutionSchema } from "@/lib/validations";

export async function getSolutions() {
  await requireAuth();

  return prisma.solution.findMany({
    include: {
      annotations: true,
    },
    orderBy: {
      labNumber: "asc",
    },
  });
}

export async function getSolutionById(id: string) {
  await requireAuth();

  return prisma.solution.findUnique({
    where: { id },
    include: {
      annotations: true,
    },
  });
}

export async function createSolution(data: {
  title: string;
  labNumber: number;
  language: string;
  code: string;
  consoleOutput?: string;
  annotations?: { lineNumber: number; content: string; type: "INFO" | "WARNING" | "TIP" }[];
}) {
  await requireAdmin();
  const validated = solutionSchema.parse(data);

  const solution = await prisma.solution.create({
    data: {
      title: validated.title,
      labNumber: validated.labNumber,
      language: validated.language,
      code: validated.code,
      consoleOutput: validated.consoleOutput || "",
      annotations: data.annotations
        ? {
            create: data.annotations,
          }
        : undefined,
    },
  });

  revalidatePath("/solutions");
  revalidatePath("/admin/solutions");
  return { success: true, solution };
}

export async function deleteSolution(id: string) {
  await requireAdmin();

  await prisma.solution.delete({
    where: { id },
  });

  revalidatePath("/solutions");
  revalidatePath("/admin/solutions");
  return { success: true };
}
