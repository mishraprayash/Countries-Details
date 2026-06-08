export default function CountryLoading() {
  return (
    <main className="flex-1 pb-24 bg-atlas-950 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="h-12 w-40 rounded-2xl bg-white/[0.05] animate-pulse"></div>
          <div className="hidden sm:flex h-6 w-32 rounded bg-white/[0.03] animate-pulse"></div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-1 space-y-8">
            <div className="aspect-[16/10] rounded-3xl bg-white/[0.05] animate-pulse"></div>
            <div className="h-48 rounded-3xl bg-white/[0.03] animate-pulse"></div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="h-16 w-3/4 rounded bg-white/[0.05] animate-pulse"></div>
              <div className="h-8 w-1/2 rounded bg-white/[0.03] animate-pulse"></div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-atlas-900/50 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-12">
          <div className="h-48 rounded-3xl bg-white/[0.03] animate-pulse"></div>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="h-[400px] rounded-3xl bg-white/[0.03] animate-pulse"></div>
            <div className="h-[400px] rounded-3xl bg-white/[0.03] animate-pulse"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
