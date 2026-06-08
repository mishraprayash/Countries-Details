"use client";

import { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CloudRain, Thermometer, Loader2 } from "lucide-react";

interface ClimographProps {
  lat: number;
  lng: number;
  capitalName: string;
}

interface MonthlyDataPoint {
  month: string;
  temperature: number;
  precipitation: number;
}

export default function Climograph({ lat, lng, capitalName }: ClimographProps) {
  const [data, setData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Fetch daily archive data for 2023 (stable historical year)
    fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2023-01-01&end_date=2023-12-31&daily=temperature_2m_mean,precipitation_sum&timezone=auto`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Network response error");
        return res.json();
      })
      .then((payload) => {
        const daily = payload.daily;
        if (!daily || !daily.time) {
          setError(true);
          return;
        }

        // Initialize 12 months
        const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2023, i, 1).toLocaleString("default", { month: "short" }),
          tempSum: 0,
          tempCount: 0,
          precipSum: 0,
        }));

        // Group daily values into months
        for (let i = 0; i < daily.time.length; i++) {
          const dateStr = daily.time[i];
          const temp = daily.temperature_2m_mean[i];
          const precip = daily.precipitation_sum[i];
          
          if (dateStr) {
            const date = new Date(dateStr);
            const monthIdx = date.getMonth();
            
            if (temp !== null && temp !== undefined) {
              monthlyStats[monthIdx].tempSum += temp;
              monthlyStats[monthIdx].tempCount += 1;
            }
            if (precip !== null && precip !== undefined) {
              monthlyStats[monthIdx].precipSum += precip;
            }
          }
        }

        // Format for Recharts
        const formatted: MonthlyDataPoint[] = monthlyStats.map((m) => ({
          month: m.month,
          temperature: m.tempCount > 0 ? parseFloat((m.tempSum / m.tempCount).toFixed(1)) : 0,
          precipitation: parseFloat(m.precipSum.toFixed(1)),
        }));

        setData(formatted);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <div className="flex items-center gap-2 text-muted font-sora text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-glow" />
          Loading climate climograph…
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-muted text-sm font-sora">
        Climate archive data is currently unavailable for this coordinates.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-base font-bold text-text-primary font-sora flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-cyan-glow" />
            Climograph: {capitalName}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Geographic monthly temperature norms & precipitation sums (Historical 2023 data).
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-sora">
          <span className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5 text-violet-glow" /> Temp (°C)</span>
          <span className="flex items-center gap-1.5"><CloudRain className="h-3.5 w-3.5 text-cyan-glow" /> Rainfall (mm)</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: -5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: "#5A6A8A", fontSize: 11 }} tickLine={false} axisLine={false} />
            
            {/* Left YAxis for Temperature */}
            <YAxis 
              yAxisId="left"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "#5A6A8A", fontSize: 11 }}
              unit="°C"
            />
            
            {/* Right YAxis for Precipitation */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "#5A6A8A", fontSize: 11 }}
              unit="mm"
            />
            
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(12, 16, 32, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F0F4FF" }}
              formatter={(value, name) => {
                if (name === "Temperature") return [`${value}°C`, "Mean Temperature"];
                if (name === "Precipitation") return [`${value} mm`, "Total Rainfall"];
                return [value, name];
              }}
            />
            
            {/* Precipitation Bar */}
            <Bar 
              yAxisId="right"
              dataKey="precipitation" 
              name="Precipitation"
              fill="#06b6d4" 
              fillOpacity={0.15}
              stroke="#06b6d4"
              strokeWidth={1.5}
              radius={[4, 4, 0, 0]}
              barSize={24}
            />

            {/* Temperature Line */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="temperature" 
              name="Temperature"
              stroke="#A78BFA" 
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
