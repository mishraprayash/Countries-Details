"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface ExtendedStatsProps {
  cca3: string;
}

interface TrendPoint {
  year: string;
  value: number;
}

interface MetricData {
  latest: { year: string; value: number } | null;
  history: TrendPoint[];
}

interface IndicatorConfig {
  key: string;
  code: string;
  label: string;
  desc: string;
  format: (v: number) => string;
  chartPrefix?: string;
  chartSuffix?: string;
}

const INDICATORS: IndicatorConfig[] = [
  { key: "gdp", code: "NY.GDP.MKTP.CD", label: "Gross Domestic Product (Total)", desc: "Total market value of all finished goods and services produced. Indicates economic size.", format: (v) => `$${(v / 1e12).toFixed(3)} Trillion`, chartPrefix: "$" },
  { key: "gdpPerCapita", code: "NY.GDP.PCAP.CD", label: "GDP per Capita (Current USD)", desc: "Average economic output per person. A core indicator of standard of living.", format: (v) => `$${Math.round(v).toLocaleString()}`, chartPrefix: "$" },
  { key: "inflation", code: "FP.CPI.TOTL.ZG", label: "Inflation Rate (Annual %)", desc: "Annual percentage change in the cost to the average consumer of acquiring a basket of goods.", format: (v) => `${v.toFixed(1)}%`, chartSuffix: "%" },
  { key: "unemployment", code: "SL.UEM.TOTL.ZS", label: "Unemployment Rate", desc: "Share of the labor force that is without work but available for and seeking employment.", format: (v) => `${v.toFixed(1)}%`, chartSuffix: "%" },
  { key: "popGrowth", code: "SP.POP.GROW", label: "Population Growth (Annual %)", desc: "Exponential rate of growth of midyear population from year t-1 to t.", format: (v) => `${v.toFixed(2)}%`, chartSuffix: "%" },
  { key: "lifeExpectancy", code: "SP.DYN.LE00.IN", label: "Life Expectancy at Birth", desc: "Average expected lifespan for a newborn under current mortality trends.", format: (v) => `${v.toFixed(1)} years`, chartSuffix: " yrs" },
  { key: "literacyAdult", code: "SE.ADT.LITR.ZS", label: "Adult Literacy Rate", desc: "Percentage of population ages 15+ who can read and write with understanding.", format: (v) => `${v.toFixed(1)}%`, chartSuffix: "%" },
  { key: "gini", code: "SI.POV.GINI", label: "GINI Income Inequality Index", desc: "Measures wealth distribution. 0 represents perfect equality, 100 maximum inequality.", format: (v) => v.toFixed(1) },
  { key: "co2", code: "EN.GHG.CO2.PC.CE.AR5", label: "CO₂ Emissions per Capita", desc: "Metric tons of CO₂ emissions per person (excluding land-use change).", format: (v) => `${v.toFixed(2)} tons`, chartSuffix: "t" },
  { key: "forest", code: "AG.LND.FRST.ZS", label: "Forest Area Coverage", desc: "Percentage of total land area covered by natural or planted forests.", format: (v) => `${v.toFixed(1)}%`, chartSuffix: "%" },
  { key: "agriculture", code: "AG.LND.AGRI.ZS", label: "Agricultural Land Usage", desc: "Share of land area used for farming, permanent crops, or pastures.", format: (v) => `${v.toFixed(1)}%`, chartSuffix: "%" },
];

