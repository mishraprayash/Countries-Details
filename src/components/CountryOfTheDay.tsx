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
    <div className="stagger-fade-in stagger-delay-2 relative group rounded-3xl overflow-hidden h-full flex flex-col border border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-lg hover:border-cyan-glow/30 transition-all duration-500">
      
      {/* Top Banner & Flag Area */}
      <div className="relative w-full h-32 sm:h-40 shrink-0">
        <Image
          src={countryFact.flag}
          alt={`Flag of ${countryFact.name}`}
          fill
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-atlas-950 via-atlas-950/60 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-atlas-950/60 backdrop-blur-md border border-white/10">
            <Lightbulb className="h-3 w-3 text-cyan-glow" />
            <span className="text-[10px] font-bold text-cyan-glow uppercase tracking-[0.15em]">
              Fact of the Day
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 relative z-10 -mt-10">
        
        {/* Country Name */}
        <h4 className="text-3xl font-bold text-text-primary mb-3 font-instrument-serif drop-shadow-md">
          {countryFact.name}
        </h4>

        {/* Description */}
        <div className="relative flex-1">
          <p className={`text-sm text-text-secondary leading-relaxed font-sora ${!isExpanded ? "line-clamp-4" : ""}`}>
            {countryFact.fact}
          </p>
          {countryFact.fact.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-cyan-glow hover:text-cyan-glow/80 text-xs font-semibold mt-2 transition-colors focus:outline-none"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Action Button */}
        <Link
          href={countryHref}
          className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow text-sm font-semibold hover:bg-cyan-glow/20 active:scale-95 transition-all shadow-md"
        >
          <ExternalLink className="h-4 w-4" />
          Explore {countryFact.name}
        </Link>
      </div>

    </div>
  );
}
