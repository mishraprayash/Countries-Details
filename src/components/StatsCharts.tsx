"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface StatsChartsProps {
  regionData: { name: string; value: number }[];
  populationData: { name: string; population: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function StatsCharts({ regionData, populationData }: StatsChartsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Population by Region Pie Chart */}
      <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm dark:border-navy-800 dark:bg-navy-900">
        <h3 className="mb-6 text-lg font-bold text-navy-900 dark:text-navy-50">
          Population Distribution by Region
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(Number(percent || 0) * 100).toFixed(0)}%`}
              >
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--background)", 
                  border: "1px solid rgba(0,0,0,0.1)", 
                  borderRadius: "12px",
                  color: "var(--foreground)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
                itemStyle={{ color: "var(--foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Countries Bar Chart */}
      <div className="rounded-2xl border border-navy-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-navy-900">
        <h3 className="mb-6 text-lg font-bold text-navy-900 dark:text-navy-50">
          Top 10 Countries by Population (Millions)
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={populationData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" opacity={0.1} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }}
                width={80}
              />
              <Tooltip
                cursor={{ fill: "currentColor", opacity: 0.05 }}
                contentStyle={{ 
                  backgroundColor: "var(--background)", 
                  border: "1px solid rgba(0,0,0,0.1)", 
                  borderRadius: "12px",
                  color: "var(--foreground)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
                itemStyle={{ color: "var(--foreground)" }}
                formatter={(value: any) => [`${(Number(value) / 1000000).toFixed(1)}M`, "Population"]}
              />
              <Bar 
                dataKey="population" 
                fill="#3b82f6" 
                radius={[0, 4, 4, 0]}
                barSize={20}
                stroke="none"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
