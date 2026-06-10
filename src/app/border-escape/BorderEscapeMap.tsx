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
  currentCountry: Country;
  neighbors: Country[];
  pathCountries: Country[];
  onSelectBorder: (code: string) => void;
}

function createColoredIcon(flagUrl: string, color: string, isCurrent: boolean = false): L.DivIcon {
  const size = isCurrent ? 36 : 28;
  const borderStyle = isCurrent 
    ? `3px solid ${color}; box-shadow: 0 0 12px ${color}; transform: scale(1.1); z-index: 1000;` 
    : `2px solid ${color}; box-shadow: 0 3px 8px rgba(0,0,0,0.6);`;

  return L.divIcon({
    className: "",
    html: `<div style="
      position: relative;
      width: ${size}px;
      height: ${Math.round(size * 0.7)}px;
      background: #0c1020;
      border-radius: 4px;
      border: ${borderStyle}
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <img src="${flagUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>`,
    iconSize: [size, Math.round(size * 0.7)],
    iconAnchor: [size / 2, Math.round(size * 0.7) / 2],
  });
}

function MapController({ start, target, current }: { start: Country; target: Country; current: Country }) {
  const map = useMap();

  useEffect(() => {
    if (!start.latlng || !target.latlng) return;
    
    // Fit bounds of start, target, and current
    const coords: [number, number][] = [start.latlng, target.latlng];
    if (current.latlng) {
      coords.push(current.latlng);
    }
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
  }, [start, target, current, map]);

  return null;
}

export default function BorderEscapeMap({
  startCountry,
  targetCountry,
  currentCountry,
  neighbors,
  pathCountries,
  onSelectBorder,
}: BorderEscapeMapProps) {
  const mapRef = useRef<L.Map>(null);
  const { resolvedTheme } = useTheme();
  const [overrideStyleId, setOverrideStyleId] = useState<string | null>(null);

  const mapStyleId = overrideStyleId || (resolvedTheme === "light" ? "light" : "dark");
  const currentStyle = MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];

  const center: [number, number] = currentCountry.latlng || [20, 0];

  // Map path coordinates for drawing the user's route
  const polylinePositions = pathCountries
    .filter((c) => c.latlng)
    .map((c) => c.latlng as [number, number]);

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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
        <MapController start={startCountry} target={targetCountry} current={currentCountry} />

        {/* User's Route Polyline */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            color="#0ea5e9"
            weight={3}
            dashArray="6, 8"
          />
        )}

        {/* Start Country Marker */}
        {startCountry.latlng && (
          <Marker 
            position={startCountry.latlng} 
            icon={createColoredIcon(startCountry.flags.svg, "#10b981")}
          >
            <Popup>
              <div className="font-sora text-xs">
                <span className="font-bold text-emerald-400">Start Location</span>
                <p className="font-bold mt-0.5">{startCountry.name.common}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Target Country Marker */}
        {targetCountry.latlng && (
          <Marker 
            position={targetCountry.latlng} 
            icon={createColoredIcon(targetCountry.flags.svg, "#f59e0b")}
          >
            <Popup>
              <div className="font-sora text-xs">
                <span className="font-bold text-amber-500">Target Destination</span>
                <p className="font-bold mt-0.5">{targetCountry.name.common}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current Country Marker */}
        {currentCountry.latlng && currentCountry.cca3 !== startCountry.cca3 && currentCountry.cca3 !== targetCountry.cca3 && (
          <Marker 
            position={currentCountry.latlng} 
            icon={createColoredIcon(currentCountry.flags.svg, "#00D4FF", true)}
          >
            <Popup>
              <div className="font-sora text-xs">
                <span className="font-bold text-cyan-glow">Current Location</span>
                <p className="font-bold mt-0.5">{currentCountry.name.common}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Neighboring Country Markers (Clickable border crossings) */}
        {neighbors.map((neighbor) => {
          if (!neighbor.latlng) return null;
          const isTarget = neighbor.cca3 === targetCountry.cca3;
          const color = isTarget ? "#f59e0b" : "#64748b";

          return (
            <Marker
              key={neighbor.cca3}
              position={neighbor.latlng}
              icon={createColoredIcon(neighbor.flags.svg, color)}
              eventHandlers={{
                click: () => onSelectBorder(neighbor.cca3),
              }}
            >
              <Popup>
                <div className="font-sora text-xs p-1 text-center">
                  <p className="font-bold">{neighbor.name.common}</p>
                  <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">Click flag to cross border</p>
                  {isTarget && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider text-[8px] animate-pulse">
                      Target!
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
