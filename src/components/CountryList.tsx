"use client";

import { useState, useMemo } from "react";
import { Country } from "@/types/country";
import CountryCard from "./CountryCard";
import SearchAndFilter from "./SearchAndFilter";

interface CountryListProps {
  initialCountries: Country[];
}

export default function CountryList({ initialCountries }: CountryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("name");

  const filteredCountries = useMemo(() => {
    let result = initialCountries.filter((country) => {
      const matchesSearch = country.name.common
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === "" || country.region === regionFilter;
      return matchesSearch && matchesRegion;
    });

    // Sorting logic
    return result.sort((a, b) => {
      switch (sortOrder) {
        case "pop-desc":
          return b.population - a.population;
        case "pop-asc":
          return a.population - b.population;
        case "area-desc":
          return (b.area || 0) - (a.area || 0);
        case "area-asc":
          return (a.area || 0) - (b.area || 0);
        default:
          return a.name.common.localeCompare(b.name.common);
      }
    });
  }, [initialCountries, searchQuery, regionFilter, sortOrder]);

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-white/5 dark:bg-white/5">
        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {filteredCountries.map((country) => (
          <CountryCard key={country.cca3} country={country} />
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <span className="text-2xl">🌍</span>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            No countries found
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Try adjusting your search or filter criteria.
          </p>
          <button 
            onClick={() => { setSearchQuery(""); setRegionFilter(""); }}
            className="mt-6 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
