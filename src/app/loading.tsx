import { Globe } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function StatsLoading() {
  return (
    <main className="flex-1 pb-12 bg-atlas-950 min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-atlas-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-text-primary">
            <Globe className="h-6 w-6 text-cyan-glow" />
            <span className="text-xl font-bold font-sora">World Insights</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="rounded-xl bg-white/[0.05] animate-pulse h-14 w-14"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-white/[0.05] animate-pulse"></div>
            <div className="h-4 w-64 rounded bg-white/[0.05] animate-pulse"></div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-white/10 bg-white/[0.03] p-8 animate-pulse"></div>
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="h-[500px] rounded-2xl border border-white/10 bg-white/[0.03] p-8 animate-pulse"></div>
          <div className="h-[500px] rounded-2xl border border-white/10 bg-white/[0.03] p-8 animate-pulse"></div>
        </div>

        <div className="mt-12">
          <LoadingSpinner />
        </div>
      </div>
    </main>
  );
}
