"use client";

import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { MAP_STYLES } from "@/constants/ui";
import { MapStyleSelector } from "@/components/MapStyleSelector";

interface CountryLocationMapProps {
  lat: number;
  lng: number;
  name: string;
  flag: string;
  area: number;
}

function createColoredIcon(flagUrl: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      position: relative;
      width: 32px;
      height: 24px;
      background: #0c1020;
      border-radius: 4px;
      border: 2px.5px solid #00D4FF;
      box-shadow: 0 3px 8px rgba(0,0,0,0.6);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <img src="${flagUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>`,
    iconSize: [32, 24],
    iconAnchor: [16, 12],
  });
}

export default function CountryLocationMap({
  lat,
  lng,
  name,
  flag,
  area,
}: CountryLocationMapProps) {
  const mapRef = useRef<L.Map>(null);
  const { resolvedTheme } = useTheme();
  const [overrideStyleId, setOverrideStyleId] = useState<string | null>(null);

  const mapStyleId = overrideStyleId || (resolvedTheme === "light" ? "light" : "dark");

  // Dynamically estimate zoom level based on land area
  const zoom = area > 9000000 ? 3 : area > 1000000 ? 4 : area > 100000 ? 5 : area > 10000 ? 6 : 7;

  const currentStyle = MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];

  return (
    <div className="h-[380px] w-full relative">
      <MapStyleSelector currentStyleId={mapStyleId} onStyleChange={setOverrideStyleId} />
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution={currentStyle.attribution}
          url={currentStyle.url}
          key={currentStyle.id}
        />
        <Marker position={[lat, lng]} icon={createColoredIcon(flag)}>
          <Popup>
            <div className="flex items-center gap-2 text-text-primary font-sora">
              <div className="relative h-6 w-8 flex-shrink-0 rounded-sm overflow-hidden border border-white/10 shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flag} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xs">{name}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
