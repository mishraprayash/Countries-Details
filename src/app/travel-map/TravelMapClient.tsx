"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Trash2, Share2 } from "lucide-react";
import { useTravelMap } from "@/hooks/useTravelMap";
import TravelStats from "@/components/TravelStats";
import TravelMapView from "@/components/TravelMap";
import TravelStatsCertificate from "@/components/TravelStatsCertificate";
import { CountryStatus } from "@/types/user";
import { getClientCountries } from "@/lib/clientCache";

interface CountryListItem {
  cca3: string;
  name: string;
  flag: string;
  region: string;
  status: CountryStatus;
}

export default function TravelMapClient() {
  const { data, mounted, getStats, clearAll, removeCountry } = useTravelMap();
  const [statusFilter, setStatusFilter] = useState<CountryStatus | "all">("all");
  const [showGrid, setShowGrid] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-glow" />
        </div>
      </div>
    );
  }

  const stats = getStats();
  const hasData = Object.keys(data).length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-glow/20 ring-2 ring-emerald-400/30 mb-4">
            <MapPin className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary font-instrument-serif">My Travel Map</h1>
          <p className="mt-2 text-muted font-sora">Track countries you&apos;ve visited, want to visit, or lived in.</p>
        </div>

        {hasData && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 hover:border-emerald-500/30 font-sora cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              Share Stats Card
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5 hover:border-red-500/20 font-sora cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-32">
          <MapPin className="h-16 w-16 text-muted mb-4" />
          <h3 className="text-2xl font-bold text-text-primary mb-2 font-sora">No countries tracked yet</h3>
          <p className="text-muted mb-6 text-center max-w-md font-sora">
            Visit a country detail page and click the map pin icon to mark it as Visited, Want to Visit, or Lived In.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <TravelStats stats={stats} />

          {/* Continent Breakdown & Achievements Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Continent Breakdown Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
              <h2 className="text-base font-bold text-text-primary mb-4 font-sora flex items-center gap-2">
                <span>🌍</span> Exploration by Continent
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.continentBreakdown || {})
                  .filter(([name]) => name !== "Unknown")
                  .sort((a, b) => b[1].visited - a[1].visited)
                  .map(([name, data]) => {
                    const percent = data.total > 0 ? Math.round((data.visited / data.total) * 100) : 0;
                    return (
                      <div key={name} className="space-y-1.5 font-sora">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-text-secondary">{name}</span>
                          <span className="text-muted font-dm-mono">
                            {data.visited} / {data.total} <span className="text-cyan-glow ml-1">({percent}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-glow rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Achievements Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
              <h2 className="text-base font-bold text-text-primary mb-4 font-sora flex items-center gap-2">
                <span>🏆</span> Travel Achievements
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "First Steps",
                    desc: "Visit or live in 1 country",
                    unlocked: stats.visitedCount + stats.livedInCount >= 1,
                    icon: "🧭",
                  },
                  {
                    title: "Globetrotter",
                    desc: "Visit 5+ countries",
                    unlocked: stats.visitedCount + stats.livedInCount >= 5,
                    icon: "✈️",
                  },
                  {
                    title: "World Citizen",
                    desc: "Visit 15+ countries",
                    unlocked: stats.visitedCount + stats.livedInCount >= 15,
                    icon: "🌍",
                  },
                  {
                    title: "Local Life",
                    desc: "Live in at least 1 country",
                    unlocked: stats.livedInCount >= 1,
                    icon: "🏠",
                  },
                  {
                    title: "Wanderlust",
                    desc: "Add 5+ wishlist countries",
                    unlocked: stats.wantToVisitCount >= 5,
                    icon: "✨",
                  },
                  {
                    title: "Hop Skipper",
                    desc: "Visit 3+ continents",
                    unlocked: stats.continentsVisited >= 3,
                    icon: "⛵",
                  },
                ].map((ach) => (
                  <div
                    key={ach.title}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      ach.unlocked
                        ? "bg-cyan-glow/5 border-cyan-glow/20 text-text-primary"
                        : "bg-white/[0.01] border-white/5 opacity-40"
                    }`}
                  >
                    <div className="text-2xl shrink-0">{ach.icon}</div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold font-sora truncate">{ach.title}</span>
                      <span className="block text-[10px] text-text-muted font-sora leading-tight">{ach.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary font-sora">World Map</h2>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted hover:text-text-primary hover:bg-white/5 transition-all border border-white/5 font-sora"
            >
              {showGrid ? "Map View" : "Grid View"}
            </button>
          </div>

          {showGrid ? (
            <GridView data={data} removeCountry={removeCountry} />
          ) : (
            <TravelMapView data={data} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />
          )}

          <TravelStatsCertificate
            isOpen={showCertificate}
            onClose={() => setShowCertificate(false)}
            stats={stats}
          />
        </div>
      )}
    </div>
  );
}

function GridView({
  data,
  removeCountry,
}: {
  data: Record<string, { status: CountryStatus }>;
  removeCountry: (cca3: string) => void;
}) {
  const [cards, setCards] = useState<CountryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const codes = Object.keys(data);
    if (codes.length === 0) { setLoading(false); return; }
    let cancelled = false;
    getClientCountries()
      .then((list) => {
        if (cancelled) return;
        const mapped = list
          .filter((c) => codes.includes(c.cca3))
          .map((c) => ({
            cca3: c.cca3,
            name: c.name.common,
            flag: c.flags.svg,
            region: c.region,
            status: data[c.cca3].status,
          }));
        mapped.sort((a, b) => {
          const order = { "visited": 0, "lived-in": 1, "want-to-visit": 2 };
          return (order[a.status] ?? 0) - (order[b.status] ?? 0);
        });
        setCards(mapped);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-cyan-glow" />
      </div>
    );
  }

  const grouped: Record<string, CountryListItem[]> = { "visited": [], "lived-in": [], "want-to-visit": [] };
  for (const c of cards) {
    if (grouped[c.status]) grouped[c.status].push(c);
  }

  const sections = [
    { key: "visited", label: "Visited", icon: "🟢", items: grouped["visited"] },
    { key: "lived-in", label: "Lived In", icon: "🟣", items: grouped["lived-in"] },
    { key: "want-to-visit", label: "Want to Visit", icon: "🟡", items: grouped["want-to-visit"] },
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) =>
        section.items.length > 0 ? (
          <div key={section.key}>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4 font-sora flex items-center gap-2">
              <span>{section.icon}</span>
              {section.label}
              <span className="text-muted font-dm-mono text-xs font-normal">({section.items.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {section.items.map((c) => (
                <div
                  key={c.cca3}
                  className="relative group rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-all"
                >
                  <button
                    onClick={() => removeCountry(c.cca3)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/40 text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <div className="relative h-16 w-full rounded-lg overflow-hidden mb-2">
                    <Image src={c.flag} alt={c.name} fill className="object-cover" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary truncate font-sora">{c.name}</p>
                  <p className="text-[10px] text-muted font-sora">{c.region}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
