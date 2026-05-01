"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Lightbulb, ExternalLink } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  const getCountryOfTheDay = useCallback(async () => {
    if (!countries.length) return;

    setLoading(true);
    setIsExpanded(false);

    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const countryIndex = dayOfYear % countries.length;
    const country = countries[countryIndex];

    try {
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
      setCountryFact({
        name: country.name.common,
        flag: country.flags.svg,
        fact: `${country.name.common} is featured today! Explore its details and learn more.`,
        source: "",
      });
    } finally {
      setLoading(false);
    }
  }, [countries]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCountryOfTheDay();
  }, [getCountryOfTheDay]);

  if (loading) {
    return (
      <div className="h-28 rounded-2xl bg-gradient-to-r from-atlas-800 to-atlas-900 animate-pulse" />
    );
  }

  if (!countryFact) return null;

  const countryHref = `/country/${encodeURIComponent(countryFact.name.toLowerCase())}`;

  return (
    <div className="stagger-fade-in stagger-delay-2 relative group rounded-2xl overflow-hidden">
      {/* Shimmer border */}
      <div className="absolute inset-0 rounded-2xl shimmer-border" />

      {/* Inner card */}
      <div className="relative z-10 rounded-2xl bg-atlas-900/90 backdrop-blur-xl p-5 sm:p-6">
        {/* Background glow behind flag */}
        <div className="absolute top-4 left-4 w-24 h-16 rounded-xl bg-cyan-glow/10 blur-xl" />

        <div className="flex items-start gap-4 sm:gap-5">
          {/* Flag with glow */}
          <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform shrink-0 ring-1 ring-white/5">
            <div className="absolute inset-0 bg-cyan-glow/5 blur-md" />
            <Image
              src={countryFact.flag}
              alt={`Flag of ${countryFact.name}`}
              fill
              className="object-cover relative z-10"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-lg bg-cyan-glow/10 shrink-0">
                <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-glow" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-cyan-glow uppercase tracking-[0.15em]">
                Fact of the Day
              </span>
            </div>

            {/* Country Name */}
            <h4 className="text-base sm:text-lg font-semibold text-text-primary leading-tight mb-1 truncate font-instrument-serif">
              {countryFact.name}
            </h4>

            {/* Description */}
            <div className="relative">
              <p className={`text-xs sm:text-sm text-text-muted leading-relaxed transition-all duration-300 font-sora ${!isExpanded ? "line-clamp-3" : ""}`}>
                {countryFact.fact}
              </p>
              {countryFact.fact.length > 120 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-cyan-glow hover:text-cyan-glow/80 text-[10px] sm:text-xs font-semibold mt-1 transition-colors focus:outline-none"
                >
                  {isExpanded ? "Show less" : "See more"}
                </button>
              )}
            </div>
          </div>

          {/* Action - Desktop */}
          <Link
            href={countryHref}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow text-sm font-semibold hover:bg-cyan-glow/20 active:scale-95 transition-all shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
            Explore
          </Link>
        </div>

        {/* Action - Mobile */}
        <Link
          href={countryHref}
          className="flex sm:hidden items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow text-sm font-semibold hover:bg-cyan-glow/20 active:scale-95 transition-all shadow-md mt-4"
        >
          <ExternalLink className="h-4 w-4" />
          Explore
        </Link>
      </div>
    </div>
  );
}
