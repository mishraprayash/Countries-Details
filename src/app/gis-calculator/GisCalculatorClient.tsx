"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getClientCountries, type CachedCountry } from "@/lib/clientCache";
import { Compass, Scale, Search, Clock, ArrowLeftRight } from "lucide-react";

const GisMap = dynamic(() => import("./GisMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center rounded-2xl border border-white/5 bg-atlas-900">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-cyan-glow" />
    </div>
  ),
});

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function getCompassDirection(bearing: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(bearing / 22.5) % 16;
  return dirs[index];
}

export default function GisCalculatorClient() {
  const [countries, setCountries] = useState<CachedCountry[]>([]);
  const [countryA, setCountryA] = useState<CachedCountry | null>(null);
  const [countryB, setCountryB] = useState<CachedCountry | null>(null);
  const [loading, setLoading] = useState(true);

  // Search filters
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);

  const dropdownRefA = useRef<HTMLDivElement>(null);
  const dropdownRefB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getClientCountries()
      .then((data) => {
        // Filter out countries without coordinates (latlng) or capital
        const valid = data.filter((c) => c.latlng && c.capital && c.capital.length > 0);
        const sorted = valid.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
        // Default select USA and Germany
        const defaultA = sorted.find((c) => c.cca3 === "USA");
        const defaultB = sorted.find((c) => c.cca3 === "DEU");
        if (defaultA) setCountryA(defaultA);
        if (defaultB) setCountryB(defaultB);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRefA.current && !dropdownRefA.current.contains(target)) {
        setShowDropdownA(false);
      }
      if (dropdownRefB.current && !dropdownRefB.current.contains(target)) {
        setShowDropdownB(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-glow" />
        <p className="text-muted font-sora">Loading GIS Calculator data...</p>
      </div>
    );
  }

  // Filter lists
  const filteredA = countries
    .filter((c) => c.name.common.toLowerCase().includes(searchA.toLowerCase()) && c.cca3 !== countryB?.cca3)
    .slice(0, 8);

  const filteredB = countries
    .filter((c) => c.name.common.toLowerCase().includes(searchB.toLowerCase()) && c.cca3 !== countryA?.cca3)
    .slice(0, 8);

  // Calculate Spatial values
  let distance = 0;
  let bearing = 0;
  let direction = "N/A";
  let tzDiffStr = "No offset difference";

  if (countryA?.latlng && countryB?.latlng) {
    const [lat1, lon1] = countryA.latlng;
    const [lat2, lon2] = countryB.latlng;
    distance = getHaversineDistance(lat1, lon1, lat2, lon2);
    bearing = getBearing(lat1, lon1, lat2, lon2);
    direction = getCompassDirection(bearing);

    // Timezone difference
    // Actually we can map the timezone dynamically, since we don't have timezones in clientCache, we can fetch offsets or guess.
    // Wait, clientCache does not store timezone list. That is fine, we can fallback to UTC time difference using geographic coordinates!
    // Timezone difference is roughly longitude / 15.
    const lonDiff = lon2 - lon1;
    const roughHours = Math.round(lonDiff / 15);
    const sign = roughHours >= 0 ? "+" : "";
    tzDiffStr = `${roughHours !== 0 ? `approx. ${sign}${roughHours} hours` : "approx. same time"}`;
  }

  const swapSelection = () => {
    const temp = countryA;
    setCountryA(countryB);
    setCountryB(temp);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-text-primary font-instrument-serif flex items-center gap-3">
          <Scale className="h-8 w-8 text-cyan-glow animate-pulse" />
          GIS Geodesic Calculator
        </h1>
        <p className="mt-2 text-sm text-muted font-sora">
          Compute the great-circle shortest distance (Haversine path), compass bearing angle, and travel coordinates between world capitals.
        </p>
      </div>

      {/* Selectors Panel */}
      <div className="relative z-20 grid gap-6 md:grid-cols-7 items-center mb-8 bg-white/[0.03] border border-white/5 p-6 rounded-3xl glass-card">
        {/* Country A Selection */}
        <div className="md:col-span-3 relative" ref={dropdownRefA}>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 font-sora">
            Starting Country (A)
          </label>
          <button
            onClick={() => setShowDropdownA(true)}
            className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-all font-sora text-left"
          >
            {countryA ? (
              <div className="flex items-center gap-3">
                <Image src={countryA.flags.svg} alt={countryA.name.common} width={24} height={16} className="rounded shadow-sm shrink-0" />
                <span className="font-bold text-text-primary text-sm">{countryA.name.common} <span className="text-muted font-normal text-xs">({countryA.capital?.[0]})</span></span>
              </div>
            ) : (
              <span className="text-muted text-sm">Select Starting Country</span>
            )}
            <Compass className="h-4 w-4 text-muted shrink-0" />
          </button>

          {showDropdownA && (
            <div className="absolute left-0 right-0 top-full mt-2 z-[5000] bg-atlas-900 border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchA}
                  onChange={(e) => setSearchA(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-muted focus:outline-none focus:border-cyan-glow font-sora"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredA.map((c) => (
                  <button
                    key={c.cca3}
                    onClick={() => {
                      setCountryA(c);
                      setShowDropdownA(false);
                      setSearchA("");
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left transition-colors"
                  >
                    <Image src={c.flags.svg} alt="" width={24} height={16} className="rounded shadow-sm shrink-0" />
                    <span className="text-xs text-text-primary font-bold">{c.name.common}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center">
          <button
            onClick={swapSelection}
            className="p-3 rounded-full bg-white/[0.05] border border-white/10 text-muted hover:text-text-primary transition-all active:scale-90 hover:rotate-180 duration-300 cursor-pointer"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
        </div>

        {/* Country B Selection */}
        <div className="md:col-span-3 relative" ref={dropdownRefB}>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 font-sora">
            Destination Country (B)
          </label>
          <button
            onClick={() => setShowDropdownB(true)}
            className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-all font-sora text-left"
          >
            {countryB ? (
              <div className="flex items-center gap-3">
                <Image src={countryB.flags.svg} alt={countryB.name.common} width={24} height={16} className="rounded shadow-sm shrink-0" />
                <span className="font-bold text-text-primary text-sm">{countryB.name.common} <span className="text-muted font-normal text-xs">({countryB.capital?.[0]})</span></span>
              </div>
            ) : (
              <span className="text-muted text-sm">Select Destination Country</span>
            )}
            <Compass className="h-4 w-4 text-muted shrink-0" />
          </button>

          {showDropdownB && (
            <div className="absolute left-0 right-0 top-full mt-2 z-[5000] bg-atlas-900 border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchB}
                  onChange={(e) => setSearchB(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-muted focus:outline-none focus:border-cyan-glow font-sora"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredB.map((c) => (
                  <button
                    key={c.cca3}
                    onClick={() => {
                      setCountryB(c);
                      setShowDropdownB(false);
                      setSearchB("");
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left transition-colors"
                  >
                    <Image src={c.flags.svg} alt="" width={24} height={16} className="rounded shadow-sm shrink-0" />
                    <span className="text-xs text-text-primary font-bold">{c.name.common}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main calculation layout */}
      {countryA && countryB && (
        <div className="relative z-10 grid gap-8 lg:grid-cols-3">
          {/* Spatial statistics details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Distance Card */}
            <div className="rounded-3xl border border-cyan-glow/20 bg-cyan-glow/5 p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-glow/10 rounded-full blur-3xl pointer-events-none" />
              <span className="text-[10px] font-bold text-cyan-glow uppercase tracking-[0.2em] block font-sora">Geodesic Distance</span>
              <p className="text-4xl font-black font-dm-mono text-text-primary mt-2">
                {Math.round(distance).toLocaleString()} <span className="text-lg font-bold">km</span>
              </p>
              <p className="text-xs text-text-muted mt-1 font-sora font-medium">
                ({Math.round(distance * 0.621371).toLocaleString()} miles)
              </p>
            </div>

            {/* Compass Heading Card */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-glow/5 rounded-full blur-3xl pointer-events-none" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block font-sora">Initial Bearing</span>
              <p className="text-3xl font-black font-dm-mono text-text-primary mt-2">
                {bearing.toFixed(1)}° <span className="text-lg font-bold text-amber-glow">{direction}</span>
              </p>
              <p className="text-xs text-text-muted mt-1 font-sora font-medium">
                Bearing direction from {countryA.capital?.[0]} to {countryB.capital?.[0]}.
              </p>
            </div>

            {/* Timezone offset / Geographic properties */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-6 shadow-xl">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block font-sora mb-4">Time Difference</span>
              <div className="flex items-center gap-3 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <Clock className="h-5 w-5 text-violet-glow" />
                <div className="font-sora">
                  <span className="text-xs font-bold text-text-primary block">{tzDiffStr}</span>
                  <span className="text-[10px] text-text-muted">Based on geographical longitude offsets.</span>
                </div>
              </div>
            </div>

            {/* Coordinate center point logs */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-6 shadow-xl space-y-4 font-sora">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block">Spatial Centers</span>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">{countryA.capital?.[0]}</span>
                  <span className="font-dm-mono font-semibold text-text-muted">{countryA.latlng?.[0].toFixed(4)}°, {countryA.latlng?.[1].toFixed(4)}°</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">{countryB.capital?.[0]}</span>
                  <span className="font-dm-mono font-semibold text-text-muted">{countryB.latlng?.[0].toFixed(4)}°, {countryB.latlng?.[1].toFixed(4)}°</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map (Right panel) */}
          <div className="lg:col-span-2 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
            <GisMap
              latA={countryA.latlng![0]}
              lngA={countryA.latlng![1]}
              nameA={countryA.name.common}
              capitalA={countryA.capital?.[0] || ""}
              flagA={countryA.flags.svg}
              latB={countryB.latlng![0]}
              lngB={countryB.latlng![1]}
              nameB={countryB.name.common}
              capitalB={countryB.capital?.[0] || ""}
              flagB={countryB.flags.svg}
            />
          </div>
        </div>
      )}
    </div>
  );
}
