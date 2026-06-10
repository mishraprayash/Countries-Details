"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CountryStatus } from "@/types/user";
import { useTravelMap } from "@/hooks/useTravelMap";
import { useTheme } from "next-themes";
import { MAP_STYLES } from "@/constants/ui";
import { MapStyleSelector } from "@/components/MapStyleSelector";

interface Coord {
  cca3: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  region: string;
}

interface TravelMapContentProps {
  coords: Coord[];
  statusForCoord: (cca3: string) => CountryStatus;
}

const STATUS_COLORS: Record<CountryStatus, string> = {
  "visited": "#10b981", // Emerald 500
  "want-to-visit": "#d97706", // Amber 600
  "lived-in": "#7c3aed", // Violet 600
};

function createColoredIcon(flagUrl: string, color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      position: relative;
      width: 28px;
      height: 20px;
      background: #0c1020;
      border-radius: 4px;
      border: 2px solid ${color};
      box-shadow: 0 3px 8px rgba(0,0,0,0.6);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <img src="${flagUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>`,
    iconSize: [28, 20],
    iconAnchor: [14, 10],
  });
}

function FitBounds({ coords }: { coords: Coord[] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView([coords[0].lat, coords[0].lng], 5);
      return;
    }
    const bounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [coords, map]);
  return null;
}

export default function TravelMapContent({ coords, statusForCoord }: TravelMapContentProps) {
  const mapRef = useRef<L.Map>(null);
  const { setStatus, removeCountry } = useTravelMap();
  const { resolvedTheme } = useTheme();
  const [overrideStyleId, setOverrideStyleId] = useState<string | null>(null);

  const mapStyleId = overrideStyleId || (resolvedTheme === "light" ? "light" : "dark");

  const center: [number, number] = coords.length > 0
    ? [coords.reduce((s, c) => s + c.lat, 0) / coords.length, coords.reduce((s, c) => s + c.lng, 0) / coords.length]
    : [20, 0];

  const currentStyle = MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];

  return (
    <div className="relative w-full h-[500px]">
      <MapStyleSelector currentStyleId={mapStyleId} onStyleChange={setOverrideStyleId} />
      <MapContainer
        center={center}
        zoom={2}
        className="h-full w-full"
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution={currentStyle.attribution}
          url={currentStyle.url}
          key={currentStyle.id}
        />
        <FitBounds coords={coords} />
        {coords.map((c) => {
          const currentStatus = statusForCoord(c.cca3);
          return (
            <Marker
              key={c.cca3}
              position={[c.lat, c.lng]}
              icon={createColoredIcon(c.flag, STATUS_COLORS[currentStatus])}
            >
              <Popup>
                <div className="flex flex-col gap-2 min-w-[200px] text-text-primary">
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-8 flex-shrink-0 rounded-sm overflow-hidden shadow">
                      <Image src={c.flag} alt={c.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate text-text-primary m-0 p-0 leading-tight">{c.name}</p>
                      <p className="text-[10px] text-text-muted m-0 p-0 leading-tight mt-0.5">{c.region}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 my-1" />

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Travel Status</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setStatus(c.cca3, "visited")}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                          currentStatus === "visited"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/[0.03] text-text-muted hover:text-text-primary border border-transparent"
                        }`}
                      >
                        Visited
                      </button>
                      <button
                        onClick={() => setStatus(c.cca3, "want-to-visit")}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                          currentStatus === "want-to-visit"
                            ? "bg-amber-glow/20 text-amber-glow border border-amber-glow/30"
                            : "bg-white/[0.03] text-text-muted hover:text-text-primary border border-transparent"
                        }`}
                      >
                        Want
                      </button>
                      <button
                        onClick={() => setStatus(c.cca3, "lived-in")}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all text-center cursor-pointer ${
                          currentStatus === "lived-in"
                            ? "bg-violet-glow/20 text-violet-glow border border-violet-glow/30"
                            : "bg-white/[0.03] text-text-muted hover:text-text-primary border border-transparent"
                        }`}
                      >
                        Lived
                      </button>
                    </div>
                    <button
                      onClick={() => removeCountry(c.cca3)}
                      className="text-left text-[9px] text-red-400 hover:text-red-300 hover:underline mt-1 font-semibold cursor-pointer"
                    >
                      Remove from Map
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating map legend overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-2xl border border-white/10 bg-atlas-900/90 backdrop-blur-md shadow-2xl font-sora text-[10px] space-y-1.5 pointer-events-auto select-none print:hidden">
        <span className="font-bold text-text-primary uppercase tracking-wider block mb-1">Travel Legend</span>
        <div className="flex items-center gap-2 font-medium text-text-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-emerald-400/30" /> 
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2 font-medium text-text-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-600 border border-amber-500/30" /> 
          <span>Want to Visit</span>
        </div>
        <div className="flex items-center gap-2 font-medium text-text-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-600 border border-violet-500/30" /> 
          <span>Lived In</span>
        </div>
      </div>
    </div>
  );
}
