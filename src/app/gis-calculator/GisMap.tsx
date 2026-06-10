"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { MAP_STYLES } from "@/constants/ui";
import { MapStyleSelector } from "@/components/MapStyleSelector";

interface GisMapProps {
  latA: number;
  lngA: number;
  nameA: string;
  capitalA: string;
  flagA: string;
  latB: number;
  lngB: number;
  nameB: string;
  capitalB: string;
  flagB: string;
}

function createColoredIcon(flagUrl: string, color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      position: relative;
      width: 30px;
      height: 22px;
      background: #0c1020;
      border-radius: 4px;
      border: 2px.5px solid ${color};
      box-shadow: 0 3px 8px rgba(0,0,0,0.6);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <img src="${flagUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>`,
    iconSize: [30, 22],
    iconAnchor: [15, 11],
  });
}

function FitGisBounds({ latA, lngA, latB, lngB }: { latA: number; lngA: number; latB: number; lngB: number }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([[latA, lngA], [latB, lngB]]);
    map.fitBounds(bounds, { padding: [80, 80] });
  }, [latA, lngA, latB, lngB, map]);
  return null;
}

export default function GisMap({
  latA,
  lngA,
  nameA,
  capitalA,
  flagA,
  latB,
  lngB,
  nameB,
  capitalB,
  flagB,
}: GisMapProps) {
  const mapRef = useRef<L.Map>(null);
  const { resolvedTheme } = useTheme();
  const [overrideStyleId, setOverrideStyleId] = useState<string | null>(null);

  const mapStyleId = overrideStyleId || (resolvedTheme === "light" ? "light" : "dark");

  // Center point
  const center: [number, number] = [(latA + latB) / 2, (lngA + lngB) / 2];
  const currentStyle = MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];

  return (
    <div className="relative w-full h-[500px]">
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
      <FitGisBounds latA={latA} lngA={lngA} latB={latB} lngB={lngB} />
      
      {/* Starting Country A marker */}
      <Marker position={[latA, lngA]} icon={createColoredIcon(flagA, "#00D4FF")}>
        <Popup>
          <div className="flex items-center gap-2 text-text-primary font-sora">
            <div className="relative h-6 w-8 flex-shrink-0 rounded-sm overflow-hidden border border-white/10 shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagA} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-xs leading-none m-0 p-0">{capitalA}</p>
              <p className="text-[10px] text-text-muted mt-0.5 leading-none m-0 p-0">Capital of {nameA}</p>
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Geodesic Polyline connection */}
      <Polyline
        positions={[[latA, lngA], [latB, lngB]]}
        color="#00D4FF"
        weight={3}
        dashArray="5, 10"
      />

      {/* Destination Country B marker */}
      <Marker position={[latB, lngB]} icon={createColoredIcon(flagB, "#FFB347")}>
        <Popup>
          <div className="flex items-center gap-2 text-text-primary font-sora">
            <div className="relative h-6 w-8 flex-shrink-0 rounded-sm overflow-hidden border border-white/10 shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagB} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-xs leading-none m-0 p-0">{capitalB}</p>
              <p className="text-[10px] text-text-muted mt-0.5 leading-none m-0 p-0">Capital of {nameB}</p>
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
    </div>
  );
}
