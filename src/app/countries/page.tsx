import { getAllCountries } from "@/lib/api";
import CountryList from "@/components/CountryList";
import { Globe } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Countries | World Insights",
  description: "Browse and filter through all countries of the world. Sort by population, area, and region to find detailed demographic information.",
};

export default async function CountriesPage() {
  const countries = await getAllCountries();

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold text-white">
              World Insights
            </h1>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors">
              Dashboard
            </Link>
            <Link href="/countries" className="text-sm font-bold text-blue-400">
              Countries
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <CountryList initialCountries={countries} />
      </div>
    </main>
  );
}
