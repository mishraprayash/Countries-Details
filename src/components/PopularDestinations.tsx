"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { 
  MapPin, ExternalLink, Search, Map, Landmark, HelpCircle
} from "lucide-react";
import locationsData from "@/data/locations.json";

// Dynamically import Leaflet Map component with SSR disabled
const DestinationsMap = dynamic(() => import("./DestinationsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] lg:h-full min-h-[400px] bg-atlas-900 rounded-2xl border border-white/5 flex items-center justify-center">
      <div className="text-muted font-sora flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-glow"></div>
        <span>Loading map view...</span>
      </div>
    </div>
  )
});

interface LocationItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  country: string;
}

interface PopularDestinationsProps {
  countryName?: string;
}

interface WikiDetails {
  extract: string;
  thumbnailUrl?: string;
  wikiUrl?: string;
  loading: boolean;
}

// Global memory cache to prevent duplicate fetches across renders
const wikiCache: Record<string, Omit<WikiDetails, "loading">> = {};

function normalizeCountryName(name: string): string {
  const mapping: Record<string, string> = {
    "united states": "USA",
    "united states of america": "USA",
    "united arab emirates": "UAE",
    "united kingdom of great britain and northern ireland": "United Kingdom",
    "uk": "United Kingdom",
    "democratic republic of the congo": "DR Congo",
    "congo (democratic republic of the)": "DR Congo",
  };
  const normalized = name.toLowerCase().trim();
  return mapping[normalized] || name;
}

