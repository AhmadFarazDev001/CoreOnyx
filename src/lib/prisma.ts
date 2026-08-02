/**
 * Prisma Client singleton instance.
 * Prevents multiple instances from being created in development due to hot reloading.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
