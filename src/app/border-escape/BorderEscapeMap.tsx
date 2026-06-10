"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { MAP_STYLES } from "@/constants/ui";
import { MapStyleSelector } from "@/components/MapStyleSelector";

interface Country {
  cca3: string;
  name: { common: string; official: string };
  flags: { svg: string };
  borders?: string[];
  region: string;
  latlng?: [number, number];
}

interface BorderEscapeMapProps {
  startCountry: Country;
  targetCountry: Country;
  userPathCountries: Country[];
  optimalPathCountries: Country[];
}

function createColoredIcon(flagUrl: string, color: string, label: string): L.DivIcon {
  const size = 30;
  return L.divIcon({
    className: "",
    html: `<div style="
      position: relative;
      width: ${size}px;
      height: ${Math.round(size * 0.7)}px;
      background: #0c1020;
      border-radius: 4px;
      border: 2px solid ${color};
      box-shadow: 0 0 10px ${color}80, 0 2px 6px rgba(0,0,0,0.6);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <img src="${flagUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
      <div style="
        position: absolute;
        bottom: -1px;
        right: -1px;
        background: ${color};
        color: #0c1020;
        font-size: 8px;
        font-weight: 900;
        padding: 0 2px;
        border-top-left-radius: 3px;
      ">${label}</div>
    </div>`,
    iconSize: [size, Math.round(size * 0.7)],
    iconAnchor: [size / 2, Math.round(size * 0.7) / 2],
  });
}

function MapController({ coords }: { coords: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coords.length === 0) return;
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [coords, map]);

  return null;
}

export default function BorderEscapeMap({
  startCountry,
  targetCountry,
  userPathCountries,
  optimalPathCountries,
}: BorderEscapeMapProps) {
  const mapRef = useRef<L.Map>(null);
  const { resolvedTheme } = useTheme();
  const [overrideStyleId, setOverrideStyleId] = useState<string | null>(null);

  const mapStyleId = overrideStyleId || (resolvedTheme === "light" ? "light" : "dark");
  const currentStyle = MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];

  const center: [number, number] = startCountry.latlng || [20, 0];

  // Coordinates lists
  const userPositions = userPathCountries
    .filter((c) => c.latlng)
    .map((c) => c.latlng as [number, number]);

  const optimalPositions = optimalPathCountries
    .filter((c) => c.latlng)
    .map((c) => c.latlng as [number, number]);

  // Combine all coordinates to fit bounds
  const allCoords = [...userPositions, ...optimalPositions];

  return (
    <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <MapStyleSelector currentStyleId={mapStyleId} onStyleChange={setOverrideStyleId} />
      <MapContainer
        center={center}
        zoom={3}
        className="h-full w-full"
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution={currentStyle.attribution}
          url={currentStyle.url}
          key={currentStyle.id}
        />
        <MapController coords={allCoords} />

        {/* User's Route Polyline (Dashed Orange/Cyan depending on result) */}
        {userPositions.length > 1 && (
          <Polyline
            positions={userPositions}
            color="#FFB347"
            weight={3.5}
            dashArray="6, 8"
            opacity={0.8}
          />
        )}

        {/* Shortest / Optimal Route Polyline (Solid Glowing Emerald) */}
        {optimalPositions.length > 1 && (
          <Polyline
            positions={optimalPositions}
            color="#10b981"
            weight={4}
            opacity={0.9}
          />
        )}

        {/* Markers along the Optimal path */}
        {optimalPathCountries.map((c, idx) => {
          if (!c.latlng) return null;
          const isStart = c.cca3 === startCountry.cca3;
          const isTarget = c.cca3 === targetCountry.cca3;
          
          let color = "#10b981"; // Emerald for shortest route
          let label = `${idx + 1}`;
          if (isStart) {
            color = "#00D4FF";
            label = "S";
          } else if (isTarget) {
            color = "#f59e0b";
            label = "T";
          }

          return (
            <Marker 
              key={`opt-${c.cca3}`} 
              position={c.latlng} 
              icon={createColoredIcon(c.flags.svg, color, label)}
            >
              <Popup>
                <div className="font-sora text-xs">
                  <span className="font-bold text-emerald-400">Shortest Route step #{idx + 1}</span>
                  <p className="font-bold mt-0.5">{c.name.common}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Markers along the User's path (if they took a different route) */}
        {userPathCountries.map((c, idx) => {
          if (!c.latlng) return null;
          if (optimalPathCountries.some((opt) => opt.cca3 === c.cca3)) return null; // Avoid duplicate markers
          
          return (
            <Marker 
              key={`user-${c.cca3}`} 
              position={c.latlng} 
              icon={createColoredIcon(c.flags.svg, "#f43f5e", `U${idx + 1}`)}
            >
              <Popup>
                <div className="font-sora text-xs">
                  <span className="font-bold text-rose-400">Your Route step #{idx + 1}</span>
                  <p className="font-bold mt-0.5">{c.name.common}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Mini Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] p-2.5 rounded-xl border border-white/10 bg-atlas-900/90 backdrop-blur-md shadow-2xl font-sora text-[9px] space-y-1 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 font-medium text-text-secondary">
          <span className="h-1 w-4 bg-emerald-500 rounded" /> 
          <span>Shortest Route (Optimal)</span>
        </div>
        {userPositions.length > 1 && userPositions.length !== optimalPositions.length && (
          <div className="flex items-center gap-1.5 font-medium text-text-secondary">
            <span className="h-1 w-4 border-t-2 border-dashed border-amber-400" /> 
            <span>Your Route</span>
          </div>
        )}
      </div>
    </div>
  );
}