export default function PopularDestinations({ countryName }: PopularDestinationsProps) {
  // 1. Compile all unique countries with destinations in locations.json
  const availableCountries = React.useMemo(() => {
    const list: string[] = [];
    Object.values(locationsData).forEach((regionData) => {
      Object.values(regionData).forEach((locationsArr) => {
        locationsArr.forEach((loc) => {
          if (!list.includes(loc.country)) {
            list.push(loc.country);
          }
        });
      });
    });
    return list.sort();
  }, []);

  // 2. Select initial country
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    if (countryName) {
      const normalized = normalizeCountryName(countryName);
      // Try exact or substring match
      const match = availableCountries.find(
        (c) => c.toLowerCase() === normalized.toLowerCase() || normalized.toLowerCase().includes(c.toLowerCase())
      );
      return match || "France"; // fallback
    }
    return "France";
  });

  // 3. Filter destinations for selected country
  const countryDestinations = React.useMemo(() => {
    const result: LocationItem[] = [];
    Object.values(locationsData).forEach((regionData) => {
      Object.values(regionData).forEach((locationsArr) => {
        locationsArr.forEach((loc) => {
          if (loc.country.toLowerCase() === selectedCountry.toLowerCase()) {
            // Avoid duplicates
            if (!result.some((r) => r.name === loc.name)) {
              result.push(loc);
            }
          }
        });
      });
    });
    return result;
  }, [selectedCountry]);

  const [activeDestination, setActiveDestination] = useState<LocationItem | null>(null);
  const [wikiData, setWikiData] = useState<Record<string, WikiDetails>>({});

  // Sync state if countryName prop changes
  useEffect(() => {
    if (countryName) {
      const normalized = normalizeCountryName(countryName);
      const match = availableCountries.find(
        (c) => c.toLowerCase() === normalized.toLowerCase() || normalized.toLowerCase().includes(c.toLowerCase())
      );
      if (match) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setSelectedCountry(match);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    }
  }, [countryName, availableCountries]);

  // Set active destination to first on load
  useEffect(() => {
    if (countryDestinations.length > 0) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setActiveDestination(countryDestinations[0]);
      /* eslint-enable react-hooks/set-state-in-effect */
    } else {
      setActiveDestination(null);
    }
  }, [countryDestinations]);

  // 4. Fetch Wikipedia details for destinations of selected country
  useEffect(() => {
    let active = true;

    const fetchWikipediaData = async () => {
      for (const dest of countryDestinations) {
        if (!active) return;
        if (wikiCache[dest.name]) {
          setWikiData((prev) => ({
            ...prev,
            [dest.id]: { ...wikiCache[dest.name], loading: false },
          }));
          continue;
        }

        // Initialize loading state
        setWikiData((prev) => ({
          ...prev,
          [dest.id]: { extract: "", loading: true },
        }));

        try {
          // Attempt Wikipedia API query
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(dest.name)}`
          );
          if (res.ok) {
            const data = await res.json();
            const details = {
              extract: data.extract || "No description available.",
              thumbnailUrl: data.thumbnail?.source || data.originalimage?.source,
              wikiUrl: data.content_urls?.desktop?.page,
            };
            wikiCache[dest.name] = details;
            if (active) {
              setWikiData((prev) => ({
                ...prev,
                [dest.id]: { ...details, loading: false },
              }));
            }
          } else {
            // Fallback for failed requests
            const fallback = { extract: `Explore the amazing ${dest.name}, a popular ${dest.type} attraction located in ${dest.country}.` };
            wikiCache[dest.name] = fallback;
            if (active) {
              setWikiData((prev) => ({
                ...prev,
                [dest.id]: { ...fallback, loading: false },
              }));
            }
          }
        } catch {
          const fallback = { extract: `Explore the amazing ${dest.name}, a popular ${dest.type} attraction located in ${dest.country}.` };
          wikiCache[dest.name] = fallback;
          if (active) {
            setWikiData((prev) => ({
              ...prev,
              [dest.id]: { ...fallback, loading: false },
            }));
          }
        }
      }
    };

    fetchWikipediaData();

    return () => {
      active = false;
    };
  }, [countryDestinations]);

  return (
    <div className="space-y-6">
      {/* 1. Country Selection Panel (Hidden on detail pages if desired, but shown for main Destinations page) */}
      {!countryName && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 glass-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary font-sora">Select a Country</h2>
              <p className="text-xs text-text-muted mt-0.5">Explore the highest-rated landmarks, natural wonders, and sights.</p>
            </div>
            
            <div className="relative w-full sm:w-72 z-20">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted" />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl bg-white/[0.03] pl-10 pr-10 text-sm font-medium shadow-sm ring-1 ring-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-glow/50 text-text-primary cursor-pointer font-sora"
                >
                  {availableCountries.map((c) => (
                    <option key={c} value={c} className="bg-atlas-900 text-text-primary">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Interactive Grid */}
      <div className="grid lg:grid-cols-5 gap-6 items-stretch">
        
        {/* Left Column: Grid/List of Popular Destinations */}
        <div className="lg:col-span-3 space-y-4 max-h-[750px] overflow-y-auto pr-1">
          {countryDestinations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <HelpCircle className="h-10 w-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary font-medium font-sora">No curated destinations found for {selectedCountry}.</p>
              <p className="text-xs text-muted mt-1 font-sora">We are expanding our landmark list regularly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {countryDestinations.map((dest) => {
                const wiki = wikiData[dest.id] || { extract: "", loading: true };
                const isActive = activeDestination?.id === dest.id;

                return (
                  <div
                    key={dest.id}
                    onClick={() => setActiveDestination(dest)}
                    className={`group rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                      isActive
                        ? "bg-cyan-glow/[0.06] border-cyan-glow/30 ring-1 ring-cyan-glow/20 shadow-cyan-glow/5"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image Preview (Wikipedia query image or placeholder) */}
                      <div className="relative w-full sm:w-44 h-32 shrink-0 bg-atlas-900 border-r border-white/5 overflow-hidden">
                        {wiki.thumbnailUrl ? (
                          <Image
                            src={wiki.thumbnailUrl}
                            alt={dest.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 176px"
                            unoptimized // prevents issues with external wiki images
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted/40 gap-1 bg-atlas-950">
                            <Landmark className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-cyan-glow uppercase tracking-wider">
                          {dest.type}
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base font-bold text-text-primary group-hover:text-cyan-glow transition-colors font-sora truncate">
                              {dest.name}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDestination(dest);
                              }}
                              className="text-[10px] text-cyan-glow hover:underline flex items-center gap-0.5 shrink-0"
                            >
                              <MapPin className="h-3 w-3" /> View Map
                            </button>
                          </div>
                          
                          {wiki.loading ? (
                            <div className="space-y-1.5 mt-2 animate-pulse">
                              <div className="h-3 bg-white/5 rounded w-full"></div>
                              <div className="h-3 bg-white/5 rounded w-5/6"></div>
                            </div>
                          ) : (
                            <p className="text-xs text-text-secondary line-clamp-3 mt-1.5 leading-relaxed font-sora">
                              {wiki.extract}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[10px] text-muted font-sora">
                          <span>
                            Coords: {dest.lat.toFixed(3)}°, {dest.lng.toFixed(3)}°
                          </span>
                          {wiki.wikiUrl && (
                            <a
                              href={wiki.wikiUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-amber-glow hover:underline"
                            >
                              Read on Wiki <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Interactive Leaflet Map */}
        <div className="lg:col-span-2 relative h-[450px] lg:h-auto min-h-[400px]">
          <div className="sticky top-6 h-full flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden glass-card">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 font-sora">
                <Map className="h-4 w-4 text-cyan-glow" />
                Destinations Map
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Pins show the geographical distribution of sights in {selectedCountry}.</p>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <DestinationsMap
                destinations={countryDestinations}
                activeDestination={activeDestination}
                onMarkerClick={(dest) => setActiveDestination(dest)}
              />
            </div>

            {activeDestination && (
              <div className="p-4 bg-black/40 border-t border-white/5 font-sora">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-primary">{activeDestination.name}</span>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/5 text-muted">
                    {activeDestination.type}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
