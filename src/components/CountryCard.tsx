"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Country } from "@/types/country";
import { Users, MapPin, Building2, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface CountryCardProps {
  country: Country;
}

function CountryCard({ country }: CountryCardProps) {
  const { isFavorite, toggleFavorite, mounted } = useFavorites();
  const isFav = isFavorite(country.cca3);

  return (
    <Link
      href={`/country/${encodeURIComponent(country.name.common.toLowerCase())}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] glass-card ring-1 ring-white/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-cyan-glow/20 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={country.flags.svg}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-atlas-950/80 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
        
        {mounted && (
          <button
            onClick={(e) => toggleFavorite(country.cca3, e)}
            className="absolute top-3 right-3 z-10 rounded-full bg-atlas-950/50 p-2 backdrop-blur-md transition-all hover:scale-110 hover:bg-atlas-950/70 border border-white/10"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFav ? "fill-red-500 text-red-500" : "text-muted"
              }`}
            />
          </button>
        )}
      </div>
      <div className="flex flex-col p-5.5">
        <h3 className="mb-4 text-lg font-bold tracking-tight text-text-primary transition-colors duration-300 group-hover:text-cyan-glow font-sora">
          {country.name.common}
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <Users className="h-3.5 w-3.5 text-muted/60" />
            <span className="font-dm-mono text-text-secondary">{country.population.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <MapPin className="h-3.5 w-3.5 text-muted/60" />
            <span className="text-text-secondary">{country.region}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <Building2 className="h-3.5 w-3.5 text-muted/60" />
            <span className="text-text-secondary truncate">{country.capital?.[0] || "N/A"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(CountryCard);
