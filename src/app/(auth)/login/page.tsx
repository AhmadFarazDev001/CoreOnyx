"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Hexagon } from "lucide-react"; // Using Lucide icon for logo placeholder
import { Button } from "@/components/ui/Button";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/announcements";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden px-4 font-sans">
      {/* Background gradients for premium aesthetic */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center group">
          
          {/* Logo and Branding */}
          <div className="mb-10 flex flex-col items-center gap-6">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-[1.05] transition-transform duration-500">
              <Hexagon className="h-10 w-10 absolute animate-pulse" strokeWidth={1.5} />
              <div className="absolute inset-0 rounded-[1.25rem] border border-white/20" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">CoreOnyx</h1>
              <p className="text-sm font-medium text-indigo-200/80 max-w-[240px] leading-relaxed mx-auto">
                Your course companion, reimagined for ultimate clarity.
              </p>
            </div>
          </div>

          {/* Login Button */}
          <div className="w-full">
            <Button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full rounded-2xl bg-white px-6 py-6 text-[15px] font-semibold text-slate-900 shadow-xl hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-500/30 flex items-center justify-center gap-3 transition-all duration-300"
            >
              {/* Google G icon SVG */}
              <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-10 flex w-full flex-col items-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-white/20" />
              <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
                Academic Access
              </p>
              <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-white/20" />
            </div>
            <p className="text-xs text-indigo-200/50">
              Only @nu.edu.pk accounts are accepted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
