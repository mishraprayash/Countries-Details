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

      fetch(`https://restcountries.com/v3.1/alpha?codes=${sorted.map((s) => s.cca3).join(",")}&fields=cca3,name,flags`)
        .then((r) => r.json())
        .then((list: RawTravelApiItem[]) => {
          const mapped: TrackedEntry[] = list
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

  if (!mounted || entries.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-[0.12em] flex items-center gap-2 font-sora">
          <MapPin className="h-4 w-4 text-emerald-400" />
          Latest Travels
        </h3>
        <Link
          href="/travel-map"
          className="text-xs text-muted hover:text-text-primary transition-colors flex items-center gap-1 font-sora"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {entries.map((entry) => (
          <Link
            key={entry.cca3}
            href={`/country/${encodeURIComponent(entry.name.toLowerCase())}`}
            className="flex-shrink-0 w-32 group"
          >
            <div className="relative h-20 rounded-xl overflow-hidden mb-2 ring-1 ring-white/10 group-hover:ring-emerald-400/30 transition-all">
              <Image src={entry.flag} alt={entry.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <p className="text-sm font-semibold text-text-primary truncate font-sora group-hover:text-emerald-400 transition-colors">
              {entry.name}
            </p>
            <p className={`text-[10px] font-medium flex items-center gap-1 ${STATUS_COLORS[entry.status]} font-sora`}>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[entry.status]}`} />
              {STATUS_LABELS[entry.status]}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
