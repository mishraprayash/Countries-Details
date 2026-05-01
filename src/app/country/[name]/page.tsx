import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Globe, MapPin, Users, Calendar, 
  Map, Flag, Landmark, ExternalLink, TrendingUp
} from "lucide-react";
import { getCountryByName, getCountriesByCodes } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ExtendedStats from "@/components/ExtendedStats";
import LiveWeather from "@/components/LiveWeather";

import { Metadata } from "next";

interface CountryPageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { name } = await params;
  const country = await getCountryByName(name).catch(() => null);
  
  if (!country) {
    return { title: 'Country Not Found | World Insights' };
  }

  const countryName = country.name.common;
  const description = `Discover detailed information about ${countryName}, including its capital ${country.capital?.[0] || 'N/A'}, population, area, currencies, and geographical data on World Insights.`;

  return {
    title: countryName,
    description,
    keywords: [countryName, country.name.official, "country details", "geography", "population", country.capital?.[0] || ""].filter(Boolean) as string[],
    openGraph: {
      title: `${countryName} | World Insights`,
      description,
      type: "article",
      images: [
        {
          url: country.flags.png || country.flags.svg,
          width: 1200,
          height: 630,
          alt: `Flag of ${countryName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${countryName} | World Insights`,
      description,
      images: [country.flags.png || country.flags.svg],
    },
  };
}

function InfoCard({ icon: Icon, label, value, highlight = false }: { icon: React.ElementType; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${highlight ? "bg-blue-500/10 border border-blue-500/20" : "bg-white/5 border border-white/5"}`}>
      <div className={`p-2 rounded-lg ${highlight ? "bg-blue-500/20" : "bg-white/10"}`}>
        <Icon className={`h-5 w-5 ${highlight ? "text-blue-400" : "text-zinc-400"}`} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-bold ${highlight ? "text-blue-400" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { name } = await params;

  const country = await getCountryByName(name);
  const borderCountries = country.borders ? await getCountriesByCodes(country.borders) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": country.name.common,
    "alternateName": country.name.official,
    "description": `Information about ${country.name.common}, located in ${country.region}.`,
    "latitude": country.latlng[0],
    "longitude": country.latlng[1],
    "globalLocationNumber": country.cca3,
    "telephone": country.idd.root ? `${country.idd.root}${country.idd.suffixes?.[0] || ""}` : undefined,
    "image": country.flags.svg,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": country.region,
      "addressCountry": country.cca2
    },
    "containedInPlace": {
      "@type": "Place",
      "name": country.region
    }
  };

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80">
            <Globe className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold tracking-tight">World Insights</span>
          </Link>
          <Navbar />
        </div>
      </header>

      <div className="relative">
        {/* Hero Banner */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <Image
            src={country.flags.svg}
            alt={country.name.common}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Link
              href="/countries"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm text-white text-sm font-medium hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Countries
            </Link>
          </div>

          {/* Country Title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">{country.name.common}</h1>
                  <p className="text-lg text-zinc-300">{country.name.official}</p>
                </div>
                
                {/* Status Badges */}
                <div className="flex gap-2">
                  {country.unMember && (
                    <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium border border-blue-500/30">
                      UN Member
                    </span>
                  )}
                  {country.independent && (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/30">
                      Independent
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <InfoCard icon={Users} label="Population" value={country.population > 1e6 ? `${(country.population / 1e6).toFixed(1)}M` : country.population.toLocaleString()} highlight />
          <InfoCard icon={MapPin} label="Capital" value={country.capital?.[0] || "N/A"} />
          <InfoCard icon={Globe} label="Region" value={country.region} />
          <InfoCard icon={Calendar} label="Area" value={country.area > 1e6 ? `${(country.area / 1e6).toFixed(1)}M km²` : `${country.area.toLocaleString()} km²`} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Weather (Moved to top of main content) */}
            {country.capitalInfo?.latlng ? (
              <LiveWeather
                lat={country.capitalInfo.latlng[0]}
                lng={country.capitalInfo.latlng[1]}
                cityName={country.capital?.[0] || country.name.common}
              />
            ) : (
              <LiveWeather
                lat={country.latlng[0]}
                lng={country.latlng[1]}
                cityName={country.name.common}
              />
            )}

            {/* Geography & Identity */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Map className="h-5 w-5 text-blue-400" />
                  Geography
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-zinc-500">Continent</span><span className="font-medium">{country.continents.join(", ")}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Subregion</span><span className="font-medium">{country.subregion || "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Timezone</span><span className="font-medium">{country.timezones[0]}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Start of Week</span><span className="font-medium capitalize">{country.startOfWeek}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-emerald-400" />
                  Identity
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-zinc-500">Languages</span><span className="font-medium">{country.languages ? Object.values(country.languages).join(", ") : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Currencies</span><span className="font-medium">{country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(", ") : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Driving Side</span><span className="font-medium capitalize">{country.car.side}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Calling Code</span><span className="font-medium">{`${country.idd.root}${country.idd.suffixes?.[0] || ""}`}</span></div>
                </div>
              </div>
            </div>

            {/* Economy Stats */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-400" />
                Economy & Demographics
              </h3>
              <ExtendedStats cca3={country.cca3} />
            </div>

            {/* Neighboring Countries */}
            {borderCountries.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Flag className="h-5 w-5 text-purple-400" />
                  Neighboring Countries ({borderCountries.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {borderCountries.map((border) => (
                    <Link
                      key={border.cca3}
                      href={`/country/${encodeURIComponent(border.name.common.toLowerCase())}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <Image src={border.flags.svg} alt={border.name.common} width={24} height={16} className="rounded-sm" />
                      <span className="text-sm font-medium">{border.name.common}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Coat of Arms */}
            {country.coatOfArms?.svg && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Coat of Arms</h3>
                <div className="relative h-32 w-full">
                  <Image
                    src={country.coatOfArms.svg}
                    alt="Coat of Arms"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Codes */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Country Codes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-zinc-500">ISO 3166-1</span><span className="font-mono font-bold">{country.cca3}</span></div>
                {country.fifa && <div className="flex justify-between items-center"><span className="text-zinc-500">FIFA</span><span className="font-mono font-bold">{country.fifa}</span></div>}
                {country.tld && <div className="flex justify-between items-center"><span className="text-zinc-500">TLD</span><span className="font-mono font-bold">{country.tld.join(", ")}</span></div>}
                {country.car.signs && <div className="flex justify-between items-center"><span className="text-zinc-500">Car Signs</span><span className="font-mono font-bold">{country.car.signs.join(", ")}</span></div>}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Location</h3>
              </div>
              <div className="relative h-48">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${country.latlng[0]},${country.latlng[1]}&z=5&output=embed`}
                  className="grayscale invert hue-rotate-180"
                />
              </div>
              <div className="p-3 flex justify-between items-center bg-white/5">
                <span className="text-xs text-zinc-500">{country.latlng[0].toFixed(2)}°, {country.latlng[1].toFixed(2)}°</span>
                <a href={country.maps.googleMaps} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                  Open in Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}