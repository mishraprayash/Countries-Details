import { getAllCountries } from "@/lib/api";
import CountryList from "@/components/CountryList";
import { Globe } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Explore Countries | World Insights",
  description: "Browse and filter through all countries of the world. Sort by population, area, and region to find detailed demographic information.",
};

export default async function CountriesPage() {
  const countries = await getAllCountries();

  return (
    <main className="flex-1">
      <header className="sticky top-0 z-50 border-b border-navy-200 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-navy-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-navy-900 dark:text-navy-50" />
            <h1 className="text-xl font-bold text-navy-900 dark:text-navy-50">
              World Insights
            </h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-navy-500 hover:text-navy-900 dark:text-navy-400 dark:hover:text-navy-50">
              Dashboard
            </Link>
            <Link href="/countries" className="rounded-full bg-navy-900 px-4 py-1.5 text-sm font-bold text-white dark:bg-white dark:text-navy-900">
              Countries
            </Link>
            <div className="ml-2 border-l border-navy-200 pl-4 dark:border-white/10">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <CountryList initialCountries={countries} />
      </div>
    </main>
  );
}
