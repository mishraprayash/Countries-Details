import { Suspense } from "react";
import {
  Globe, Users, TrendingUp, Map, Award, Star,
  Zap, Shield, Coins, Compass
} from "lucide-react";
import Link from "next/link";
import StatsCharts from "@/components/StatsCharts";
import CountryOfTheDay from "@/components/CountryOfTheDay";
import AnimatedCounter from "@/components/AnimatedCounter";
import GlobeBackground from "@/components/GlobeBackground";
import {
  FactOfTheDaySkeleton,
} from "./DashboardSkeletons";

interface Country {
  name: { common: string; official: string };
  population: number;
  area: number;
  region: string;
  independent?: boolean;
  landlocked: boolean;
  currencies?: Record<string, { name: string; symbol: string }>;
  flags: { svg: string };
}

interface DashboardContentProps {
  countries: Country[];
}

const REGION_COLORS: Record<string, { accent: string; glow: string; bg: string }> = {
  "Europe": { accent: "#3b82f6", glow: "rgba(59,130,246,0.15)", bg: "bg-blue-500/10" },
  "Asia": { accent: "#ef4444", glow: "rgba(239,68,68,0.15)", bg: "bg-red-500/10" },
  "Africa": { accent: "#f59e0b", glow: "rgba(245,158,11,0.15)", bg: "bg-amber-500/10" },
  "Americas": { accent: "#10b981", glow: "rgba(16,185,129,0.15)", bg: "bg-emerald-500/10" },
  "Oceania": { accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)", bg: "bg-violet-500/10" },
  "Antarctic": { accent: "#06b6d4", glow: "rgba(6,182,212,0.15)", bg: "bg-cyan-500/10" },
};

