"use client";

import { Search, ChevronDown } from "lucide-react";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  regionFilter: string;
  setRegionFilter: (region: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const regions = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  regionFilter,
  setRegionFilter,
  sortOrder,
  setSortOrder,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative w-full max-w-lg">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5">
          <Search className="h-4.5 w-4.5 text-navy-400" />
        </div>
        <input
          type="text"
          placeholder="Search for a country..."
          className="h-12 w-full rounded-2xl bg-white pl-12 pr-5 text-sm font-medium shadow-sm ring-1 ring-navy-200 transition-all focus:outline-none focus:ring-2 focus:ring-navy-900 dark:bg-navy-900/50 dark:text-navy-50 dark:ring-white/10 dark:focus:ring-white/30"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-48">
          <select
            className="h-12 w-full appearance-none rounded-2xl bg-white pl-4.5 pr-10 text-sm font-medium shadow-sm ring-1 ring-navy-200 transition-all focus:outline-none focus:ring-2 focus:ring-navy-900 dark:bg-navy-900/50 dark:text-navy-50 dark:ring-white/10 dark:focus:ring-white/30 cursor-pointer"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4.5">
            <ChevronDown className="h-4 w-4 text-navy-400" />
          </div>
        </div>

        <div className="relative w-full sm:w-48">
          <select
            className="h-12 w-full appearance-none rounded-2xl bg-white pl-4.5 pr-10 text-sm font-medium shadow-sm ring-1 ring-navy-200 transition-all focus:outline-none focus:ring-2 focus:ring-navy-900 dark:bg-navy-900/50 dark:text-navy-50 dark:ring-white/10 dark:focus:ring-white/30 cursor-pointer"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="pop-desc">Population (High to Low)</option>
            <option value="pop-asc">Population (Low to High)</option>
            <option value="area-desc">Area (Largest First)</option>
            <option value="area-asc">Area (Smallest First)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4.5">
            <ChevronDown className="h-4 w-4 text-navy-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
