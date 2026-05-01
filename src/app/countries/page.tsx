import { getAllCountries } from "@/lib/api";
import CountryList from "@/components/CountryList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Countries | World Insights",
  description: "Browse and filter through all countries of the world.",
};

export default async function CountriesPage() {
  const countries = await getAllCountries();

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <CountryList initialCountries={countries} />
      </div>
    </main>
  );
}