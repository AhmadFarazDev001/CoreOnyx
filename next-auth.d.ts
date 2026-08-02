import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extended NextAuth Session interface to include custom user properties.
   */
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "STUDENT"
      onboarded: boolean
    } & DefaultSession["user"]
  }

  /**
   * Extended NextAuth User interface representing the database user model.
   */
  interface User extends DefaultUser {
    role?: "ADMIN" | "STUDENT"
    onboarded?: boolean
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended NextAuth JWT interface for persisted session tokens.
   */
  interface JWT extends DefaultJWT {
    role?: "ADMIN" | "STUDENT"
    userId?: string
    onboarded?: boolean
  }
}
