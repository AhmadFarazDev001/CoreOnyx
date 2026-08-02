/**
 * NextAuth.js API Route Handler.
 * Exports the GET and POST handlers configured in our core auth system.
 */
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
