"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { solutionSchema } from "@/lib/validations";

/**
 * Retrieves all published solutions, ordered by lab number.
 * Requires authentication. Includes annotations for each solution.
 */
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

/**
 * Retrieves a specific solution by its ID.
 * Requires authentication. Includes annotations.
 */
export async function getSolutionById(id: string) {
  await requireAuth();

  return prisma.solution.findUnique({
    where: { id },
    include: {
      annotations: true,
    },
  });
}

/**
 * Creates a new lab solution.
 * Requires ADMIN role. Validates the input data including optional console output and annotations.
 */
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

/**
 * Deletes a solution by its ID.
 * Requires ADMIN role.
 */
export async function deleteSolution(id: string) {
  await requireAdmin();

  await prisma.solution.delete({
    where: { id },
  });

  revalidatePath("/solutions");
  revalidatePath("/admin/solutions");
  return { success: true };
}
