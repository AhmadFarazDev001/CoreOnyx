import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/blocked', // Custom page for blocked users (AccessDenied)
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "ADMIN" | "STUDENT";
        session.user.id = token.userId as string;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;
