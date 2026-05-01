"use client";

import { useState, useMemo, useCallback } from "react";
import { Country } from "@/types/country";
import CountryCard from "./CountryCard";
import SearchAndFilter from "./SearchAndFilter";

interface CountryListProps {
  initialCountries: Country[];
}

const PAGE_SIZE = 48;

export default function CountryList({ initialCountries }: CountryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("name");
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever filters change
  const handleSetSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const handleSetRegionFilter = useCallback((r: string) => {
    setRegionFilter(r);
    setPage(1);
  }, []);

  const handleSetSortOrder = useCallback((s: string) => {
    setSortOrder(s);
    setPage(1);
  }, []);

  const filteredCountries = useMemo(() => {
    const result = initialCountries.filter((country) => {
      const matchesSearch = country.name.common
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === "" || country.region === regionFilter;
      return matchesSearch && matchesRegion;
    });

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

  const visibleCountries = filteredCountries.slice(0, page * PAGE_SIZE);
  const hasMore = visibleCountries.length < filteredCountries.length;

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-6">
        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={handleSetSearchQuery}
          regionFilter={regionFilter}
          setRegionFilter={handleSetRegionFilter}
          sortOrder={sortOrder}
          setSortOrder={handleSetSortOrder}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {visibleCountries.map((country) => (
          <CountryCard key={country.cca3} country={country} />
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] glass-card">
            <span className="text-2xl">🌍</span>
          </div>
          <p className="text-lg font-bold text-text-primary font-sora">
            No countries found
          </p>
          <p className="text-sm text-muted">
            Try adjusting your search or filter criteria.
          </p>
          <button
            onClick={() => { handleSetSearchQuery(""); handleSetRegionFilter(""); }}
            className="mt-6 text-sm font-bold text-cyan-glow hover:text-cyan-glow/80 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-8 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-bold text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-all font-sora"
          >
            Load more ({filteredCountries.length - visibleCountries.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
