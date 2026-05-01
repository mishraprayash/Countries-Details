"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CountryComparisonProps {
  countryName: string;
  countryPopulation: number;
  regionName: string;
  regionAverage: number;
}

export default function CountryComparison({
  countryName,
  countryPopulation,
  regionName,
  regionAverage,
}: CountryComparisonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const data = [
    { name: countryName, population: countryPopulation, isTarget: true },
    { name: `${regionName} Avg`, population: regionAverage, isTarget: false },
  ];

  if (!mounted) {
    return (
      <div className="mt-12 rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-4 sm:p-8 shadow-sm h-[380px] animate-pulse">
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-4 sm:p-8 shadow-sm">
      <h3 className="mb-6 text-lg font-bold text-text-primary font-sora">
        Population Comparison (vs Regional Average)
      </h3>
      <div className="h-[250px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" tick={{ fill: "#5A6A8A" }} />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ 
                backgroundColor: "rgba(6, 8, 16, 0.9)", 
                border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "8px",
                color: "#F0F4FF" 
              }}
              formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)}M`, "Population"]}
            />
            <Bar dataKey="population" radius={[8, 8, 0, 0]} barSize={60}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isTarget ? "#00D4FF" : "rgba(255,255,255,0.1)"} 
                  fillOpacity={entry.isTarget ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
<p className="mt-4 text-center text-sm text-muted font-sora">
        {countryPopulation > regionAverage 
          ? `${countryName} has a population ${(countryPopulation / regionAverage).toFixed(1)}x larger than the average for ${regionName}.`
          : `${countryName} population is ${((countryPopulation / regionAverage) * 100).toFixed(1)}% of the average for ${regionName}.`
        }
      </p>
    </div>
  );
}
