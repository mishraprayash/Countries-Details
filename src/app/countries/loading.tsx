import LoadingSpinner from "@/components/LoadingSpinner";
import { Globe } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex-1 bg-atlas-950 min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-atlas-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-cyan-glow" />
            <h1 className="text-xl font-bold text-text-primary font-sora">
              World Insights
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="space-y-12">
          {/* Skeleton Search and Filter */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between animate-pulse">
            <div className="h-12 w-full max-w-md rounded-xl bg-white/[0.05]"></div>
            <div className="h-12 w-full max-w-[200px] rounded-xl bg-white/[0.05]"></div>
          </div>

          <LoadingSpinner />

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl bg-atlas-900/50 animate-pulse">
                <div className="aspect-[16/10] bg-white/[0.05]"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 rounded bg-white/[0.05]"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-1/2 rounded bg-white/[0.05]"></div>
                    <div className="h-4 w-2/3 rounded bg-white/[0.05]"></div>
                    <div className="h-4 w-1/3 rounded bg-white/[0.05]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
