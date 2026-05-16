"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Search, Plus, Loader2, BarChart3 } from "lucide-react";
import { createPortal } from "react-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

interface DropdownPos {
  top: number;
  left: number;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos>({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openDropdown = useCallback((buttonEl: HTMLButtonElement) => {
    const rect = buttonEl.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    setShowDropdown(true);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const fetchCountryDetails = async (codes: string[]): Promise<CountryData[]> => {
    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codes.join(",")}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca3,flags,population,area")
      .then(res => res.json())
      .then((data: CountryData[]) => {
        const sorted = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);

        const urlCountries = searchParams.get("countries");
        if (urlCountries) {
          const codes = urlCountries.split(",").slice(0, 3);
          const matched = sorted.filter((c) => codes.includes(c.cca3));
          if (matched.length >= 2) {
            fetchCountryDetails(matched.map((c) => c.cca3)).then(setSelectedCountries);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const addCountry = async (country: CountryData) => {
    if (selectedCountries.length >= 3 || fetching) return;

    const newCodes = [...selectedCountries.map((c) => c.cca3), country.cca3];
    setFetching(true);
    const fullDetails = await fetchCountryDetails(newCodes);
    setSelectedCountries(fullDetails);
    setFetching(false);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const removeCountry = (cca3: string) => {
    const newCodes = selectedCountries.filter((c) => c.cca3 !== cca3).map((c) => c.cca3);
    if (newCodes.length > 0) {
      fetchCountryDetails(newCodes).then(setSelectedCountries);
    } else {
      setSelectedCountries([]);
    }
  };

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

  const filteredCountries = countries
    .filter((c) => !selectedCountries.some((s) => s.cca3 === c.cca3))
    .filter((c) => c.name.common.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === "")
    .slice(0, 15);

  const countryPicker = (
    <div className="mb-8 rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4 font-sora">Select Countries to Compare (2-3)</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        {selectedCountries.map((country) => (
          <div key={country.cca3} className="flex items-center gap-2 bg-cyan-glow/10 text-cyan-glow px-3 py-2 rounded-lg border border-cyan-glow/20 font-sora">
            <Image src={country.flags.svg} alt={country.name.common} width={24} height={16} className="rounded-sm" />
            <span className="text-sm font-medium">{country.name.common}</span>
            <button onClick={() => removeCountry(country.cca3)} className="hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {selectedCountries.length < 3 && (
          <div className="relative">
            <button
              onClick={(e) => {
                if (loading) return;
                if (showDropdown) {
                  setShowDropdown(false);
                  setSearchQuery("");
                } else {
                  openDropdown(e.currentTarget);
                }
              }}
              disabled={loading || fetching}
              className="flex items-center gap-2 text-muted hover:text-text-primary px-3 py-2 rounded-lg border border-dashed border-white/10 hover:border-white/20 transition-colors disabled:opacity-50 font-sora"
            >
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="text-sm">{loading ? "Loading..." : "Add Country"}</span>
            </button>

            {showDropdown && mounted && createPortal(
              <div className="fixed inset-0 z-[5000]" onClick={() => { setShowDropdown(false); setSearchQuery(""); }}>
                <div
                  ref={dropdownRef}
                  className="fixed bg-atlas-900 border border-white/10 rounded-xl shadow-xl w-80 max-h-[80vh]"
                  style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
                >
                  <div className="p-3 border-b border-white/5">
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
                  <div className="max-h-80 overflow-y-auto p-2">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.cca3}
                          onClick={() => addCountry(country)}
                          disabled={fetching}
                          className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left transition-colors disabled:opacity-50"
                        >
                          <Image src={country.flags.svg} alt={country.name.common} width={32} height={20} className="rounded-sm" />
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
              </div>,
              document.body
            )}
          </div>
        )}
      </div>

      {selectedCountries.length === 0 && <p className="text-sm text-muted font-sora">Select at least 2 countries to compare.</p>}
    </div>
  );

  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary font-instrument-serif">Compare Countries</h1>
          <p className="mt-2 text-sm sm:text-base text-muted font-sora">Select 2-3 countries to compare side-by-side with visual charts.</p>
        </div>

        {countryPicker}

        {selectedCountries.length >= 2 && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-xs font-bold uppercase text-muted font-dm-mono w-40">Metric</th>
                      {selectedCountries.map((country) => (
                        <th key={country.cca3} className="text-center p-4 min-w-[200px]">
                          <div className="flex flex-col items-center gap-2">
                            <Image src={country.flags.svg} alt={country.name.common} width={48} height={32} className="rounded shadow" />
                            <span className="font-bold text-text-primary font-sora">{country.name.common}</span>
                            <Link href={`/country/${encodeURIComponent(country.name.common.toLowerCase())}`} className="text-xs text-cyan-glow hover:underline font-sora">View Details</Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFields.map((field) => (
                      <tr key={field.key} className="border-b border-white/5 hover:bg-white/[0.03]">
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

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
                <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 font-sora">
                  <BarChart3 className="h-5 w-5 text-cyan-glow" />
                  Population Comparison
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedCountries.map((c) => ({ name: c.name.common, value: c.population || 0 }))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: "#5A6A8A", fontSize: 12 }} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fill: "#5A6A8A" }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{ backgroundColor: "rgba(6, 8, 16, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F0F4FF" }}
                        formatter={(value) => [typeof value === "number" ? (value / 1e6).toFixed(1) + "M" : "N/A", "Population"]}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={80}>
                        {selectedCountries.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? "#00D4FF" : i === 1 ? "#F59E0B" : "#8B5CF6"} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
                <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 font-sora">
                  <BarChart3 className="h-5 w-5 text-amber-glow" />
                  Area Comparison (km²)
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedCountries.map((c) => ({ name: c.name.common, value: c.area || 0 }))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: "#5A6A8A", fontSize: 12 }} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fill: "#5A6A8A" }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{ backgroundColor: "rgba(6, 8, 16, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F0F4FF" }}
                        formatter={(value) => [typeof value === "number" ? (value / 1e6).toFixed(1) + "M km²" : "N/A", "Area"]}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={80}>
                        {selectedCountries.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? "#00D4FF" : i === 1 ? "#F59E0B" : "#8B5CF6"} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
