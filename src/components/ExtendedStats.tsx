"use client";

import { useState, useEffect } from "react";

interface ExtendedStatsProps {
  cca3: string;
}

interface Stats {
  gdpPerCapita: number | null;
  gdp: number | null;
  literacyAdult: number | null;
  lifeExpectancy: number | null;
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-5 bg-zinc-800 rounded animate-pulse" />
      ))}
    </div>
  );
}

export default function ExtendedStats({ cca3 }: ExtendedStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const indicators = [
          { key: "gdpPerCapita", code: "NY.GDP.PCAP.CD" },
          { key: "gdp", code: "NY.GDP.MKTP.CD" },
          { key: "literacyAdult", code: "SE.ADT.LITR.ZS" },
          { key: "lifeExpectancy", code: "SP.DYN.LE00.IN" },
        ];

        const results = await Promise.all(
          indicators.map(async ({ key, code }) => {
            try {
              const res = await fetch(
                `https://api.worldbank.org/v2/country/${cca3}/indicator/${code}?format=json&date=2023&per_page=1`,
                { next: { revalidate: 86400 } }
              );
              const data = await res.json();
              return { key, value: data[1]?.[0]?.value ?? null };
            } catch {
              return { key, value: null };
            }
          })
        );

        const statsObj = Object.fromEntries(results.map(r => [r.key, r.value]));
        setStats(statsObj as Stats);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [cca3]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <DataRow 
        label="GDP per Capita" 
        value={stats?.gdpPerCapita ? `$${stats.gdpPerCapita.toLocaleString()}` : "Not available"} 
      />
      <DataRow 
        label="GDP (Total)" 
        value={stats?.gdp ? `$${(stats.gdp / 1e12).toFixed(2)}T` : "Not available"} 
      />
      <DataRow 
        label="Adult Literacy" 
        value={stats?.literacyAdult ? `${stats.literacyAdult.toFixed(1)}%` : "Not available"} 
      />
      <DataRow 
        label="Life Expectancy" 
        value={stats?.lifeExpectancy ? `${stats.lifeExpectancy.toFixed(1)} years` : "Not available"} 
      />
    </>
  );
}