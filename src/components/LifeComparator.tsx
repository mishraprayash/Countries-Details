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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] glass-card p-6 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-glow/5 via-transparent to-amber-glow/5 pointer-events-none" />
      
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl font-black text-text-primary mb-2 font-instrument-serif">If you moved from...</h2>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-14 relative rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 mb-3">
              <Image src={countryA.flags.svg} alt={countryA.name.common} fill className="object-cover" />
            </div>
            <span className="font-bold text-text-secondary font-sora">{countryA.name.common}</span>
          </div>
          
          <button
            type="button"
            onClick={onSwap}
            aria-label="Swap countries"
            className="group flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 p-3 rounded-full text-text-secondary transition-colors"
          >
            <ArrowRightLeft className="w-6 h-6" />
            <span className="hidden sm:inline text-sm font-bold text-text-secondary group-hover:text-text-primary font-sora">Swap</span>
          </button>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-14 relative rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 mb-3">
              <Image src={countryB.flags.svg} alt={countryB.name.common} fill className="object-cover" />
            </div>
            <span className="font-bold text-text-primary font-sora">{countryB.name.common}</span>
          </div>
        </div>
        <h3 className="text-2xl font-black text-cyan-glow mt-6 font-instrument-serif">...you would experience:</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl glass-card p-5 flex items-start gap-4">
          <div className={`p-3 rounded-xl ${popDiff > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-glow/20 text-cyan-glow"}`}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1 font-sora">Surrounding Population</p>
            <p className="text-lg text-text-primary leading-tight font-sora">
              Be around <span className={`font-black font-dm-mono ${popDiff > 0 ? "text-emerald-400" : "text-cyan-glow"}`}>
                {formatDiff(popDiff)} {popDiff > 0 ? "more" : "fewer"}
              </span> people.
            </p>
            <p className="text-xs text-muted mt-2 font-dm-mono">
              {countryB.name.common} has {(countryB.population || 0).toLocaleString()} people vs {(countryA.population || 0).toLocaleString()}.
            </p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl glass-card p-5 flex items-start gap-4">
          <div className={`p-3 rounded-xl ${areaDiff > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-glow/20 text-amber-glow"}`}>
            <Map className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1 font-sora">Country Size</p>
            <p className="text-lg text-text-primary leading-tight font-sora">
              Have a country that is <span className={`font-black font-dm-mono ${areaDiff > 0 ? "text-emerald-400" : "text-amber-glow"}`}>
                {formatDiff(areaDiff)} {areaDiff > 0 ? "larger" : "smaller"}
              </span> in landmass.
            </p>
            <p className="text-xs text-muted mt-2 font-dm-mono">
              {countryB.name.common} is {(countryB.area || 0).toLocaleString()} km² vs {(countryA.area || 0).toLocaleString()} km².
            </p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl glass-card p-5 flex items-start gap-4">
          <div className={`p-3 rounded-xl ${densityDiff < 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1 font-sora">Personal Space</p>
            <p className="text-lg text-text-primary leading-tight font-sora">
              Feel <span className={`font-black font-dm-mono ${densityDiff < 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatDiff(densityDiff)} {densityDiff > 0 ? "more crowded" : "less crowded"}
              </span> on average.
            </p>
            <p className="text-xs text-muted mt-2 font-dm-mono">
              Density: {Math.round(popDensityB)} people/km² vs {Math.round(popDensityA)} people/km².
            </p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl glass-card p-5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-glow/20 text-violet-glow">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1 font-sora">Daily Life</p>
            <p className="text-sm text-text-secondary leading-relaxed font-sora">
              You would start spending <span className="font-bold text-violet-glow">{getCurrencies(countryB)}</span> instead of {getCurrencies(countryA)}, 
              and you would hear people speaking <span className="font-bold text-violet-glow">{getLanguages(countryB)}</span> instead of {getLanguages(countryA)}.
            </p>
            {countryA.car?.side !== countryB.car?.side && (
              <p className="text-sm text-amber-glow font-bold mt-2 font-sora">
              You&apos;ll need to learn to drive on the {countryB.car?.side} side of the road!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
