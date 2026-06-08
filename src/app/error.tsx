"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-8 text-center animate-in fade-in duration-300">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 mx-auto">
          <AlertOctagon className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold font-sora mb-2 text-text-primary">Something went wrong</h2>
        <p className="text-muted text-sm leading-relaxed mb-8 font-sora">
          An unexpected error occurred while loading this page. This could be due to a network interruption or temporary API issue.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 rounded-xl bg-cyan-glow text-atlas-950 text-sm font-bold transition-all hover:bg-cyan-glow/80 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-glow/20 flex items-center justify-center gap-2 font-sora"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-white/[0.05] text-text-primary text-sm font-bold transition-all hover:bg-white/[0.08] active:scale-95 ring-1 ring-white/10 flex items-center justify-center gap-2 font-sora"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </main>
  );
}
