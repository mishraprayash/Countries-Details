"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { 
  MapPin, ExternalLink, Map, Landmark, HelpCircle
} from "lucide-react";

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
  extract?: string;
  thumbnailUrl?: string;
  wikiUrl?: string;
}

interface PopularDestinationsProps {
  countryName?: string;
  lat?: number;
  lng?: number;
}

export default function PopularDestinations({ countryName, lat, lng }: PopularDestinationsProps) {
  const [destinations, setDestinations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDestination, setActiveDestination] = useState<LocationItem | null>(null);

  // Fetch destinations from API when coordinates are available
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;

    setLoading(true);
    fetch(`/api/destinations?lat=${lat}&lng=${lng}&country=${encodeURIComponent(countryName || "Unknown")}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.destinations) {
          setDestinations(data.destinations);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lng, countryName]);

  // Set first destination as active when data loads
  useEffect(() => {
    if (destinations.length > 0) {
      setActiveDestination(destinations[0]);
    }
  }, [destinations]);

  const displayName = countryName || loading ? "Loading..." : "Unknown";

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-5 gap-6 items-stretch">
        <div className="lg:col-span-3 space-y-4 max-h-[750px] overflow-y-auto pr-1">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-glow mx-auto mb-3"></div>
              <p className="text-sm text-text-secondary font-medium font-sora">Loading destinations near {displayName}...</p>
            </div>
          ) : destinations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Landmark className="h-10 w-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary font-medium font-sora">No popular destinations found for this country.</p>
              <p className="text-xs text-muted mt-1 font-sora">Try exploring other countries on our Destinations page.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {destinations.map((dest) => {
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
                      <div className="relative w-full sm:w-44 h-32 shrink-0 bg-atlas-900 border-r border-white/5 overflow-hidden">
                        {dest.thumbnailUrl ? (
                          <Image
                            src={dest.thumbnailUrl}
                            alt={dest.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 176px"
                            unoptimized
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

                      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base font-bold text-text-primary group-hover:text-cyan-glow transition-colors font-sora truncate">
                              {dest.name}
                            </h3>
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveDestination(dest); }}
                              className="text-[10px] text-cyan-glow hover:underline flex items-center gap-0.5 shrink-0"
                            >
                              <MapPin className="h-3 w-3" /> View Map
                            </button>
                          </div>
                          <p className="text-xs text-text-secondary line-clamp-3 mt-1.5 leading-relaxed font-sora">
                            {dest.extract || `Explore ${dest.name}, located in ${dest.country}.`}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[10px] text-muted font-sora">
                          <span>
                            Coords: {dest.lat.toFixed(3)}°, {dest.lng.toFixed(3)}°
                          </span>
                          {dest.wikiUrl && (
                            <a
                              href={dest.wikiUrl}
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

        <div className="lg:col-span-2 relative h-[450px] lg:h-auto min-h-[400px]">
          <div className="sticky top-6 h-full flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden glass-card">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 font-sora">
                <Map className="h-4 w-4 text-cyan-glow" />
                Destinations Map
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">Pins show the geographical distribution of sights in {displayName}.</p>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <DestinationsMap
                destinations={destinations}
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
