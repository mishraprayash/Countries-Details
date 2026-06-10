"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { MAP_STYLES } from "@/constants/ui";
import { MapStyleSelector } from "@/components/MapStyleSelector";

interface Destination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  country: string;
}

interface DestinationsMapProps {
  destinations: Destination[];
  activeDestination: Destination | null;
  onMarkerClick?: (dest: Destination) => void;
}

// Custom hook / sub-component to handle panning to active marker
function MapController({ activeDestination }: { activeDestination: Destination | null }) {
  const map = useMap();

  useEffect(() => {
    if (activeDestination) {
      map.setView([activeDestination.lat, activeDestination.lng], 12, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [activeDestination, map]);

  return null;
}

function createTypeIcon(type: string): L.DivIcon {
  let emoji = "📍";
  let color = "#00D4FF"; // cyan
  const normalizedType = type.toLowerCase();
  
  if (
    normalizedType.includes("landmark") ||
    normalizedType.includes("temple") ||
    normalizedType.includes("palace") ||
    normalizedType.includes("statue") ||
    normalizedType.includes("theme park") ||
    normalizedType.includes("park")
  ) {
    emoji = "🏰";
    color = "#F59E0B"; // amber
  } else if (normalizedType.includes("city")) {
    emoji = "🏙️";
    color = "#3B82F6"; // blue
  } else if (
    normalizedType.includes("mountain") ||
    normalizedType.includes("volcano") ||
    normalizedType.includes("valley") ||
    normalizedType.includes("canyon")
  ) {
    emoji = "🏔️";
    color = "#10B981"; // emerald
  } else if (
    normalizedType.includes("beach") ||
    normalizedType.includes("sea") ||
    normalizedType.includes("coast") ||
    normalizedType.includes("bay") ||
    normalizedType.includes("reef")
  ) {
    emoji = "🏖️";
    color = "#06B6D4"; // cyan
  } else if (
    normalizedType.includes("lake") ||
    normalizedType.includes("river") ||
    normalizedType.includes("waterfall") ||
    normalizedType.includes("delta") ||
    normalizedType.includes("cave")
  ) {
    emoji = "💧";
    color = "#6366F1"; // indigo
  } else if (normalizedType.includes("island")) {
    emoji = "🏝️";
    color = "#8B5CF6"; // purple
  } else if (normalizedType.includes("desert") || normalizedType.includes("road")) {
    emoji = "🏜️";
    color = "#F97316"; // orange
  }

  return L.divIcon({
    className: "",
    html: `<div style="
      position: relative;
      width: 32px;
      height: 32px;
      background: #090d1a;
      border-radius: 50%;
      border: 2px solid ${color};
      box-shadow: 0 0 10px ${color}80, 0 2px 6px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: transform 0.2s ease-in-out;
    ">
      ${emoji}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function DestinationsMap({
  destinations,
  activeDestination,
  onMarkerClick,
}: DestinationsMapProps) {
  const mapRef = useRef<L.Map>(null);
  const { resolvedTheme } = useTheme();
  const [overrideStyleId, setOverrideStyleId] = useState<string | null>(null);

  const mapStyleId = overrideStyleId || (resolvedTheme === "light" ? "light" : "dark");

  // Determine bounds or center based on destinations list
  const getCenterAndZoom = (): { center: [number, number]; zoom: number } => {
    if (activeDestination) {
      return { center: [activeDestination.lat, activeDestination.lng], zoom: 12 };
    }
    if (destinations.length > 0) {
      // Find average lat/lng
      let sumLat = 0;
      let sumLng = 0;
      destinations.forEach((d) => {
        sumLat += d.lat;
        sumLng += d.lng;
      });
      return {
        center: [sumLat / destinations.length, sumLng / destinations.length],
        zoom: destinations.length > 1 ? 5 : 8,
      };
    }
    return { center: [20, 0], zoom: 2 };
  };

  const { center, zoom } = getCenterAndZoom();
  const currentStyle = MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];

  return (
    <div className="h-[400px] lg:h-full w-full relative">
      <MapStyleSelector currentStyleId={mapStyleId} onStyleChange={setOverrideStyleId} />
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-2xl overflow-hidden border border-white/10"
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution={currentStyle.attribution}
          url={currentStyle.url}
          key={currentStyle.id}
        />
        <MapController activeDestination={activeDestination} />
        {destinations.map((dest) => (
          <Marker
            key={dest.id}
            position={[dest.lat, dest.lng]}
            icon={createTypeIcon(dest.type)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(dest);
              },
            }}
          >
            <Popup>
              <div className="text-text-primary font-sora p-1">
                <span className="font-bold text-xs block mb-0.5">{dest.name}</span>
                <span className="text-[10px] text-muted uppercase tracking-wider block bg-white/5 px-1.5 py-0.5 rounded w-max">
                  {dest.type}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
