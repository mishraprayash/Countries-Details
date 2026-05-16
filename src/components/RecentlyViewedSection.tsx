"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, X } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface Country {
  cca3: string;
  name: { common: string };
  flags: { svg: string };
  region: string;
  population: number;
}

export default function RecentlyViewedSection() {
  const { recentlyViewed, clearRecentlyViewed, mounted } = useRecentlyViewed();
  const [countryDetails, setCountryDetails] = useState<Country[]>([]);

  useEffect(() => {
    if (recentlyViewed.length > 0) {
      const codes = recentlyViewed.map((v) => v.cca3).join(",");
      fetch(`https://restcountries.com/v3.1/alpha?codes=${codes}&fields=name,cca3,flags,region,population`)
        .then((res) => res.ok ? res.json() : [])
        .then((data: Country[]) => {
          const ordered = recentlyViewed
            .map((v) => data.find((c) => c.cca3 === v.cca3))
            .filter(Boolean) as Country[];
          setCountryDetails(ordered);
        })
        .catch(() => {});
    }
  }, [recentlyViewed]);

  if (!mounted || recentlyViewed.length === 0) return null;

  return (
    <div className="mt-8 glass-card rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-[0.12em] flex items-center gap-2 font-sora">
          <Clock className="h-4 w-4 text-cyan-glow" />
          Recently Viewed
        </h3>
        <button
          onClick={clearRecentlyViewed}
          className="text-xs text-muted hover:text-text-primary transition-colors flex items-center gap-1 font-sora"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {countryDetails.map((country) => (
          <Link
            key={country.cca3}
            href={`/country/${encodeURIComponent(country.name.common.toLowerCase())}`}
            className="flex-shrink-0 w-36 group"
          >
            <div className="relative h-24 rounded-xl overflow-hidden mb-2 ring-1 ring-white/10 group-hover:ring-cyan-glow/30 transition-all">
              <Image src={country.flags.svg} alt={country.name.common} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <p className="text-sm font-semibold text-text-primary truncate font-sora group-hover:text-cyan-glow transition-colors">
              {country.name.common}
            </p>
            <p className="text-[10px] text-muted font-sora">{country.region}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
