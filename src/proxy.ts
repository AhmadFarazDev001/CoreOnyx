import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isLoginRoute = nextUrl.pathname === '/login';
  const isBlockedRoute = nextUrl.pathname === '/blocked';
  const isOnboardingRoute = nextUrl.pathname === '/onboarding';
  
  if (isApiAuthRoute || isBlockedRoute) {
    return null; // Always allow access
  }
  
  if (isLoginRoute) {
    if (isLoggedIn) {
      if (!req.auth?.user?.onboarded) {
        return Response.redirect(new URL('/onboarding', nextUrl));
      }
      if (role === "ADMIN") {
        return Response.redirect(new URL('/admin/dashboard', nextUrl));
      } else {
        return Response.redirect(new URL('/announcements', nextUrl));
      }
    }
    return null;
  }
  
  if (!isLoggedIn) {
    if (nextUrl.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }
  
  if (!req.auth?.user?.onboarded && !isOnboardingRoute) {
    return Response.redirect(new URL('/onboarding', nextUrl));
  }
  
  if (req.auth?.user?.onboarded && isOnboardingRoute) {
    if (role === "ADMIN") {
      return Response.redirect(new URL('/admin/dashboard', nextUrl));
    } else {
      return Response.redirect(new URL('/announcements', nextUrl));
    }
  }
  
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  
  if (isAdminRoute && role !== "ADMIN") {
    return Response.redirect(new URL('/announcements', nextUrl));
  }
  
  // Prevent ADMIN from accessing student routes (except onboarding and APIs).
  const isApiRoute = nextUrl.pathname.startsWith('/api/');
  if (!isAdminRoute && !isApiRoute && role === "ADMIN" && nextUrl.pathname !== '/' && !isOnboardingRoute) {
    return Response.redirect(new URL('/admin/dashboard', nextUrl));
  }
  
  return null;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
