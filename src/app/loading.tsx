import { Globe, LayoutDashboard } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function StatsLoading() {
  return (
    <main className="flex-1 pb-12">
      <header className="sticky top-0 z-50 border-b border-navy-200 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-navy-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-navy-900 dark:text-navy-50">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold">Where in the world?</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="rounded-xl bg-navy-200 p-3 dark:bg-navy-800 animate-pulse h-14 w-14"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-navy-200 dark:bg-navy-800 animate-pulse"></div>
            <div className="h-4 w-64 rounded bg-navy-200 dark:bg-navy-800 animate-pulse"></div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-navy-200 bg-white p-8 dark:border-white/10 dark:bg-navy-900/50 animate-pulse"></div>
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="h-[500px] rounded-2xl border border-navy-200 bg-white p-8 dark:border-white/10 dark:bg-navy-900/50 animate-pulse"></div>
          <div className="h-[500px] rounded-2xl border border-navy-200 bg-white p-8 dark:border-white/10 dark:bg-navy-900/50 animate-pulse"></div>
        </div>

        <div className="mt-12">
          <LoadingSpinner />
        </div>
      </div>
    </main>
  );
}
