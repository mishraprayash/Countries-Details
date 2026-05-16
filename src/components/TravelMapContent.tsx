"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CountryStatus } from "@/types/user";

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
  "visited": "#34d399",
  "want-to-visit": "#f59e0b",
  "lived-in": "#a78bfa",
};

function createColoredIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 18px;
      height: 18px;
      background: ${color};
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
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

  const center: [number, number] = coords.length > 0
    ? [coords.reduce((s, c) => s + c.lat, 0) / coords.length, coords.reduce((s, c) => s + c.lng, 0) / coords.length]
    : [20, 0];

  return (
    <MapContainer
      center={center}
      zoom={2}
      className="h-[500px] w-full"
      scrollWheelZoom={true}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"
      />
      <FitBounds coords={coords} />
      {coords.map((c) => (
        <Marker
          key={c.cca3}
          position={[c.lat, c.lng]}
          icon={createColoredIcon(STATUS_COLORS[statusForCoord(c.cca3)])}
        >
          <Popup>
            <div className="flex items-center gap-2 min-w-[160px]">
              <div className="relative h-6 w-8 flex-shrink-0 rounded-sm overflow-hidden shadow">
                <Image src={c.flag} alt={c.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm text-text-primary">{c.name}</p>
                <p className="text-[11px] text-text-muted">
                  {statusForCoord(c.cca3) === "visited" && "Visited"}
                  {statusForCoord(c.cca3) === "want-to-visit" && "Want to Visit"}
                  {statusForCoord(c.cca3) === "lived-in" && "Lived In"}
                  {" · "}{c.region}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
