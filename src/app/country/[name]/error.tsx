"use client";

import { useEffect } from "react";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function CountryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-8 text-center animate-in fade-in duration-300">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-glow/10 ring-1 ring-amber-glow/20 mx-auto">
          <AlertCircle className="h-8 w-8 text-amber-glow" />
        </div>
        <h2 className="text-xl font-bold font-sora mb-2 text-text-primary">Failed to Load Country</h2>
        <p className="text-muted text-sm leading-relaxed mb-8 font-sora">
          We couldn&apos;t retrieve the detailed stats for this country. The REST Countries API may be experiencing downtime or the country name is invalid.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 rounded-xl bg-cyan-glow text-atlas-950 text-sm font-bold transition-all hover:bg-cyan-glow/80 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-glow/20 flex items-center justify-center gap-2 font-sora"
          >
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
          <Link
            href="/countries"
            className="flex-1 py-3 rounded-xl bg-white/[0.05] text-text-primary text-sm font-bold transition-all hover:bg-white/[0.08] active:scale-95 ring-1 ring-white/10 flex items-center justify-center gap-2 font-sora"
          >
            <ArrowLeft className="h-4 w-4" /> Countries
          </Link>
        </div>
      </div>
    </main>
  );
}
