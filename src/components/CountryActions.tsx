"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, Scale, Check, MapPin, Printer } from "lucide-react";
import Link from "next/link";
import { CountryStatus } from "@/types/user";
import ShareCard from "@/components/ShareCard";

interface CountryActionsProps {
  cca3: string;
  name: string;
  unMember?: boolean;
  independent?: boolean;
  shareCardData?: {
    name: { common: string; official: string };
    flags: { svg: string; png?: string };
    population: number;
    area: number;
    region: string;
    subregion?: string;
    capital?: string[];
  };
}

export default function CountryActions({ cca3, name, unMember, independent, shareCardData }: CountryActionsProps) {
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [travelStatus, setTravelStatus] = useState<CountryStatus | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("world_insights_favorites");
      if (stored) {
        const favs = JSON.parse(stored);
        setIsFav(favs.includes(cca3));
      }
    } catch {}

    try {
      const travelData = localStorage.getItem("world_insights_travel_map");
      if (travelData) {
        const parsed = JSON.parse(travelData);
        if (parsed[cca3]) setTravelStatus(parsed[cca3].status);
      }
    } catch {}

    const handleSync = () => {
      try {
        const stored = localStorage.getItem("world_insights_favorites");
        if (stored) {
          const favs = JSON.parse(stored);
          setIsFav(favs.includes(cca3));
        }
      } catch {}
    };

    const handleTravelSync = () => {
      try {
        const travelData = localStorage.getItem("world_insights_travel_map");
        if (travelData) {
          const parsed = JSON.parse(travelData);
          setTravelStatus(parsed[cca3]?.status ?? null);
        }
      } catch {}
    };

    window.addEventListener("favorites-updated", handleSync);
    window.addEventListener("travel-map-updated", handleTravelSync);
    return () => {
      window.removeEventListener("favorites-updated", handleSync);
      window.removeEventListener("travel-map-updated", handleTravelSync);
    };
  }, [cca3]);

  const toggleFavorite = () => {
    try {
      const stored = localStorage.getItem("world_insights_favorites");
      const favs: string[] = stored ? JSON.parse(stored) : [];
      const updated = favs.includes(cca3) ? favs.filter((id: string) => id !== cca3) : [...favs, cca3];
      localStorage.setItem("world_insights_favorites", JSON.stringify(updated));
      setIsFav(!isFav);
      window.dispatchEvent(new Event("favorites-updated"));
    } catch {}
  };

  const shareCountry = async () => {
    if (shareCardData) {
      setShowShareCard(true);
      return;
    }
    const url = window.location.href;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: `${name} | World Insights`, url });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleFavorite}
        className={`p-2.5 rounded-lg backdrop-blur-sm transition-all ${
          isFav
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-black/30 text-text-primary hover:bg-white/10 border border-white/10"
        }`}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
      </button>
      <button
        onClick={shareCountry}
        className="p-2.5 rounded-lg bg-black/30 backdrop-blur-sm text-text-primary hover:bg-white/10 transition-all border border-white/10"
        aria-label="Share"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
      </button>
      <Link
        href={`/compare?countries=${cca3}`}
        className="p-2.5 rounded-lg bg-black/30 backdrop-blur-sm text-text-primary hover:bg-white/10 transition-all border border-white/10"
        aria-label="Compare"
      >
        <Scale className="h-4 w-4" />
      </Link>

      <button
        onClick={() => window.print()}
        className="p-2.5 rounded-lg bg-black/30 backdrop-blur-sm text-text-primary hover:bg-white/10 transition-all border border-white/10"
        aria-label="Print"
      >
        <Printer className="h-4 w-4" />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowStatusPicker(!showStatusPicker)}
          className={`p-2.5 rounded-lg backdrop-blur-sm transition-all border ${
            travelStatus
              ? travelStatus === "visited"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : travelStatus === "want-to-visit"
                ? "bg-amber-glow/20 text-amber-glow border-amber-glow/30"
                : "bg-violet-glow/20 text-violet-glow border-violet-glow/30"
              : "bg-black/30 text-text-primary hover:bg-white/10 border-white/10"
          }`}
          aria-label="Travel status"
        >
          <MapPin className="h-4 w-4" />
        </button>

        {showStatusPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowStatusPicker(false)} />
            <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-white/10 bg-atlas-900 shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
              {([["visited", "Visited", "text-emerald-400", "bg-emerald-500/20"],
                ["want-to-visit", "Want to Visit", "text-amber-glow", "bg-amber-glow/20"],
                ["lived-in", "Lived In", "text-violet-glow", "bg-violet-glow/20"]] as const).map(([value, label, textColor, bgColor]) => {
                const isActive = travelStatus === value;
                return (
                  <button
                    key={value}
                    onClick={() => {
                      try {
                        const key = "world_insights_travel_map";
                        const stored = localStorage.getItem(key);
                        const data: Record<string, { status: string; addedAt: number; updatedAt: number }> = stored ? JSON.parse(stored) : {};
                        if (isActive) {
                          delete data[cca3];
                          setTravelStatus(null);
                        } else {
                          data[cca3] = { status: value, addedAt: data[cca3]?.addedAt ?? Date.now(), updatedAt: Date.now() };
                          setTravelStatus(value as CountryStatus);
                        }
                        localStorage.setItem(key, JSON.stringify(data));
                        window.dispatchEvent(new Event("travel-map-updated"));
                      } catch {}
                      setShowStatusPicker(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all font-sora ${
                      isActive ? `${bgColor} ${textColor}` : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    }`}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      value === "visited" ? "bg-emerald-400" : value === "want-to-visit" ? "bg-amber-glow" : "bg-violet-glow"
                    }`} />
                    {label}
                    {isActive && <Check className="h-3.5 w-3.5 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {unMember && (
        <span className="px-3 py-1.5 rounded-full bg-cyan-glow/20 text-cyan-glow text-sm font-medium border border-cyan-glow/30 font-sora">
          UN Member
        </span>
      )}
      {independent && (
        <span className="px-3 py-1.5 rounded-full bg-amber-glow/20 text-amber-glow text-sm font-medium border border-amber-glow/30 font-sora">
          Independent
        </span>
      )}

      {shareCardData && (
        <ShareCard
          isOpen={showShareCard}
          onClose={() => setShowShareCard(false)}
          country={shareCardData}
        />
      )}
    </div>
  );
}
