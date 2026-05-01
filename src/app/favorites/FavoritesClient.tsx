"use client";

import { useEffect, useState } from "react";
import { Country } from "@/types/country";
import { useFavorites } from "@/hooks/useFavorites";
import CountryList from "@/components/CountryList";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavoritesClient() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, mounted } = useFavorites();

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,cca3,region,population,area");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setCountries(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCountries();
  }, []);

  if (!mounted || loading) {
    return (
      <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-glow" />
        </div>
      </main>
    );
  }

  const favoriteCountries = countries.filter(c => favorites.includes(c.cca3));

  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="mb-8 border-b border-white/5 pb-8">
          <h2 className="text-3xl font-black text-text-primary sm:text-4xl font-instrument-serif">My Favorites</h2>
          <p className="mt-2 text-muted font-sora">Your personalized list of saved countries.</p>
        </div>
        
        {favoriteCountries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Heart className="h-16 w-16 text-muted mb-4" />
            <h3 className="text-2xl font-bold text-text-primary mb-2 font-sora">No favorites yet</h3>
            <p className="text-muted mb-6 font-sora">Click the heart icon on any country to save it.</p>
            <Link href="/countries" className="px-6 py-3 bg-cyan-glow text-atlas-950 rounded-xl font-bold font-sora transition-all hover:bg-cyan-glow/80">
              Explore Countries
            </Link>
          </div>
        ) : (
          <CountryList initialCountries={favoriteCountries} />
        )}
      </div>
    </main>
  );
}