"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2 } from "lucide-react";
import { UserCountryEntry, CountryStatus } from "@/types/user";

const MapContent = dynamic(() => import("./TravelMapContent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border border-white/5 bg-atlas-900">
      <Loader2 className="h-6 w-6 animate-spin text-muted" />
    </div>
  ),
});

interface CountryCoord {
  cca3: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  region: string;
}

interface RawCoordApiItem {
  cca3: string;
  name: { common: string };
  flags: { svg: string };
  latlng: [number, number];
  region: string;
}

interface TravelMapProps {
  data: Record<string, UserCountryEntry>;
  statusFilter: CountryStatus | "all";
  onStatusFilterChange: (status: CountryStatus | "all") => void;
}

const STATUS_OPTIONS: { value: CountryStatus | "all"; label: string; color: string }[] = [
  { value: "all", label: "All", color: "text-text-primary" },
  { value: "visited", label: "Visited", color: "text-emerald-400" },
  { value: "want-to-visit", label: "Want to Visit", color: "text-amber-glow" },
  { value: "lived-in", label: "Lived In", color: "text-violet-glow" },
];

export default function TravelMap({ data, statusFilter, onStatusFilterChange }: TravelMapProps) {
  const [coords, setCoords] = useState<CountryCoord[]>([]);
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const tracked = Object.keys(data);
    if (tracked.length === 0) {
      setCoords([]);
      setLoading(false);
      return;
    }
    fetch(`https://restcountries.com/v3.1/alpha?codes=${tracked.join(",")}&fields=cca3,name,flags,latlng,region`)
      .then((r) => r.json())
      .then((list: RawCoordApiItem[]) => {
        setCoords(
          list
            .filter((c) => c.latlng)
            .map((c) => ({
              cca3: c.cca3,
              name: c.name.common,
              flag: c.flags.svg,
              lat: c.latlng[0],
              lng: c.latlng[1],
              region: c.region,
            }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const filtered = useMemo(() => {
    if (statusFilter === "all") return coords;
    return coords.filter((c) => data[c.cca3]?.status === statusFilter);
  }, [coords, data, statusFilter]);

  const statusForCoord = (cca3: string): CountryStatus => data[cca3]?.status ?? "visited";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusFilterChange(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all font-sora ${
              statusFilter === opt.value
                ? `${opt.color} bg-white/[0.06] border border-white/10`
                : "text-muted hover:text-text-primary bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-muted font-sora">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Visited</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-glow" /> Want</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-violet-glow" /> Lived</span>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[500px] items-center justify-center rounded-2xl border border-white/5 bg-atlas-900">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-2xl border border-white/5 bg-atlas-900 glass-card">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted mb-3" />
            <p className="text-muted font-sora">
              {Object.keys(data).length === 0
                ? "No countries tracked yet. Visit a country page to start tracking!"
                : "No countries match this filter."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-white/5">
          <MapContent coords={filtered} statusForCoord={statusForCoord} />
        </div>
      )}
    </div>
  );
}
