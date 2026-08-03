"use client";

import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({ placeholder = "Search...", className }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [query, pathname, router, searchParams]);

  return (
    <div className={`relative ${className || ""}`}>
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] ${isPending ? "animate-pulse" : ""}`} />
      <Input 
        className="pl-10 h-9" 
        placeholder={placeholder} 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
