import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "STUDENT"
      onboarded: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role?: "ADMIN" | "STUDENT"
    onboarded?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: "ADMIN" | "STUDENT"
    userId?: string
    onboarded?: boolean
  }
}
