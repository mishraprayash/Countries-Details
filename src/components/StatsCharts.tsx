"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface RegionData {
  name: string;
  value: number;
}

interface PopulationData {
  name: string;
  population: number;
}

interface StatsChartsProps {
  regionData: RegionData[];
  populationData: PopulationData[];
}

const COLORS = ["#00D4FF", "#A78BFA", "#FFB347", "#10b981", "#ec4899", "#06b6d4"];

export default function StatsCharts({ regionData, populationData }: StatsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface p-8 shadow-sm h-[480px] animate-pulse"></div>
        <div className="rounded-2xl border border-white/5 bg-surface p-8 shadow-sm h-[480px] animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Population by Region Donut Chart */}
      <div className="glass-card rounded-2xl p-8 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-text-primary uppercase tracking-[0.12em]">
          Population Distribution
        </h3>
        <p className="text-xs text-text-muted mb-6">By region</p>
        <div className="h-[350px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                strokeWidth={2}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {regionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="rgba(6, 8, 16, 0.8)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => [`${((value as number) / 1e9).toFixed(2)}B`, "Population"]}
                contentStyle={{
                  backgroundColor: "rgba(6, 8, 16, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#F0F4FF",
                  backdropFilter: "blur(12px)",
                }}
                itemStyle={{ color: "#F0F4FF", fontWeight: 600 }}
              />
              <Legend
                verticalAlign="bottom"
                height={48}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-text-muted font-sora">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Countries Bar Chart */}
      <div className="glass-card rounded-2xl p-8 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-text-primary uppercase tracking-[0.12em]">
          Top 10 by Population
        </h3>
        <p className="text-xs text-text-muted mb-6">Most populous nations</p>
        <div className="h-[350px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={populationData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                type="number"
                tick={{ fill: "#5A6A8A", fontSize: 11, fontFamily: "var(--font-dm-mono)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${(val / 1e9).toFixed(0)}B`}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#5A6A8A", fontSize: 10, fontFamily: "var(--font-sora)" }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0, 212, 255, 0.03)" }}
                contentStyle={{
                  backgroundColor: "rgba(6, 8, 16, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#F0F4FF",
                  backdropFilter: "blur(12px)",
                }}
                formatter={(value: unknown) => [`${((value as number) / 1e9).toFixed(2)}B`, "Population"]}
              />
              <Bar
                dataKey="population"
                fill="url(#barGradient)"
                radius={[0, 6, 6, 0]}
                barSize={18}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
