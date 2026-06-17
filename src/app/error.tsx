"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in a real app
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto text-center p-8 rounded-3xl bg-white/[0.02] border border-white/10 glass-card">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-black font-instrument-serif mb-3">Something went wrong</h2>
        <p className="text-muted text-sm mb-8 font-sora">
          An unexpected error occurred. Our systems have logged the issue and we will look into it.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-cyan-glow text-atlas-950 rounded-xl text-sm font-bold hover:bg-cyan-glow/90 transition-colors font-sora"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white/5 text-text-primary rounded-xl text-sm font-bold hover:bg-white/10 transition-colors font-sora"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}