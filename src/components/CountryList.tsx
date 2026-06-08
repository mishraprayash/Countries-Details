"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  const [sortOrder, setSortOrder] = useState("default");
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

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
    const query = searchQuery.toLowerCase().trim();
    const result = initialCountries.filter((country) => {
      if (query) {
        const matchesName = country.name.common.toLowerCase().includes(query);
        const matchesOfficialName = country.name.official.toLowerCase().includes(query);
        
        if (!(matchesName || matchesOfficialName)) return false;
      }
      if (regionFilter && country.region !== regionFilter) return false;
      return true;
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
        case "name-desc":
          return b.name.common.localeCompare(a.name.common);
        case "density-desc":
          return (b.population / (b.area || 1)) - (a.population / (a.area || 1));
        case "density-asc":
          return (a.population / (a.area || 1)) - (b.population / (b.area || 1));
        default:
          return a.name.common.localeCompare(b.name.common);
      }
    });
  }, [initialCountries, searchQuery, regionFilter, sortOrder]);

  const visibleCountries = filteredCountries.slice(0, page * PAGE_SIZE);
  const hasMore = visibleCountries.length < filteredCountries.length;

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore]);

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
        <div ref={observerTarget} className="flex justify-center pt-8 pb-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-cyan-glow" />
        </div>
      )}
    </div>
  );
}
