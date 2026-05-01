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
      <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-blue-500" />
        </div>
      </main>
    );
  }

  const favoriteCountries = countries.filter(c => favorites.includes(c.cca3));

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="mb-8 border-b border-white/5 pb-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">My Favorites</h2>
          <p className="mt-2 text-zinc-400">Your personalized list of saved countries.</p>
        </div>
        
        {favoriteCountries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Heart className="h-16 w-16 text-zinc-500 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No favorites yet</h3>
            <p className="text-zinc-400 mb-6">Click the heart icon on any country to save it.</p>
            <Link href="/countries" className="px-6 py-3 bg-white text-black rounded-xl font-bold">
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