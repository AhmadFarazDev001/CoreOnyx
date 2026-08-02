"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side NextAuth Session Provider.
 * Wraps the application to provide session context to client components.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
