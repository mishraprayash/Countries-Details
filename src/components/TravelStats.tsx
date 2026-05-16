"use client";

import { MapPin, Compass, Home, Globe } from "lucide-react";
import { TravelStats as TravelStatsType } from "@/types/user";

interface TravelStatsProps {
  stats: TravelStatsType;
}

export default function TravelStats({ stats }: TravelStatsProps) {
  const cards = [
    {
      label: "Visited",
      value: stats.visitedCount,
      icon: MapPin,
      accent: "emerald",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      label: "Want to Visit",
      value: stats.wantToVisitCount,
      icon: Compass,
      accent: "amber",
      color: "text-amber-glow",
      bg: "bg-amber-glow/10",
      border: "border-amber-glow/20",
    },
    {
      label: "Lived In",
      value: stats.livedInCount,
      icon: Home,
      accent: "violet",
      color: "text-violet-glow",
      bg: "bg-violet-glow/10",
      border: "border-violet-glow/20",
    },
    {
      label: "World Coverage",
      value: `${stats.visitedPercentage}%`,
      icon: Globe,
      accent: "cyan",
      color: "text-cyan-glow",
      bg: "bg-cyan-glow/10",
      border: "border-cyan-glow/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-2xl border ${card.border} ${card.bg} bg-white/[0.02] p-5 glass-card`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted font-sora">
                {card.label}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className={`text-3xl font-black font-dm-mono ${card.color}`}>{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
