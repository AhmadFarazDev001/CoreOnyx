"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { Hexagon } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await completeOnboarding(formData);
      if (res.success) {
        // Tell NextAuth to refresh the JWT/session to pick up the onboarded=true flag
        await update({ onboarded: true });
        
        // Redirect based on role
        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/announcements");
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden px-4 font-sans">
      {/* Background gradients for premium aesthetic */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center group">
          
          <div className="mb-8 flex flex-col items-center gap-6">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-[1.05] transition-transform duration-500">
              <Hexagon className="h-10 w-10 absolute animate-pulse" strokeWidth={1.5} />
              <div className="absolute inset-0 rounded-[1.25rem] border border-white/20" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Aboard</h1>
              <p className="text-sm font-medium text-indigo-200/80 leading-relaxed mx-auto">
                Let's get you set up. What's your name?
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="flex gap-4">
              <Input 
                name="firstName" 
                placeholder="First Name" 
                required 
                autoComplete="given-name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-indigo-200/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
              <Input 
                name="lastName" 
                placeholder="Last Name" 
                required 
                autoComplete="family-name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-indigo-200/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-white px-6 py-6 text-[15px] font-semibold text-slate-900 shadow-xl hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300"
            >
              {loading ? "Saving..." : "Continue to Dashboard"}
            </Button>
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-3 w-full">
             <div className="h-[1px] w-full bg-gradient-to-r from-transparent to-white/20" />
             <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase whitespace-nowrap">
               Profile Setup
             </p>
             <div className="h-[1px] w-full bg-gradient-to-l from-transparent to-white/20" />
          </div>

        </div>
      </div>
    </div>
  );
}
