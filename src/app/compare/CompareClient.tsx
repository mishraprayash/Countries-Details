"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Search, Plus, Loader2, BarChart3, Sparkles } from "lucide-react";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COMPARE_PRESETS, type ComparePreset } from "@/constants/comparePresets";
import { getClientCountries } from "@/lib/clientCache";

interface CountryData {
  name: { common: string };
  cca3: string;
  flags: { svg: string };
  population?: number;
  area?: number;
  region?: string;
  subregion?: string;
  capital?: string[];
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  timezones?: string[];
  unMember?: boolean;
  independent?: boolean;
  landlocked?: boolean;
  car?: { side: string };
  tld?: string[];
  fifa?: string;
  startOfWeek?: string;
}

const CHART_COLORS = ["#00D4FF", "#F59E0B", "#8B5CF6", "#10B981", "#F43F5E"];

export default function CompareClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const fetchCountryDetails = async (codes: string[]): Promise<CountryData[]> => {
    if (!codes.length) return [];
    try {
      const res = await fetch(`/api/countries/details?codes=${codes.join(",")}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    getClientCountries()
      .then(async (data) => {
        const sorted = [...data].sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);

        const urlCountries = searchParams.get("countries");
        if (urlCountries) {
          const codes = urlCountries.split(",").slice(0, 5);
          const matched = sorted.filter((c) => codes.includes(c.cca3));
          if (matched.length > 0) {
            const details = await fetchCountryDetails(matched.map((c) => c.cca3));
            setSelectedCountries(details);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!activePreset) return;
    const codes = selectedCountries.map((c) => c.cca3).sort();
    const match = COMPARE_PRESETS.find((p) => {
      const pCodes = [...p.cca3].sort();
      return pCodes.length === codes.length && pCodes.every((c, i) => c === codes[i]);
    });
    
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!match) {
      setActivePreset(null);
    } else if (match.id !== activePreset) {
      setActivePreset(match.id);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedCountries, activePreset]);

  const updateUrl = useCallback((codes: string[]) => {
    if (codes.length > 0) {
      router.replace(`/compare?countries=${codes.join(",")}`, { scroll: false });
    } else {
      router.replace(`/compare`, { scroll: false });
    }
  }, [router]);

  const addCountry = async (country: CountryData) => {
    if (selectedCountries.length >= 5 || fetching) return;
    const newCodes = [...selectedCountries.map((c) => c.cca3), country.cca3];
    setFetching(true);
    const fullDetails = await fetchCountryDetails(newCodes);
    setSelectedCountries(fullDetails);
    updateUrl(newCodes);
    setFetching(false);
    setShowDropdown(false);
    setSearchQuery("");
    setActivePreset(null);
  };

  const removeCountry = (cca3: string) => {
    const newCodes = selectedCountries.filter((c) => c.cca3 !== cca3).map((c) => c.cca3);
    if (newCodes.length > 0) {
      fetchCountryDetails(newCodes).then((details) => {
        setSelectedCountries(details);
        updateUrl(newCodes);
      });
    } else {
      setSelectedCountries([]);
      updateUrl([]);
    }
    setActivePreset(null);
  };

  const applyPreset = useCallback(async (preset: ComparePreset) => {
    if (fetching) return;
    setFetching(true);
    setActivePreset(preset.id);
    const details = await fetchCountryDetails(preset.cca3);
    setSelectedCountries(details);
    setFetching(false);
    updateUrl(preset.cca3);
  }, [fetching, updateUrl]);

  const filteredCountries = countries
    .filter((c) => !selectedCountries.some((s) => s.cca3 === c.cca3))
    .filter((c) => c.name.common.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === "")
    .slice(0, 50); // Increased slice to show more search results

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PresetsSection activePreset={activePreset} applyPreset={applyPreset} fetching={fetching} />
      
      <CountryPicker 
        selectedCountries={selectedCountries} 
        loading={loading} 
        fetching={fetching}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredCountries={filteredCountries}
        addCountry={addCountry}
        removeCountry={removeCountry}
        triggerRef={triggerRef}
        dropdownRef={dropdownRef}
        mounted={mounted}
      />

      {selectedCountries.length >= 2 && (
        <div className="space-y-8">
          <ComparisonTable selectedCountries={selectedCountries} />
          <ComparisonCharts selectedCountries={selectedCountries} />
        </div>
      )}
    </div>
  );
}

// Subcomponents

function PresetsSection({ activePreset, applyPreset, fetching }: { 
  activePreset: string | null; 
  applyPreset: (p: ComparePreset) => void;
  fetching: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-amber-glow" />
        <h2 className="text-base font-semibold text-text-primary font-sora">Quick Presets</h2>
        <span className="text-xs text-muted font-sora">— one-click comparisons</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COMPARE_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          const accentMap: Record<string, string> = {
            cyan: "border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow",
            amber: "border-amber-glow/40 bg-amber-glow/10 text-amber-glow",
            violet: "border-violet-glow/40 bg-violet-glow/10 text-violet-glow",
            emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
            pink: "border-pink-400/40 bg-pink-400/10 text-pink-400",
          };
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              disabled={fetching}
              className={`text-left p-3 rounded-xl border transition-all font-sora disabled:opacity-50 ${
                isActive
                  ? accentMap[preset.accent] || accentMap.cyan
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-text-primary"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">{preset.name}</span>
                {isActive && <span className="text-[10px] uppercase tracking-wider">Active</span>}
              </div>
              <span className={`text-xs ${isActive ? "opacity-90" : "text-muted"}`}>{preset.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CountryPickerProps { selectedCountries: CountryData[]; loading: boolean; fetching: boolean; showDropdown: boolean; setShowDropdown: (val: boolean) => void; searchQuery: string; setSearchQuery: (val: string) => void; filteredCountries: CountryData[]; addCountry: (c: CountryData) => void; removeCountry: (c: string) => void; triggerRef: React.RefObject<HTMLButtonElement | null>; dropdownRef: React.RefObject<HTMLDivElement | null>; mounted: boolean; }
function CountryPicker({ 
  selectedCountries, loading, fetching, showDropdown, setShowDropdown, 
  searchQuery, setSearchQuery, filteredCountries, addCountry, removeCountry,
  triggerRef, dropdownRef, mounted 
}: CountryPickerProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6 relative z-50">
      <h2 className="text-lg font-semibold text-text-primary mb-4 font-sora">Select Countries to Compare (2-5)</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        {selectedCountries.map((country: CountryData) => (
          <div key={country.cca3} className="flex items-center gap-2 bg-cyan-glow/10 text-cyan-glow px-3 py-2 rounded-lg border border-cyan-glow/20 font-sora">
            <Image src={country.flags.svg} alt={country.name.common} width={24} height={16} className="rounded-sm object-cover" />
            <span className="text-sm font-medium">{country.name.common}</span>
            <button onClick={() => removeCountry(country.cca3)} className="hover:text-text-primary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {selectedCountries.length < 5 && (
          <div className="relative">
            <button
              ref={triggerRef}
              onClick={() => {
                if (loading) return;
                setShowDropdown(!showDropdown);
                if (showDropdown) setSearchQuery("");
              }}
              disabled={loading || fetching}
              className="flex items-center gap-2 text-muted hover:text-text-primary px-3 py-2 rounded-lg border border-dashed border-white/10 hover:border-white/20 transition-colors disabled:opacity-50 font-sora"
            >
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="text-sm">{loading ? "Loading..." : "Add Country"}</span>
            </button>

            {showDropdown && mounted && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 mt-2 z-[50] bg-atlas-900 border border-white/10 rounded-xl shadow-xl w-80 max-h-[60vh] flex flex-col"
              >
                <div className="p-3 border-b border-white/5 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-muted focus:outline-none focus:border-cyan-glow font-sora"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto p-2 flex-1">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country: CountryData) => (
                      <button
                        key={country.cca3}
                        onClick={() => addCountry(country)}
                        disabled={fetching}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left transition-colors disabled:opacity-50"
                      >
                        <Image src={country.flags.svg} alt={country.name.common} width={32} height={20} className="rounded-sm object-cover" />
                        <span className="text-sm text-text-primary">{country.name.common}</span>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-center text-sm text-muted">
                      {searchQuery ? "No countries found" : "No countries available"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCountries.length === 0 && <p className="text-sm text-muted font-sora">Select at least 2 countries to compare.</p>}
      {selectedCountries.length === 1 && <p className="text-sm text-muted font-sora">Select at least 1 more country to see the comparison.</p>}
    </div>
  );
}

const comparisonFields = [
  { key: "population", label: "Population", format: (v: unknown) => v ? (v as number).toLocaleString() : "N/A" },
  { key: "area", label: "Area (km²)", format: (v: unknown) => v ? (v as number).toLocaleString() : "N/A" },
  { key: "region", label: "Region", format: (v: unknown) => v as string || "N/A" },
  { key: "subregion", label: "Subregion", format: (v: unknown) => v as string || "N/A" },
  { key: "capital", label: "Capital", format: (v: unknown) => v ? (v as string[]).join(", ") : "N/A" },
  { key: "languages", label: "Languages", format: (v: unknown) => v ? Object.values(v as Record<string, string>).join(", ") : "N/A" },
  { key: "currencies", label: "Currencies", format: (v: unknown) => v ? Object.values(v as Record<string, { name: string; symbol: string }>).map((c) => `${c.name} (${c.symbol})`).join(", ") : "N/A" },
  { key: "timezones", label: "Timezones", format: (v: unknown) => v ? (v as string[]).slice(0, 3).join(", ") + ((v as string[]).length > 3 ? ` +${(v as string[]).length - 3}` : "") : "N/A" },
  { key: "unMember", label: "UN Member", format: (v: unknown) => v ? "Yes" : "No" },
  { key: "independent", label: "Independent", format: (v: unknown) => v ? "Yes" : "No" },
  { key: "landlocked", label: "Landlocked", format: (v: unknown) => v ? "Yes" : "No" },
  { key: "drivingSide", label: "Driving Side", format: (_: unknown, c: CountryData) => c.car?.side ? c.car.side.charAt(0).toUpperCase() + c.car.side.slice(1) : "N/A" },
  { key: "startOfWeek", label: "Start of Week", format: (v: unknown) => v ? (v as string).charAt(0).toUpperCase() + (v as string).slice(1) : "N/A" },
  { key: "tld", label: "TLD", format: (v: unknown) => v ? (v as string[]).join(", ") : "N/A" },
  { key: "fifa", label: "FIFA Code", format: (v: unknown) => v as string || "N/A" },
];

const getFieldValue = (country: CountryData, key: string): unknown => {
  const specialKeys: Record<string, string[]> = {
    capital: ["capital"], languages: ["languages"], currencies: ["currencies"],
    timezones: ["timezones"], unMember: ["unMember"], independent: ["independent"],
    landlocked: ["landlocked"], drivingSide: ["car", "side"], startOfWeek: ["startOfWeek"],
    tld: ["tld"], fifa: ["fifa"], subregion: ["subregion"],
  };

  if (specialKeys[key]) {
    let value: unknown = country;
    for (const k of specialKeys[key]) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  }
  return (country as unknown as Record<string, unknown>)[key];
};

function ComparisonTable({ selectedCountries }: { selectedCountries: CountryData[] }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-4 text-xs font-bold uppercase text-muted font-dm-mono w-40">Metric</th>
              {selectedCountries.map((country) => (
                <th key={country.cca3} className="text-center p-4 min-w-[200px]">
                  <div className="flex flex-col items-center gap-2">
                    <Image src={country.flags.svg} alt={country.name.common} width={48} height={32} className="rounded shadow object-cover" />
                    <span className="font-bold text-text-primary font-sora">{country.name.common}</span>
                    <Link href={`/country/${encodeURIComponent(country.name.common.toLowerCase())}`} className="text-xs text-cyan-glow hover:underline font-sora">
                      View Details
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map((field) => (
              <tr key={field.key} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                <td className="p-4 text-sm font-medium text-muted font-sora">{field.label}</td>
                {selectedCountries.map((country) => (
                  <td key={country.cca3} className="p-4 text-center text-sm text-text-secondary font-dm-mono">
                    {field.format(getFieldValue(country, field.key), country)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonCharts({ selectedCountries }: { selectedCountries: CountryData[] }) {
  const popData = selectedCountries.map((c) => ({ name: c.name.common, value: c.population || 0 }));
  const areaData = selectedCountries.map((c) => ({ name: c.name.common, value: c.area || 0 }));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ChartCard title="Population Comparison" icon={<BarChart3 className="h-5 w-5 text-cyan-glow" />} data={popData} format="M" />
      <ChartCard title="Area Comparison (km²)" icon={<BarChart3 className="h-5 w-5 text-amber-glow" />} data={areaData} format="M km²" />
    </div>
  );
}

function ChartCard({ title, icon, data, format }: { title: string, icon: React.ReactNode, data: {name: string, value: number}[], format: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
      <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 font-sora">
        {icon}
        {title}
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" tick={{ fill: "#5A6A8A", fontSize: 12 }} angle={-20} textAnchor="end" />
            <YAxis tick={{ fill: "#5A6A8A" }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ backgroundColor: "rgba(6, 8, 16, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F0F4FF" }}
              formatter={(value) => [typeof value === "number" ? (value / 1e6).toFixed(1) + " " + format : "N/A", title.split(" ")[0]]}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
