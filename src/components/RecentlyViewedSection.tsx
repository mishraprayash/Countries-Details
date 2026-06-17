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
      fetch("/api/countries")
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

  if (!mounted) {
    return <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm shadow-lg h-32 animate-pulse" />;
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 font-sora">
          <Clock className="h-4 w-4 text-cyan-glow" />
          Recently Viewed
        </h3>
        {recentlyViewed.length > 0 && (
          <button
            onClick={clearRecentlyViewed}
            className="text-xs font-semibold text-text-muted hover:text-red-400 transition-colors flex items-center gap-1 font-sora"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {recentlyViewed.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 opacity-50">
          <Clock className="h-6 w-6 text-text-muted mb-2" />
          <p className="text-xs text-text-muted font-sora text-center">No recent history.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {countryDetails.map((country) => (
            <Link
              key={country.cca3}
              href={`/country/${encodeURIComponent(country.name.common.toLowerCase())}`}
              className="group flex items-center gap-4 p-2.5 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all"
            >
              {/* Flag Thumbnail */}
              <div className="relative h-12 w-16 shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-sm group-hover:ring-cyan-glow/50 group-hover:scale-105 transition-all">
                <Image src={country.flags.svg} alt={country.name.common} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate font-sora group-hover:text-cyan-glow transition-colors">
                  {country.name.common}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-sora mt-1">
                  {country.region}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
