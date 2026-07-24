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
  revealed?: boolean;
}

function createColoredIcon(flagUrl: string, color: string, label: string): L.DivIcon {
  // Dynamically increase icon size for longer labels (e.g. U1,3,5)
  const width = label.length > 3 ? 44 : 30;
  const height = 21;
  return L.divIcon({
    className: "",
    html: `<div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
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
        padding: 0 3px;
        border-top-left-radius: 3px;
        white-space: nowrap;
      ">${label}</div>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  });
}

function MapController({ coords }: { coords: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coords.length === 0) return;
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [coords, map]);

  return null;
}

interface SingleMapProps {
  center: [number, number];
  coords: [number, number][];
  currentStyle: typeof MAP_STYLES[0];
  mapStyleId: string;
  onStyleChange: (id: string) => void;
  positions: [number, number][];
  color: string;
  isDashed?: boolean;
  countries: Country[];
  startCountry: Country;
  targetCountry: Country;
  isOptimal: boolean;
}

function SingleMap({
  center,
  coords,
  currentStyle,
  mapStyleId,
  onStyleChange,
  positions,
  color,
  isDashed = false,
  countries,
  startCountry,
  targetCountry,
  isOptimal,
}: SingleMapProps) {
  const mapRef = useRef<L.Map>(null);

  // Group duplicate visits to the same country to prevent overlapping/invisible markers
  const uniqueCca3s = Array.from(new Set(countries.map((c) => c.cca3)));
  const uniqueCountries = uniqueCca3s
    .map((code) => countries.find((c) => c.cca3 === code))
    .filter((c): c is Country => !!c && !!c.latlng);

  return (
    <div className="relative w-full h-[260px] sm:h-[340px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
      <MapStyleSelector currentStyleId={mapStyleId} onStyleChange={onStyleChange} />
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
        <MapController coords={coords} />

        {positions.length > 1 && (
          <Polyline
            positions={positions}
            color={color}
            weight={4}
            dashArray={isDashed ? "6, 8" : undefined}
            opacity={0.9}
          />
        )}

        {uniqueCountries.map((c) => {
          const isStart = c.cca3 === startCountry.cca3;
          const isTarget = c.cca3 === targetCountry.cca3;
          
          // Find all step indices where the user/shortest path visited this country
          const indices = countries
            .map((x, i) => (x.cca3 === c.cca3 ? i : -1))
            .filter((i) => i !== -1);
          
          let markerColor = color;
          let label = "";
          
          if (isStart) {
            markerColor = "#00D4FF";
            label = "S";
          } else if (isTarget) {
            markerColor = "#f59e0b";
            label = "T";
          } else {
            const prefix = isOptimal ? "" : "U";
            if (indices.length <= 3) {
              label = prefix + indices.join(",");
            } else {
              label = prefix + indices.slice(0, 2).join(",") + "+";
            }
          }

          return (
            <Marker 
              key={`${isOptimal ? "opt" : "user"}-${c.cca3}`} 
              position={c.latlng as [number, number]} 
              icon={createColoredIcon(c.flags.svg, markerColor, label)}
            >
              <Popup>
                <div className="font-sora text-xs">
                  <span className="font-bold" style={{ color: markerColor }}>
                    {isStart 
                      ? "Start Location" 
                      : isTarget 
                        ? "Target Destination" 
                        : isOptimal 
                          ? `Shortest Route step(s) #${indices.join(", #")}` 
                          : `Your Route step(s) #${indices.join(", #")}`}
                  </span>
                  <p className="font-bold mt-0.5">{c.name.common}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default function BorderEscapeMap({
  startCountry,
  targetCountry,
  userPathCountries,
  optimalPathCountries,
}: BorderEscapeMapProps) {
  const { resolvedTheme } = useTheme();
  const [overrideStyleId, setOverrideStyleId] = useState<string | null>(null);

  const mapStyleId = overrideStyleId || (resolvedTheme === "light" ? "light" : "dark");
  const currentStyle = MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];

  const center: [number, number] = startCountry.latlng || [20, 0];

  const userPositions = userPathCountries
    .filter((c) => c.latlng)
    .map((c) => c.latlng as [number, number]);

  const optimalPositions = optimalPathCountries
    .filter((c) => c.latlng)
    .map((c) => c.latlng as [number, number]);

  const showBoth = userPositions.length > 1;

  if (showBoth) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-sora">
              Your Route Map
            </span>
          </div>
          <SingleMap
            center={center}
            coords={userPositions}
            currentStyle={currentStyle}
            mapStyleId={mapStyleId}
            onStyleChange={setOverrideStyleId}
            positions={userPositions}
            color="#FFB347"
            isDashed={true}
            countries={userPathCountries}
            startCountry={startCountry}
            targetCountry={targetCountry}
            isOptimal={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-sora">
              Optimal Route Map
            </span>
          </div>
          <SingleMap
            center={center}
            coords={optimalPositions}
            currentStyle={currentStyle}
            mapStyleId={mapStyleId}
            onStyleChange={setOverrideStyleId}
            positions={optimalPositions}
            color="#10b981"
            isDashed={false}
            countries={optimalPathCountries}
            startCountry={startCountry}
            targetCountry={targetCountry}
            isOptimal={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-sora">
          Optimal Route Map
        </span>
      </div>
      <SingleMap
        center={center}
        coords={optimalPositions}
        currentStyle={currentStyle}
        mapStyleId={mapStyleId}
        onStyleChange={setOverrideStyleId}
        positions={optimalPositions}
        color="#10b981"
        isDashed={false}
        countries={optimalPathCountries}
        startCountry={startCountry}
        targetCountry={targetCountry}
        isOptimal={true}
      />
    </div>
  );
}
