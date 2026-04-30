import { getAllCountries } from "@/lib/api";
import { Globe } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DashboardContent from "@/components/DashboardContent";
import { Suspense } from "react";
import { HeroSkeleton } from "@/components/DashboardSkeletons";

export default async function DashboardPage() {
  const countries = await getAllCountries();

  return (
    <main className="flex-1 pb-24 bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 shrink-0 pr-2 text-zinc-50">
            <Globe className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold hidden md:inline">World Insights</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Navbar currentPage="dashboard" />
          </nav>
        </div>
      </header>

      <Suspense fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
          <HeroSkeleton />
        </div>
      }>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
          <DashboardContent countries={countries} />
        </div>
      </Suspense>
    </main>
  );
}
