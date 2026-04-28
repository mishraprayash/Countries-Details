"use client";

export function HeroSkeleton() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 p-8 sm:p-12 shadow-2xl">
      <div className="relative z-10 max-w-2xl space-y-4">
        <div className="h-12 w-64 rounded-xl bg-zinc-800 animate-pulse" />
        <div className="h-6 w-full max-w-md rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-6 w-3/4 max-w-sm rounded-lg bg-zinc-800 animate-pulse" />
      </div>
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
          <div className="mb-4 h-10 w-10 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
          <div className="mt-2 h-8 w-24 rounded bg-zinc-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-zinc-900/50 p-8">
          <div className="mb-6 h-6 w-48 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-[350px] w-full rounded-xl bg-zinc-800/50 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function SecondaryStatsSkeleton() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-4">
          <div className="h-10 w-10 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
            <div className="h-5 w-16 rounded bg-zinc-800 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SpotlightSkeleton() {
  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-3">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-8">
          <div className="mb-6 h-12 w-12 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="h-6 w-32 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="mt-2 h-4 w-48 rounded bg-zinc-800 animate-pulse" />
          <div className="mt-6 h-10 w-40 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="mt-2 h-4 w-32 rounded bg-zinc-800 animate-pulse" />
          <div className="mt-8 h-12 w-full rounded-xl bg-zinc-800 animate-pulse" />
        </div>
        <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
          <div className="h-4 w-40 rounded bg-zinc-800 animate-pulse" />
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
                <div className="h-4 w-28 rounded bg-zinc-800 animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded bg-zinc-800 animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
                <div className="h-4 w-28 rounded bg-zinc-800 animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded bg-zinc-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-zinc-900/50 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-6 w-40 rounded-lg bg-zinc-800 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 p-4">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse" />
                <div className="h-3 w-16 rounded bg-zinc-800 animate-pulse" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-16 rounded bg-zinc-800 animate-pulse" />
                <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FactOfTheDaySkeleton() {
  return (
    <div className="h-28 rounded-2xl border border-white/5 bg-zinc-900/50 animate-pulse">
      <div className="flex items-center gap-4 p-4 h-full">
        <div className="w-24 h-16 rounded-xl bg-zinc-800" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 rounded bg-zinc-800" />
          <div className="h-5 w-48 rounded bg-zinc-800" />
          <div className="h-4 w-full max-w-md rounded bg-zinc-800" />
        </div>
        <div className="w-24 h-10 rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}