"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapBoardProps {
  center: [number, number];
  zoom: number;
  onMapClick: (lat: number, lng: number) => void;
  userMarker: { lat: number; lng: number } | null;
  showResult: boolean;
  actualLocation: { lat: number; lng: number } | null;
  allGuesses?: { locationName: string; lat: number; lng: number; actualLat: number; actualLng: number; points: number; distance: number }[];
  regionKey?: string;
}

// Simplified continent GeoJSON boundaries (as coordinate arrays)
const continentBounds: Record<string, number[][]> = {
  "Europe": [[25, -25], [25, 45], [71, 45], [71, -25], [25, -25]],
  "Asia": [[-10, 25], [-10, 180], [77, 180], [77, 25], [-10, 25]],
  "Africa": [[-35, -20], [-35, 55], [37, 55], [37, -20], [-35, -20]],
  "North America": [[7, -170], [7, -50], [83, -50], [83, -170], [7, -170]],
  "South America": [[-56, -82], [-56, -20], [13, -20], [13, -82], [-56, -82]],
  "Oceania": [[-47, 110], [-47, 180], [0, 180], [0, 110], [-47, 110]],
};

// Component to render region highlight
function RegionHighlight({ regionKey }: { regionKey?: string }) {
  const map = useMap();
  
  useEffect(() => {
    if (!regionKey || !continentBounds[regionKey]) return;
    
    // Create a polygon for the region
    const bounds = continentBounds[regionKey];
    const polygon = L.polygon(
      bounds.map(coord => [coord[0], coord[1]] as [number, number]),
      {
        color: '#22c55e',
        weight: 3,
        fillColor: '#22c55e',
        fillOpacity: 0.1,
        dashArray: '10, 10',
      }
    ).addTo(map);
    
    return () => {
      map.removeLayer(polygon);
    };
  }, [regionKey, map]);
  
  return null;
}

// Create numbered marker icons
function createNumberedIcon(number: number, isUserGuess: boolean = false): L.DivIcon {
  const bgColor = isUserGuess ? '#f59e0b' : '#22c55e';
  const textColor = '#ffffff';
  
  return L.divIcon({
    className: 'numbered-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: ${textColor};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      ">${number}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createActualIcon(): L.DivIcon {
  return L.divIcon({
    className: 'actual-marker',
    html: `
      <div style="
        background: #ef4444;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      ">★</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export default function MapBoard({
  center,
  zoom,
  onMapClick,
  userMarker,
  showResult,
  actualLocation,
  allGuesses,
  regionKey,
}: MapBoardProps) {
  const mapRef = useRef<L.Map>(null);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-white/5">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} zoom={zoom} />
        <MapClickHandler onMapClick={onMapClick} />
        <RegionHighlight regionKey={regionKey} />
        
        {/* User's guess marker during gameplay - numbered */}
        {userMarker && (
          <Marker position={[userMarker.lat, userMarker.lng]} icon={createNumberedIcon(1, true)}>
            <Popup>
              <div className="text-center">
                <p className="font-bold">Your guess</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Actual location marker (shown after guess) */}
        {showResult && actualLocation && (
          <Marker position={[actualLocation.lat, actualLocation.lng]} icon={createActualIcon()}>
            <Popup>
              <div className="text-center">
                <p className="font-bold">Correct location</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* All guesses on results screen - numbered markers */}
        {allGuesses && allGuesses.map((guess, idx) => (
          <div key={idx}>
            {/* User's guess - numbered */}
            {guess.lat !== 0 && guess.lng !== 0 && (
              <Marker position={[guess.lat, guess.lng]} icon={createNumberedIcon(idx + 1, true)}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">#{idx + 1} - {guess.locationName}</p>
                    <p className="text-sm text-muted">Your guess ({guess.points} pts)</p>
                  </div>
                </Popup>
              </Marker>
            )}
            {/* Correct location - star */}
            <Marker position={[guess.actualLat, guess.actualLng]} icon={createActualIcon()}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">#{idx + 1} - {guess.locationName}</p>
                    <p className="text-sm text-muted">{guess.points} pts • {guess.distance.toLocaleString()} km</p>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
</MapContainer>
    </div>
  );
}