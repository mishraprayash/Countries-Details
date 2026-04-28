"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Lightbulb, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CountryData {
  name: { common: string; official: string };
  cca3?: string;
  flags: { svg: string };
}

interface CountryOfTheDayProps {
  countries: CountryData[];
}

interface CountryFact {
  name: string;
  flag: string;
  fact: string;
  source: string;
}

const WIKIPEDIA_API = "https://en.wikipedia.org/api/rest_v1/page/summary/";

export default function CountryOfTheDay({ countries }: CountryOfTheDayProps) {
  const [countryFact, setCountryFact] = useState<CountryFact | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getCountryOfTheDay = async () => {
    if (!countries.length) return;

    setLoading(true);
    setRefreshing(true);
    setIsExpanded(false);

    try {
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() -
          new Date(today.getFullYear(), 0, 0).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const countryIndex = dayOfYear % countries.length;
      const country = countries[countryIndex];

      const response = await fetch(
        `${WIKIPEDIA_API}${encodeURIComponent(country.name.common)}`
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      setCountryFact({
        name: country.name.common,
        flag: country.flags.svg,
        fact:
          data.extract ||
          `${country.name.common} is featured today! Explore its rich culture and history.`,
        source: data.content_urls?.desktop?.page || "",
      });
    } catch {
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() -
          new Date(today.getFullYear(), 0, 0).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const countryIndex = dayOfYear % countries.length;
      const country = countries[countryIndex];

      setCountryFact({
        name: country.name.common,
        flag: country.flags.svg,
        fact: `${country.name.common} is featured today! Explore its details and learn more.`,
        source: "",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  useEffect(() => {
    // Avoid synchronous state updates in the effect body
    const timeoutId = setTimeout(() => {
      getCountryOfTheDay();
    }, 0);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries]);

  if (loading) {
    return (
      <div className="h-28 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 animate-pulse" />
    );
  }

  if (!countryFact) return null;

  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-amber-500/20 via-white/10 to-amber-500/20">
      <div className="rounded-2xl bg-zinc-900/80 backdrop-blur-xl p-4 transition-all duration-300 group-hover:bg-zinc-900/90 group-hover:shadow-xl">
        
        <div className="flex items-start gap-4">
          
          {/* Flag */}
          <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-white/10 shadow-md group-hover:scale-105 transition-transform">
            <Image
              src={countryFact.flag}
              alt={`Flag of ${countryFact.name}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Fact of the Day
                </span>
              </div>

              <button
                onClick={getCountryOfTheDay}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition"
                title="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>

            {/* Country Name */}
            <h4 className="text-lg font-semibold text-white leading-tight mb-1">
              {countryFact.name}
            </h4>

            {/* Description */}
            <div className="relative">
              <p className={`text-sm text-zinc-400 leading-relaxed transition-all duration-300 ${!isExpanded ? "line-clamp-3" : ""}`}>
                {countryFact.fact}
              </p>
              {countryFact.fact.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-amber-500 hover:text-amber-400 text-xs font-semibold mt-1 transition-colors focus:outline-none"
                >
                  {isExpanded ? "Show less" : "See more"}
                </button>
              )}
            </div>
          </div>

          {/* Action */}
          <Link
            href={`/country/${countryFact.name.toLowerCase()}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 active:scale-95 transition-all shadow-md"
          >
            <ExternalLink className="h-4 w-4" />
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}