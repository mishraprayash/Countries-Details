import { Users, Map, Coins, ArrowRightLeft } from "lucide-react";
import Image from "next/image";

interface CountryData {
  name: { common: string };
  cca3: string;
  flags: { svg: string };
  population?: number;
  area?: number;
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  timezones?: string[];
  car?: { side: string };
}

interface LifeComparatorProps {
  countryA: CountryData;
  countryB: CountryData;
  onSwap: () => void;
}

export default function LifeComparator({ countryA, countryB, onSwap }: LifeComparatorProps) {
  if (!countryA || !countryB) return null;

  const getDifference = (a: number, b: number) => {
    if (a === 0) return 0;
    return ((b - a) / a) * 100;
  };

  const popDiff = getDifference(countryA.population || 0, countryB.population || 0);
  const areaDiff = getDifference(countryA.area || 0, countryB.area || 0);
  
  const popDensityA = (countryA.population || 0) / (countryA.area || 1);
  const popDensityB = (countryB.population || 0) / (countryB.area || 1);
  const densityDiff = getDifference(popDensityA, popDensityB);

  const formatDiff = (diff: number) => {
    const abs = Math.abs(diff);
    return abs > 1000 ? `${(abs / 100).toFixed(1)}x` : `${abs.toFixed(1)}%`;
  };

  const getCurrencies = (c: CountryData) => c.currencies ? Object.values(c.currencies).map(cur => cur.name).join(", ") : "Unknown";
  const getLanguages = (c: CountryData) => c.languages ? Object.values(c.languages).join(", ") : "Unknown";

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-amber-500/5 pointer-events-none" />
      
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl font-black text-white mb-2">If you moved from...</h2>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-14 relative rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 mb-3">
              <Image src={countryA.flags.svg} alt={countryA.name.common} fill className="object-cover" />
            </div>
            <span className="font-bold text-zinc-300">{countryA.name.common}</span>
          </div>
          
          <button
            type="button"
            onClick={onSwap}
            aria-label="Swap countries"
            className="group flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/5 hover:border-white/10 p-3 rounded-full text-zinc-300 transition-colors"
          >
            <ArrowRightLeft className="w-6 h-6" />
            <span className="hidden sm:inline text-sm font-bold text-zinc-300 group-hover:text-white">Swap</span>
          </button>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-14 relative rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 mb-3">
              <Image src={countryB.flags.svg} alt={countryB.name.common} fill className="object-cover" />
            </div>
            <span className="font-bold text-white">{countryB.name.common}</span>
          </div>
        </div>
        <h3 className="text-2xl font-black text-indigo-400 mt-6">...you would experience:</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        
        {/* Population */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className={`p-3 rounded-xl ${popDiff > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Surrounding Population</p>
            <p className="text-lg text-white leading-tight">
              Be around <span className={`font-black ${popDiff > 0 ? "text-emerald-400" : "text-blue-400"}`}>
                {formatDiff(popDiff)} {popDiff > 0 ? "more" : "fewer"}
              </span> people.
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              {countryB.name.common} has {(countryB.population || 0).toLocaleString()} people vs {(countryA.population || 0).toLocaleString()}.
            </p>
          </div>
        </div>

        {/* Space */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className={`p-3 rounded-xl ${areaDiff > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
            <Map className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Country Size</p>
            <p className="text-lg text-white leading-tight">
              Have a country that is <span className={`font-black ${areaDiff > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {formatDiff(areaDiff)} {areaDiff > 0 ? "larger" : "smaller"}
              </span> in landmass.
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              {countryB.name.common} is {(countryB.area || 0).toLocaleString()} km² vs {(countryA.area || 0).toLocaleString()} km².
            </p>
          </div>
        </div>

        {/* Crowdedness */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className={`p-3 rounded-xl ${densityDiff < 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Personal Space</p>
            <p className="text-lg text-white leading-tight">
              Feel <span className={`font-black ${densityDiff < 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatDiff(densityDiff)} {densityDiff > 0 ? "more crowded" : "less crowded"}
              </span> on average.
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Density: {Math.round(popDensityB)} people/km² vs {Math.round(popDensityA)} people/km².
            </p>
          </div>
        </div>

        {/* Culture / Economy */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Daily Life</p>
            <p className="text-sm text-white leading-relaxed">
              You would start spending <span className="font-bold text-purple-400">{getCurrencies(countryB)}</span> instead of {getCurrencies(countryA)}, 
              and you would hear people speaking <span className="font-bold text-purple-400">{getLanguages(countryB)}</span> instead of {getLanguages(countryA)}.
            </p>
            {countryA.car?.side !== countryB.car?.side && (
              <p className="text-sm text-amber-400 font-bold mt-2">
              You&apos;ll need to learn to drive on the {countryB.car?.side} side of the road!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
