"use client";

import React from "react";
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function StatsCharts({ regionData, populationData }: StatsChartsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Population by Region Pie Chart */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-8 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-white">
          Population Distribution by Region
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Countries Bar Chart */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-8 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-white">
          Top 10 Countries by Population (Millions)
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={populationData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                type="number" 
                tick={{ fill: "#71717a", fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: "#71717a", fontSize: 10 }} 
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)}M`, "Population"]}
              />
              <Bar 
                dataKey="population" 
                fill="#3b82f6" 
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
