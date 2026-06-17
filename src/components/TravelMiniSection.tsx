"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronRight } from "lucide-react";
import { CountryStatus } from "@/types/user";

interface TrackedEntry {
  cca3: string;
  name: string;
  flag: string;
  status: CountryStatus;
  updatedAt: number;
}

interface RawTravelApiItem {
  cca3: string;
  name: { common: string };
  flags: { svg: string };
}

const STATUS_LABELS: Record<CountryStatus, string> = {
  "visited": "Visited",
  "want-to-visit": "Want to Visit",
  "lived-in": "Lived In",
};

const STATUS_COLORS: Record<CountryStatus, string> = {
  "visited": "text-emerald-400",
  "want-to-visit": "text-amber-glow",
  "lived-in": "text-violet-glow",
};

const STATUS_DOTS: Record<CountryStatus, string> = {
  "visited": "bg-emerald-400",
  "want-to-visit": "bg-amber-glow",
  "lived-in": "bg-violet-glow",
};

export default function TravelMiniSection() {
  const [entries, setEntries] = useState<TrackedEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("world_insights_travel_map");
      if (!stored) { setMounted(true); return; }
      const data: Record<string, { status: CountryStatus; updatedAt: number }> = JSON.parse(stored);
      const codes = Object.keys(data);
      if (codes.length === 0) { setMounted(true); return; }

      const sorted = codes
        .map((c) => ({ cca3: c, ...data[c] }))
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 6);

      fetch("/api/countries")
        .then((r) => r.json())
        .then((list: RawTravelApiItem[]) => {
          // Filter out the requested ones
          const requested = list.filter(c => sorted.some(s => s.cca3 === c.cca3));
          const mapped: TrackedEntry[] = requested
            .filter((c) => data[c.cca3])
            .map((c) => ({
              cca3: c.cca3,
              name: c.name.common,
              flag: c.flags.svg,
              status: data[c.cca3].status,
              updatedAt: data[c.cca3].updatedAt,
            }))
            .sort((a, b) => b.updatedAt - a.updatedAt);
          setEntries(mapped);
        })
        .catch(() => {})
        .finally(() => setMounted(true));
    } catch {
      setMounted(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) {
    return <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm shadow-lg h-32 animate-pulse" />;
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 font-sora">
          <MapPin className="h-4 w-4 text-emerald-400" />
          Latest Travels
        </h3>
        {entries.length > 0 && (
          <Link
            href="/travel-map"
            className="text-xs font-semibold text-cyan-glow hover:text-cyan-400 transition-colors flex items-center gap-1 font-sora"
          >
            View Map <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 opacity-50">
          <MapPin className="h-6 w-6 text-text-muted mb-2" />
          <p className="text-xs text-text-muted font-sora text-center">No travels tracked yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {entries.map((entry) => (
            <Link
              key={entry.cca3}
              href={`/country/${encodeURIComponent(entry.name.toLowerCase())}`}
              className="group flex items-center gap-4 p-2.5 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all"
            >
              {/* Flag Thumbnail */}
              <div className="relative h-12 w-16 shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-sm group-hover:ring-emerald-400/50 group-hover:scale-105 transition-all">
                <Image src={entry.flag} alt={entry.name} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate font-sora group-hover:text-emerald-400 transition-colors">
                  {entry.name}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${STATUS_COLORS[entry.status]} font-sora mt-1`}>
                  <span className={`h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor] ${STATUS_DOTS[entry.status]}`} />
                  {STATUS_LABELS[entry.status]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
