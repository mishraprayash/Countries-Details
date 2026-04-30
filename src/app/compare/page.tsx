"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, X, Search, Plus, Loader2, Swords, Scale } from "lucide-react";
import Navbar from "@/components/Navbar";
import BattleMode from "@/components/BattleMode";
import LifeComparator from "@/components/LifeComparator";

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

export default function ComparePage() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mode, setMode] = useState<"compare" | "battle" | "life">("compare");

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca3,flags,population,area")
      .then(res => res.json())
      .then((data: CountryData[]) => {
        setCountries(data.sort((a, b) => a.name.common.localeCompare(b.name.common)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchCountryDetails = async (codes: string[]): Promise<CountryData[]> => {
    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codes.join(",")}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const addCountry = async (country: CountryData) => {
    if (selectedCountries.length >= 3 || fetching) return;
    
    const newCodes = [...selectedCountries.map(c => c.cca3), country.cca3];
    setFetching(true);
    const fullDetails = await fetchCountryDetails(newCodes);
    setSelectedCountries(fullDetails);
    setFetching(false);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const removeCountry = (cca3: string) => {
    const newCodes = selectedCountries.filter(c => c.cca3 !== cca3).map(c => c.cca3);
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
    { key: "currencies", label: "Currencies", format: (v: unknown) => v ? Object.values(v as Record<string, { name: string; symbol: string }>).map(c => `${c.name} (${c.symbol})`).join(", ") : "N/A" },
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
      tld: ["tld"], fifa: ["fifa"], subregion: ["subregion"]
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
    .filter(c => !selectedCountries.some(s => s.cca3 === c.cca3))
    .filter(c => c.name.common.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === "")
    .slice(0, 15);

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
      <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2 sm:px-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 pr-2">
            <Globe className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold hidden md:inline">World Insights</span>
          </Link>
          <Navbar />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-black text-white">World Arena</h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400">Compare countries side-by-side, test your knowledge in Battle Mode, or simulate moving abroad.</p>
          </div>
          
          {/* Mode Toggle - Proper responsive design */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button
              onClick={() => setMode("compare")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${mode === "compare" ? "bg-white text-black border-white shadow-sm" : "bg-transparent text-zinc-400 border-white/10 hover:text-white hover:border-white/20"}`}
            >
              <Scale className="h-4 w-4" /> 
              <span className="hidden md:inline">Compare</span>
              <span className="lg:hidden">Compare</span>

            </button>
            <button
              onClick={() => setMode("life")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${mode === "life" ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-transparent text-zinc-400 border-white/10 hover:text-white hover:border-white/20"}`}
            >
              <Globe className="h-4 w-4" /> 
              <span className="hidden lg:inline">Move Abroad</span>
              <span className="lg:hidden">Abroad</span>
            </button>
            <button
              onClick={() => setMode("battle")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${mode === "battle" ? "bg-indigo-500 text-white border-indigo-500 shadow-sm" : "bg-transparent text-zinc-400 border-white/10 hover:text-white hover:border-white/20"}`}
            >
              <Swords className="h-4 w-4" /> 
              <span className="hidden lg:inline">Battle Mode</span>
              <span className="lg:hidden">Battle</span>
            </button>
          </div>
        </div>

        {mode === "battle" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BattleMode countries={countries} />
          </div>
        ) : mode === "life" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Select 2 Countries to Simulate Moving</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {selectedCountries.slice(0, 2).map((country) => (
                  <div key={country.cca3} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-lg border border-emerald-500/20">
                    <Image src={country.flags.svg} alt={country.name.common} width={24} height={16} className="rounded-sm" />
                    <span className="text-sm font-medium">{country.name.common}</span>
                    <button onClick={() => removeCountry(country.cca3)} className="hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {selectedCountries.length < 2 && (
                  <div className="relative">
                    <button
                      onClick={() => { if (!loading) setShowDropdown(!showDropdown); }}
                      disabled={loading || fetching}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-2 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors disabled:opacity-50"
                    >
                      {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      <span className="text-sm">{loading ? "Loading..." : "Add Country"}</span>
                    </button>
                    
                    {showDropdown && !loading && (
                      <div className="absolute top-full mt-2 left-0 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-[100]">
                        <div className="p-3 border-b border-white/5">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                              type="text"
                              placeholder="Search countries..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              autoFocus
                              className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
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
                                <span className="text-sm text-white">{country.name.common}</span>
                              </button>
                            ))
                          ) : (
                            <p className="p-4 text-center text-sm text-zinc-500">
                              {searchQuery ? "No countries found" : "No countries available"}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {showDropdown && <div className="fixed inset-0 z-[50]" onClick={() => setShowDropdown(false)} />}
              </div>
            </div>

            {selectedCountries.length >= 2 ? (
              <LifeComparator 
                countryA={selectedCountries[0]} 
                countryB={selectedCountries[1]} 
                onSwap={() => {
                  const newSelected = [...selectedCountries];
                  [newSelected[0], newSelected[1]] = [newSelected[1], newSelected[0]];
                  setSelectedCountries(newSelected);
                }}
              />
            ) : (
              <div className="p-12 text-center border border-white/5 bg-zinc-900/30 rounded-2xl">
                <p className="text-zinc-500">Please select two countries above to simulate moving.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select Countries to Compare (2-3)</h2>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedCountries.map((country) => (
              <div key={country.cca3} className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-2 rounded-lg border border-blue-500/20">
                <Image src={country.flags.svg} alt={country.name.common} width={24} height={16} className="rounded-sm" />
                <span className="text-sm font-medium">{country.name.common}</span>
                <button onClick={() => removeCountry(country.cca3)} className="hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {selectedCountries.length < 3 && (
              <div className="relative">
                <button
                  onClick={() => { if (!loading) setShowDropdown(!showDropdown); }}
                  disabled={loading || fetching}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-2 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors disabled:opacity-50"
                >
                  {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span className="text-sm">{loading ? "Loading..." : "Add Country"}</span>
                </button>
                
                {showDropdown && !loading && (
                  <div className="absolute top-full mt-2 left-0 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-[100]">
                    <div className="p-3 border-b border-white/5">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
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
                            <span className="text-sm text-white">{country.name.common}</span>
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-center text-sm text-zinc-500">
                          {searchQuery ? "No countries found" : "No countries available"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {showDropdown && <div className="fixed inset-0 z-[50]" onClick={() => setShowDropdown(false)} />}
          </div>

          {selectedCountries.length === 0 && <p className="text-sm text-zinc-500">Select at least 2 countries to compare.</p>}
        </div>

        {selectedCountries.length >= 2 && (
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-xs font-bold uppercase text-zinc-500 w-40">Metric</th>
                    {selectedCountries.map((country) => (
                      <th key={country.cca3} className="text-center p-4 min-w-[200px]">
                        <div className="flex flex-col items-center gap-2">
                          <Image src={country.flags.svg} alt={country.name.common} width={48} height={32} className="rounded shadow" />
                          <span className="font-bold text-white">{country.name.common}</span>
                          <Link href={`/country/${country.name.common.toLowerCase()}`} className="text-xs text-blue-400 hover:underline">View Details</Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFields.map((field) => (
                    <tr key={field.key} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-sm font-medium text-zinc-400">{field.label}</td>
                      {selectedCountries.map((country) => (
                        <td key={country.cca3} className="p-4 text-center text-sm text-white">
                          {field.format(getFieldValue(country, field.key), country)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
        )}
      </div>
    </main>
  );
}