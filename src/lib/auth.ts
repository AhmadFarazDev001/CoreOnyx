import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

/**
 * NextAuth initialization with PrismaAdapter.
 * Handles signIn whitelist logic, DB synchronization, and token/session enrichment.
 * Implements bootstrap mode: the first user on an empty DB is made ADMIN.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;
      
      // Check if user is blocked in the database
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser?.isBlocked) {
        // Returning false combined with pages.error will redirect to the blocked page
        return false; 
      }
      
      // Check if user is in Whitelist
      const whitelistCount = await prisma.whitelist.count();
      
      // BOOTSTRAP MODE: If the whitelist is completely empty (fresh deployment), 
      // allow the first user to log in and automatically whitelist them.
      if (whitelistCount === 0) {
        await prisma.whitelist.create({ data: { email } });
        return true;
      }

      const isWhitelisted = await prisma.whitelist.findUnique({ where: { email } });
      if (!isWhitelisted) {
        return false;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { role: true, onboarded: true, id: true }
        });
        
        // BOOTSTRAP MODE: If this is the ONLY user in the database, make them ADMIN
        if (dbUser) {
          const userCount = await prisma.user.count();
          if (userCount === 1 && dbUser.role !== "ADMIN") {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: "ADMIN" },
              select: { role: true, onboarded: true, id: true }
            });
          }
        }

        token.role = dbUser?.role || token.role || "STUDENT";
        token.userId = dbUser?.id || user.id;
        token.onboarded = dbUser?.onboarded || false;
      }
      if (trigger === "update" && session?.onboarded !== undefined) {
        token.onboarded = session.onboarded;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "ADMIN" | "STUDENT";
        session.user.id = token.userId as string;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
  },
});
