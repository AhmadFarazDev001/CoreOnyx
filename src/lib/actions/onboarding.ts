"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { onboardingSchema } from "@/lib/validations";

/**
 * Completes the onboarding process for a newly registered user.
 * Updates the user's name and marks them as onboarded.
 */
export async function completeOnboarding(formData: FormData) {
  const { session } = await requireAuth();

  const validated = onboardingSchema.parse({
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
  });

  const fullName = `${validated.firstName.trim()} ${validated.lastName.trim()}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      name: fullName,
      onboarded: true 
    },
  });
  
  return { success: true };
}
