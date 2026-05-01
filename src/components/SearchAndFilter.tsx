import React from "react";
import { Search, ChevronDown } from "lucide-react";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (term: string) => void;
  regionFilter: string;
  setRegionFilter: (region: string) => void;
  sortOrder: string;
  setSortOrder: (sort: string) => void;
}

const regions = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];
const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Population (High to Low)", value: "pop-desc" },
  { label: "Population (Low to High)", value: "pop-asc" },
  { label: "Area (High to Low)", value: "area-desc" },
  { label: "Name (A-Z)", value: "name-asc" },
];

export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  regionFilter,
  setRegionFilter,
  sortOrder,
  setSortOrder,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-4.5 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-muted" />
        </div>
        <input
          type="text"
          placeholder="Search for a country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 w-full rounded-2xl bg-white/[0.03] pl-12 pr-5 text-sm font-medium shadow-sm ring-1 ring-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-glow/50 text-text-primary placeholder:text-muted font-sora"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-48">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-12 w-full appearance-none rounded-2xl bg-white/[0.03] pl-4.5 pr-10 text-sm font-medium shadow-sm ring-1 ring-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-glow/50 text-text-primary cursor-pointer font-sora"
          >
            {regions.map((region) => (
              <option key={region} value={region === "All" ? "" : region} className="bg-atlas-900 text-text-primary">
                {region === "All" ? "Filter by Region" : region}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-muted" />
          </div>
        </div>

        <div className="relative w-full sm:w-60">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-12 w-full appearance-none rounded-2xl bg-white/[0.03] pl-4.5 pr-10 text-sm font-medium shadow-sm ring-1 ring-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-glow/50 text-text-primary cursor-pointer font-sora"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-atlas-900 text-text-primary">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