function DashboardStats({ countries }: DashboardContentProps) {
  const totalCountries = countries.length;
  const totalPopulation = countries.reduce((acc, c) => acc + c.population, 0);
  const totalArea = countries.reduce((acc, c) => acc + (c.area || 0), 0);
  const independentCount = countries.filter(c => c.independent === true).length;

  const stats = [
    { label: "Total Countries", value: totalCountries, icon: Globe, accent: "cyan" },
    { label: "Global Population", value: totalPopulation, icon: Users, accent: "cyan", suffix: "B", divisor: 1e9, decimals: 2 },
    { label: "Total Landmass", value: totalArea, icon: Map, accent: "amber", suffix: "M km²", divisor: 1e6, decimals: 1 },
    { label: "Independent", value: independentCount, icon: Shield, accent: "violet" },
  ];

  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const accentColor = stat.accent === "cyan" ? "text-cyan-glow" : stat.accent === "amber" ? "text-amber-glow" : "text-violet-glow";
        const accentBg = stat.accent === "cyan" ? "bg-cyan-glow/10" : stat.accent === "amber" ? "bg-amber-glow/10" : "bg-violet-glow/10";
        const accentBorder = stat.accent === "cyan" ? "border-cyan-glow/20" : stat.accent === "amber" ? "border-amber-glow/20" : "border-violet-glow/20";

        return (
          <div
            key={i}
            className={`stagger-fade-in stagger-delay-${i + 1} group relative rounded-2xl border ${accentBorder} bg-surface p-6 metric-glow overflow-hidden`}
          >
            <div className={`absolute inset-0 ${accentBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative z-10">
              <div className={`mb-4 inline-flex rounded-xl ${accentBg} p-2.5 ${accentColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">{stat.label}</p>
              <p className={`mt-2 text-3xl font-bold text-text-primary font-dm-mono`}>
                {stat.divisor ? (
                  <AnimatedCounter value={Math.round(stat.value / stat.divisor * Math.pow(10, stat.decimals!)) / Math.pow(10, stat.decimals!)} suffix={stat.suffix} />
                ) : (
                  <AnimatedCounter value={stat.value} />
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashboardCharts({ countries }: DashboardContentProps) {
  const regionStats = countries.reduce((acc, c) => {
    if (!acc[c.region]) {
      acc[c.region] = { count: 0, population: 0, area: 0 };
    }
    acc[c.region].count += 1;
    acc[c.region].population += c.population;
    acc[c.region].area += (c.area || 0);
    return acc;
  }, {} as Record<string, { count: number; population: number, area: number }>);

  const regionChartData = Object.entries(regionStats).map(([name, data]) => ({
    name,
    value: data.population,
  }));

  const sortedByPop = [...countries].sort((a, b) => b.population - a.population);
  const topByPopulation = sortedByPop.slice(0, 10);

  const populationChartData = topByPopulation.map(c => ({
    name: c.name.common,
    population: c.population,
  }));

  return <StatsCharts regionData={regionChartData} populationData={populationChartData} />;
}

function DashboardSecondaryStats({ countries }: DashboardContentProps) {
  const totalPopulation = countries.reduce((acc, c) => acc + c.population, 0);
  const landlockedCount = countries.filter(c => c.landlocked === true).length;
  const uniqueCurrencies = new Set(countries.flatMap(c => c.currencies ? Object.keys(c.currencies) : []));

  const regionStats = countries.reduce((acc, c) => {
    if (!acc[c.region]) {
      acc[c.region] = { count: 0, population: 0, area: 0 };
    }
    acc[c.region].count += 1;
    acc[c.region].population += c.population;
    acc[c.region].area += (c.area || 0);
    return acc;
  }, {} as Record<string, { count: number; population: number, area: number }>);

  const secondaryStats = [
    { label: "Global Regions", value: Object.keys(regionStats).length, icon: Map, accent: "pink" },
    { label: "Unique Currencies", value: uniqueCurrencies.size, icon: Coins, accent: "amber" },
    { label: "Landlocked", value: landlockedCount, icon: Compass, accent: "cyan" },
    { label: "Avg Pop / Country", value: Math.round(totalPopulation / countries.length / 1e6), icon: TrendingUp, accent: "cyan", suffix: "M" },
  ];

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {secondaryStats.map((stat, i) => {
        const Icon = stat.icon;
        const accentColor = stat.accent === "cyan" ? "text-cyan-glow" : stat.accent === "amber" ? "text-amber-glow" : stat.accent === "pink" ? "text-pink-400" : "text-cyan-glow";
        const accentBg = stat.accent === "cyan" ? "bg-cyan-glow/10" : stat.accent === "amber" ? "bg-amber-glow/10" : stat.accent === "pink" ? "bg-pink-500/10" : "bg-cyan-glow/10";

        return (
          <div key={i} className={`stagger-fade-in stagger-delay-${i + 5} glass-card rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentBg} ${accentColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{stat.label}</p>
              <p className="text-xl font-bold text-text-primary font-dm-mono">
                <AnimatedCounter value={stat.value} suffix={stat.suffix || ""} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashboardSpotlight({ countries }: DashboardContentProps) {
  const sortedByPop = [...countries].sort((a, b) => b.population - a.population);
  const sortedByArea = [...countries].sort((a, b) => (b.area || 0) - (a.area || 0));

  const topByPopulation = sortedByPop.slice(0, 10);
  const largestByArea = sortedByArea[0];
  const smallestByArea = sortedByArea[sortedByArea.length - 1];
  const largestByPop = topByPopulation[0];

  const regionStats = countries.reduce((acc, c) => {
    if (!acc[c.region]) {
      acc[c.region] = { count: 0, population: 0, area: 0 };
    }
    acc[c.region].count += 1;
    acc[c.region].population += c.population;
    acc[c.region].area += (c.area || 0);
    return acc;
  }, {} as Record<string, { count: number; population: number, area: number }>);

  const regionEntries = Object.entries(regionStats).sort((a, b) => b[1].population - a[1].population);

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-3">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Most Populous */}
        <div className="stagger-fade-in stagger-delay-1 glass-card rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-glow/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-glow/10">
              <Award className="h-6 w-6 text-cyan-glow" />
            </div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-[0.12em]">Most Populous</h3>
            <p className="mt-2 text-xs text-text-muted">The world&apos;s demographic leader</p>
            <div className="mt-6">
              <span className="text-3xl font-bold text-text-primary font-instrument-serif">{largestByPop?.name?.common || "N/A"}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-text-muted font-dm-mono">
              {((largestByPop?.population || 0) / 1000000).toFixed(1)} Million people
            </p>
            <Link
              href={`/country/${encodeURIComponent(largestByPop?.name?.common?.toLowerCase() || "")}`}
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-white/10 hover:border-white/20"
            >
              View Details <Zap className="h-4 w-4 text-amber-glow" />
            </Link>
          </div>
        </div>

        {/* Geographical Extremes */}
        <div className="stagger-fade-in stagger-delay-2 glass-card rounded-2xl p-6">
          <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.15em]">Geographical Extremes</h4>
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Largest by Area</p>
                <p className="text-sm font-semibold text-text-primary mt-1">{largestByArea?.name?.common || "N/A"}</p>
              </div>
              <span className="text-sm font-medium text-text-muted font-dm-mono">{((largestByArea?.area || 0) / 1000000).toFixed(1)}M km²</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-muted">Smallest by Area</p>
                <p className="text-sm font-semibold text-text-primary mt-1">{smallestByArea?.name?.common || "N/A"}</p>
              </div>
              <span className="text-sm font-medium text-text-muted font-dm-mono">{(smallestByArea?.area || 0).toLocaleString()} km²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Regional Distribution */}
      <div className="lg:col-span-2 stagger-fade-in stagger-delay-3 glass-card rounded-2xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary uppercase tracking-[0.12em]">
            <Star className="h-4 w-4 text-amber-glow" />
            Regional Distribution
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {regionEntries.map(([region, data]) => {
            const regionConfig = REGION_COLORS[region] || REGION_COLORS["Europe"];
            const popPercent = ((data.population / countries.reduce((acc, c) => acc + c.population, 0)) * 100).toFixed(1);

            return (
              <div
                key={region}
                className="group relative rounded-xl border border-white/5 p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02] hover:scale-[1.01] overflow-hidden"
              >
                {/* Accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: regionConfig.accent }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(ellipse at left, ${regionConfig.glow}, transparent 70%)` }} />

                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-text-primary">{region}</span>
                    <span className="text-[11px] text-text-muted">{data.count} Countries</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-text-primary font-dm-mono">
                      {((data.population || 0) / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-[10px] text-text-muted font-dm-mono">
                      {((data.area || 0) / 1000000).toFixed(1)}M km²
                    </span>
                    <span className="text-[10px] text-text-muted mt-1 block">
                      {popPercent}% of world pop.
                    </span>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(parseFloat(popPercent) * 3, 100)}%`,
                      backgroundColor: regionConfig.accent,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardContent({ countries }: DashboardContentProps) {
  return (
    <>
      {/* Hero Section */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/5 bg-atlas-900 p-8 sm:p-16 shadow-2xl">
        <GlobeBackground />
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold text-cyan-glow uppercase tracking-[0.2em] mb-4 font-sora">Global Intelligence Platform</p>
          <h1 className="text-4xl font-normal tracking-tight text-text-primary sm:text-6xl lg:text-7xl font-instrument-serif leading-[1.1]">
            World Insights
            <span className="text-cyan-glow"> Hub</span>
          </h1>
          <p className="mt-6 text-base text-text-muted sm:mt-8 sm:text-lg lg:text-xl leading-relaxed font-sora">
            Explore global demographics, population trends, and regional distributions through our interactive data dashboard.
          </p>
        </div>
      </div>

      {/* Fact of the Day */}
      <Suspense fallback={<FactOfTheDaySkeleton />}>
        <div className="w-full">
          <CountryOfTheDay countries={countries} />
        </div>
      </Suspense>

      {/* Divider */}
      <div className="section-divider" />

      {/* Stats */}
      <DashboardStats countries={countries} />

      {/* Charts */}
      <div className="mt-12">
        <DashboardCharts countries={countries} />
      </div>

      {/* Secondary Stats */}
      <DashboardSecondaryStats countries={countries} />

      {/* Spotlight */}
      <DashboardSpotlight countries={countries} />
    </>
  );
}