function ExpandableDataRow({
  config,
  data,
}: {
  config: IndicatorConfig;
  data: MetricData | undefined;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasData = data && data.latest;
  const displayValue = hasData ? config.format(data.latest!.value) : "Not available";
  const displayYear = hasData ? data.latest!.year : "";

  return (
    <div className="border-b border-white/5 py-4 last:border-0">
      <div
        className={`flex items-start sm:items-center justify-between font-sora gap-4 ${hasData ? "cursor-pointer group" : "opacity-70"}`}
        onClick={() => hasData && setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold transition-colors ${hasData ? "text-text-primary group-hover:text-cyan-glow" : "text-muted"}`}>
              {config.label}
            </span>
            {hasData && (
              expanded ? (
                <ChevronUp className="h-4 w-4 text-cyan-glow" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted group-hover:text-cyan-glow transition-colors" />
              )
            )}
          </div>
          <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[90%]">{config.desc}</p>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end">
          <span className={`text-sm font-bold font-dm-mono ${hasData ? "text-text-primary" : "text-muted"}`}>
            {displayValue}
          </span>
          {displayYear && (
            <div className="text-[10px] text-cyan-glow mt-1 bg-cyan-glow/10 px-2 py-[2px] rounded-full border border-cyan-glow/20">
              Data: {displayYear}
            </div>
          )}
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="h-56 w-full p-4 bg-atlas-950/50 rounded-xl border border-white/5 relative">
            <h4 className="text-xs font-semibold text-muted mb-4 uppercase tracking-wider font-sora">
              Historical Trend (Available Data)
            </h4>
            {data?.history && data.history.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id={`color-${config.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="year" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#5A6A8A", fontSize: 10 }} 
                    dy={10}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: "#5A6A8A", fontSize: 10 }}
                    tickFormatter={(v) => {
                      if (v >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
                      if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
                      if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
                      if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                      return v.toFixed(0);
                    }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(12, 16, 32, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F0F4FF" }}
                    itemStyle={{ color: "#00D4FF", fontWeight: "bold" }}
                    labelStyle={{ color: "#5A6A8A", marginBottom: "4px" }}
                    formatter={(v: unknown) => {
                      if (typeof v !== 'number') return [String(v), config.label];
                      const formatted = config.format(v);
                      return [formatted, config.label];
                    }}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00D4FF" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill={`url(#color-${config.key})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted font-sora">
                <AlertCircle className="h-6 w-6 mb-2 opacity-50" />
                <span className="text-xs">Not enough historical data points to map a trend.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 py-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-white/[0.03] rounded-xl border border-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export default function ExtendedStats({ cca3 }: ExtendedStatsProps) {
  const [stats, setStats] = useState<Record<string, MetricData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"economy" | "demographics" | "environment">("economy");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch historical data for all indicators (last 30 years to get a robust trend)
        const results = await Promise.all(
          INDICATORS.map(async (ind) => {
            try {
              const res = await fetch(
                `https://api.worldbank.org/v2/country/${cca3}/indicator/${ind.code}?format=json&per_page=30`,
                { next: { revalidate: 86400 } }
              );
              const data = await res.json();
              const rawPoints = data[1] || [];

              // Filter out nulls and format
              const validPoints = rawPoints
                .filter((p: { value: number | null }) => p.value !== null)
                .map((p: { date: string; value: number }) => ({
                  year: p.date,
                  value: p.value,
                }));

              // WB API returns data sorted newest to oldest. 
              // The first valid point is the most recent.
              const latest = validPoints.length > 0 ? validPoints[0] : null;

              // For charting, reverse to chronological (oldest to newest)
              const history = [...validPoints].reverse();

              return { key: ind.key, data: { latest, history } };
            } catch {
              return { key: ind.key, data: { latest: null, history: [] } };
            }
          })
        );

        const statsMap = Object.fromEntries(results.map(r => [r.key, r.data]));
        setStats(statsMap);
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

  const economyKeys = ["gdp", "gdpPerCapita", "inflation", "unemployment"];
  const demographicsKeys = ["popGrowth", "lifeExpectancy", "literacyAdult", "gini"];
  const environmentKeys = ["co2", "forest", "agriculture"];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-white/5 mb-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("economy")}
          className={`flex-1 pb-3 px-2 whitespace-nowrap text-center text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer font-sora ${
            activeTab === "economy"
              ? "border-cyan-glow text-cyan-glow"
              : "border-transparent text-muted hover:text-text-primary"
          }`}
        >
          Economy & Markets
        </button>
        <button
          onClick={() => setActiveTab("demographics")}
          className={`flex-1 pb-3 px-2 whitespace-nowrap text-center text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer font-sora ${
            activeTab === "demographics"
              ? "border-cyan-glow text-cyan-glow"
              : "border-transparent text-muted hover:text-text-primary"
          }`}
        >
          Demographics & Society
        </button>
        <button
          onClick={() => setActiveTab("environment")}
          className={`flex-1 pb-3 px-2 whitespace-nowrap text-center text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer font-sora ${
            activeTab === "environment"
              ? "border-cyan-glow text-cyan-glow"
              : "border-transparent text-muted hover:text-text-primary"
          }`}
        >
          Environment & Land
        </button>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === "economy" && (
          <div className="flex flex-col">
            {economyKeys.map((key) => (
              <ExpandableDataRow 
                key={key} 
                config={INDICATORS.find(i => i.key === key)!} 
                data={stats?.[key]} 
              />
            ))}
          </div>
        )}

        {activeTab === "demographics" && (
          <div className="flex flex-col">
            {demographicsKeys.map((key) => (
              <ExpandableDataRow 
                key={key} 
                config={INDICATORS.find(i => i.key === key)!} 
                data={stats?.[key]} 
              />
            ))}
          </div>
        )}

        {activeTab === "environment" && (
          <div className="flex flex-col">
            {environmentKeys.map((key) => (
              <ExpandableDataRow 
                key={key} 
                config={INDICATORS.find(i => i.key === key)!} 
                data={stats?.[key]} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
