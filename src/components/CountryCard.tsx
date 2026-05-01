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
      className="group flex flex-col overflow-hidden rounded-2xl bg-zinc-900/50 shadow-sm ring-1 ring-white/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:bg-zinc-900"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={country.flags.svg}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
        
        {mounted && (
          <button
            onClick={(e) => toggleFavorite(country.cca3, e)}
            className="absolute top-3 right-3 z-10 rounded-full bg-zinc-950/40 p-2 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-950/60"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFav ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>
        )}
      </div>
      <div className="flex flex-col p-5.5">
        <h3 className="mb-4 text-lg font-black tracking-tight text-white transition-colors group-hover:text-blue-400">
          {country.name.common}
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Users className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-bold text-zinc-200">{country.population.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <MapPin className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-bold text-zinc-200">{country.region}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Building2 className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-bold text-zinc-200 truncate">{country.capital?.[0] || "N/A"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(CountryCard);
