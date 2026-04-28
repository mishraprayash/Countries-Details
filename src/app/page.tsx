import { getAllCountries } from "@/lib/api";
import { 
  Globe, Users, TrendingUp, Map, Award, Star, 
  Zap, Shield, Coins, Compass 
} from "lucide-react";
import Link from "next/link";
import StatsCharts from "@/components/StatsCharts";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const countries = await getAllCountries();

  // Basic Stats
  const totalCountries = countries.length;
  const totalPopulation = countries.reduce((acc, c) => acc + c.population, 0);
  const totalArea = countries.reduce((acc, c) => acc + (c.area || 0), 0);
  
  // Independent Status
  const independentCount = countries.filter(c => c.independent).length;
  const landlockedCount = countries.filter(c => c.landlocked).length;

  // Languages & Currencies
  const uniqueCurrencies = new Set(countries.flatMap(c => c.currencies ? Object.keys(c.currencies) : []));

  // Stats by Region
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

  // Sorting
  const sortedByPop = [...countries].sort((a, b) => b.population - a.population);
  const sortedByArea = [...countries].sort((a, b) => (b.area || 0) - (a.area || 0));

  const topByPopulation = sortedByPop.slice(0, 10);
  const largestByArea = sortedByArea[0];
  const smallestByArea = sortedByArea[sortedByArea.length - 1];

  const populationChartData = topByPopulation.map(c => ({
    name: c.name.common,
    population: c.population,
  }));

  const largestByPop = topByPopulation[0];

  return (
    <main className="flex-1 pb-24 bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-zinc-50">
            <Globe className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">World Insights</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Navbar currentPage="dashboard" />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
              World Insights Hub
            </h1>
            <p className="mt-6 text-lg text-zinc-400 sm:text-xl leading-relaxed">
              Explore global demographics, population trends, and regional distributions with our interactive data dashboard.
            </p>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
        </div>

        {/* Top Level Metrics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Countries", value: totalCountries, icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Global Population", value: `${(totalPopulation / 1000000000).toFixed(2)}B`, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Total Landmass", value: `${(totalArea / 1000000).toFixed(1)}M km²`, icon: Map, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Independent", value: independentCount, icon: Shield, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          ].map((stat, i) => (
            <div key={i} className="group rounded-2xl border border-white/5 bg-zinc-900/50 p-6 shadow-sm transition-all hover:bg-zinc-900">
              <div className={`mb-4 inline-flex rounded-xl ${stat.bg} p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <StatsCharts 
            regionData={regionChartData} 
            populationData={populationChartData} 
          />
        </div>

        {/* Secondary Metrics */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Global Regions", value: Object.keys(regionStats).length, icon: Map, color: "text-pink-400", bg: "bg-pink-500/10" },
            { label: "Unique Currencies", value: uniqueCurrencies.size, icon: Coins, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Landlocked Countries", value: landlockedCount, icon: Compass, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "Avg. Pop / Country", value: `${(totalPopulation / totalCountries / 1000000).toFixed(1)}M`, icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-4 shadow-sm hover:bg-zinc-900 transition-colors">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{stat.label}</p>
                <p className="text-lg font-black text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Spotlight Cards */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Most Populous</h3>
              <p className="mt-2 text-sm text-zinc-400">The world&apos;s demographic leader</p>
              <div className="mt-6">
                <span className="text-3xl font-black text-white">{largestByPop?.name?.common || "N/A"}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-zinc-500">{((largestByPop?.population || 0) / 1000000).toFixed(1)} Million people</p>
              <Link 
                href={`/country/${encodeURIComponent(largestByPop?.name?.common?.toLowerCase() || "")}`}
                className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black transition-all hover:bg-zinc-200"
              >
                View Details <Zap className="h-4 w-4 text-amber-500" />
              </Link>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Geographical Extremes</h4>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Largest by Area</p>
                    <p className="text-sm font-bold text-white">{largestByArea?.name?.common || "N/A"}</p>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">{((largestByArea?.area || 0) / 1000000).toFixed(1)}M km²</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">Smallest by Area</p>
                    <p className="text-sm font-bold text-white">{smallestByArea?.name?.common || "N/A"}</p>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">{(smallestByArea?.area || 0).toLocaleString()} km²</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-zinc-900/50 p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <Star className="h-5 w-5 text-amber-500" />
                Regional Distribution
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(regionStats).map(([region, data]) => (
                <div key={region} className="flex items-center justify-between rounded-xl border border-white/5 p-4 transition-all hover:bg-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{region}</span>
                    <span className="text-xs text-zinc-500">{data.count} Countries</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-white">{((data.population || 0) / 1000000).toFixed(1)}M</span>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">{((data.area || 0) / 1000000).toFixed(1)}M km²</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
