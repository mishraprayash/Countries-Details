"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Activity, Loader2 } from "lucide-react";

interface SeismicMonitorProps {
  lat: number;
  lng: number;
  countryName: string;
}

interface Earthquake {
  id: string;
  mag: number;
  place: string;
  time: number;
  depth: number;
}

export default function SeismicMonitor({ lat, lng, countryName }: SeismicMonitorProps) {
  const [quakes, setQuakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Fetch significant earthquakes (mag >= 4.0) in the last 30 days within 1500km radius
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startTime = thirtyDaysAgo.toISOString();

    fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lng}&maxradiuskm=1500&minmagnitude=4.0&starttime=${startTime}&limit=5`
    )
      .then((res) => {
        if (!res.ok) throw new Error("USGS API error");
        return res.json();
      })
      .then((data) => {
        const features = data.features || [];
        const formatted: Earthquake[] = features.map((f: {
          id: string;
          properties?: { mag?: number; place?: string; time?: number };
          geometry?: { coordinates?: number[] };
        }) => ({
          id: f.id,
          mag: f.properties?.mag ?? 0,
          place: f.properties?.place ?? "Unknown Location",
          time: f.properties?.time ?? Date.now(),
          depth: f.geometry?.coordinates?.[2] ?? 0, // coordinates are [lon, lat, depth]
        }));
        setQuakes(formatted);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lat, lng]);

  const getMagColor = (mag: number): { text: string; bg: string; border: string } => {
    if (mag < 4.8) return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (mag < 5.8) return { text: "text-amber-glow", bg: "bg-amber-glow/10", border: "border-amber-glow/20" };
    return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <div className="flex items-center gap-2 text-muted font-sora text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-red-400" />
          Analyzing recent seismic data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6 text-muted text-xs font-sora">
        Failed to fetch real-time seismic details from USGS.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
      <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2 font-sora">
        <Activity className="h-5 w-5 text-red-400 animate-pulse" />
        Seismic & Tectonic Monitor
      </h3>

      {quakes.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 font-sora">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <span className="block text-xs font-bold text-text-primary">Stable Tectonic Zone</span>
            <span className="block text-[10px] text-text-muted mt-0.5">
              No earthquakes &gt;4.0 M detected within 1500 km of {countryName} in the last 30 days.
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 font-sora">
          <div className="flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider mb-1">
            <span>Recent Activity (1500km radius)</span>
            <span className="flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-amber-glow animate-pulse" /> Active</span>
          </div>

          <div className="space-y-2.5">
            {quakes.map((q) => {
              const colors = getMagColor(q.mag);
              return (
                <div key={q.id} className="flex gap-3 items-start p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-dm-mono border ${colors.bg} ${colors.text} ${colors.border}`}>
                    M {q.mag.toFixed(1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-text-primary truncate">{q.place}</span>
                    <div className="flex gap-3 text-[10px] text-text-muted mt-1 font-dm-mono">
                      <span>Depth: {q.depth.toFixed(0)} km</span>
                      <span>{new Date(q.time).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <span className="text-[9px] text-text-muted block mt-2 text-right">
            Data sourced live from USGS Earthquake Hazards Program.
          </span>
        </div>
      )}
    </div>
  );
}
