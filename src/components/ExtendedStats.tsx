"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ExtendedStatsProps {
  cca3: string;
}

interface TrendPoint {
  year: string;
  value: number | null;
}

interface Stats {
  gdpPerCapita: number | null;
  gdp: number | null;
  literacyAdult: number | null;
  lifeExpectancy: number | null;
  gdpHistory: TrendPoint[];
  lifeExpectancyHistory: TrendPoint[];
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0 font-sora">
      <span className="text-sm font-medium text-muted">{label}</span>
      <span className="text-sm font-bold text-text-primary font-dm-mono">{value}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 py-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-5 bg-white/[0.05] rounded animate-pulse" />
      ))}
    </div>
  );
}

export default function ExtendedStats({ cca3 }: ExtendedStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"metrics" | "gdp" | "life">("metrics");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const indicators = [
          { key: "gdpPerCapita", code: "NY.GDP.PCAP.CD" },
          { key: "gdp", code: "NY.GDP.MKTP.CD" },
          { key: "literacyAdult", code: "SE.ADT.LITR.ZS" },
          { key: "lifeExpectancy", code: "SP.DYN.LE00.IN" },
        ];

        // Fetch single year for metrics
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

        // Fetch history (last 10 years)
        const fetchHistory = async (code: string): Promise<TrendPoint[]> => {
          try {
            const res = await fetch(
              `https://api.worldbank.org/v2/country/${cca3}/indicator/${code}?format=json&date=2013:2023&per_page=20`,
              { next: { revalidate: 86400 } }
            );
            const data = await res.json();
            const rawPoints = data[1] || [];
            return rawPoints
              .map((p: { date: string; value: number | null }) => ({
                year: p.date,
                value: p.value,
              }))
              .filter((p: TrendPoint) => p.value !== null)
              .reverse(); // ascending order
          } catch {
            return [];
          }
        };

        const gdpHistory = await fetchHistory("NY.GDP.PCAP.CD");
        const lifeExpectancyHistory = await fetchHistory("SP.DYN.LE00.IN");

        const statsObj = Object.fromEntries(results.map(r => [r.key, r.value]));
        setStats({
          ...(statsObj as Omit<Stats, "gdpHistory" | "lifeExpectancyHistory">),
          gdpHistory,
          lifeExpectancyHistory,
        });
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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer font-sora ${
            activeTab === "metrics"
              ? "border-cyan-glow text-cyan-glow"
              : "border-transparent text-muted hover:text-text-primary"
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setActiveTab("gdp")}
          className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer font-sora ${
            activeTab === "gdp"
              ? "border-cyan-glow text-cyan-glow"
              : "border-transparent text-muted hover:text-text-primary"
          }`}
        >
          GDP Per Capita Trend
        </button>
        <button
          onClick={() => setActiveTab("life")}
          className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer font-sora ${
            activeTab === "life"
              ? "border-cyan-glow text-cyan-glow"
              : "border-transparent text-muted hover:text-text-primary"
          }`}
        >
          Life Expectancy Trend
        </button>
      </div>

      {activeTab === "metrics" && (
        <div className="divide-y divide-white/5">
          <DataRow 
            label="GDP per Capita (Current USD)" 
            value={stats?.gdpPerCapita ? `$${stats.gdpPerCapita.toLocaleString()}` : "Not available"} 
          />
          <DataRow 
            label="GDP (Total Market Value)" 
            value={stats?.gdp ? `$${(stats.gdp / 1e12).toFixed(2)}T` : "Not available"} 
          />
          <DataRow 
            label="Adult Literacy Rate" 
            value={stats?.literacyAdult ? `${stats.literacyAdult.toFixed(1)}%` : "Not available"} 
          />
          <DataRow 
            label="Life Expectancy at Birth" 
            value={stats?.lifeExpectancy ? `${stats.lifeExpectancy.toFixed(1)} years` : "Not available"} 
          />
        </div>
      )}

      {activeTab === "gdp" && (
        <div className="h-64 w-full">
          {stats?.gdpHistory && stats.gdpHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.gdpHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gdpColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#5A6A8A", fontSize: 11 }} />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#5A6A8A", fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1e3).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(12, 16, 32, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F0F4FF" }}
                  formatter={(v) => [`$${(v as number).toLocaleString()}`, "GDP Per Capita"]}
                />
                <Area type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#gdpColor)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted text-sm font-sora">
              No historical GDP data available
            </div>
          )}
        </div>
      )}

      {activeTab === "life" && (
        <div className="h-64 w-full">
          {stats?.lifeExpectancyHistory && stats.lifeExpectancyHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.lifeExpectancyHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lifeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#5A6A8A", fontSize: 11 }} />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#5A6A8A", fontSize: 11 }}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(12, 16, 32, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F0F4FF" }}
                  formatter={(v) => [`${(v as number).toFixed(1)} years`, "Life Expectancy"]}
                />
                <Area type="monotone" dataKey="value" stroke="#A78BFA" strokeWidth={2} fillOpacity={1} fill="url(#lifeColor)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted text-sm font-sora">
              No historical life expectancy data available
            </div>
          )}
        </div>
      )}
    </div>
  );
}