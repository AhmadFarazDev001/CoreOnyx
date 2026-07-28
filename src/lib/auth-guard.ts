import { auth } from "./auth";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

/**
 * Requires an authenticated user session.
 * Re-verifies against the database that the user is not blocked.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Double-check DB state for blocked users
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBlocked: true, role: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  if (dbUser.isBlocked) {
    throw new Error("Account blocked");
  }

  return { session, dbUser };
}

/**
 * Requires an authenticated ADMIN user session.
 */
export async function requireAdmin() {
  const { session, dbUser } = await requireAuth();
  
  if (dbUser.role !== Role.ADMIN) {
    throw new Error("Forbidden: Admin access required");
  }

  return { session, dbUser };
}
