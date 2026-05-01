import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Globe, MapPin, Users, Calendar, 
  Map, Flag, Landmark, ExternalLink, TrendingUp
} from "lucide-react";
import { getCountryByName, getCountriesByCodes } from "@/lib/api";

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
    <div className={`flex items-center gap-3 p-4 rounded-xl glass-card ${highlight ? "bg-cyan-glow/10 border border-cyan-glow/20" : "bg-white/[0.03] border border-white/5"}`}>
      <div className={`p-2 rounded-lg ${highlight ? "bg-cyan-glow/20" : "bg-white/10"}`}>
        <Icon className={`h-5 w-5 ${highlight ? "text-cyan-glow" : "text-muted"}`} />
      </div>
      <div>
        <p className="text-xs text-muted uppercase tracking-wider font-sora">{label}</p>
        <p className={`text-sm font-bold font-dm-mono ${highlight ? "text-cyan-glow" : "text-text-primary"}`}>{value}</p>
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
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />


      <div className="relative">
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <Image
            src={country.flags.svg}
            alt={country.name.common}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-atlas-950 via-atlas-950/70 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Link
              href="/countries"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm text-text-primary text-sm font-medium hover:bg-black/50 transition-colors font-sora"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Countries
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-5xl font-black text-text-primary mb-2 font-instrument-serif">{country.name.common}</h1>
                  <p className="text-lg text-text-secondary font-sora">{country.name.official}</p>
                </div>
                
                <div className="flex gap-2">
                  {country.unMember && (
                    <span className="px-3 py-1.5 rounded-full bg-cyan-glow/20 text-cyan-glow text-sm font-medium border border-cyan-glow/30 font-sora">
                      UN Member
                    </span>
                  )}
                  {country.independent && (
                    <span className="px-3 py-1.5 rounded-full bg-amber-glow/20 text-amber-glow text-sm font-medium border border-amber-glow/30 font-sora">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <InfoCard icon={Users} label="Population" value={country.population > 1e6 ? `${(country.population / 1e6).toFixed(1)}M` : country.population.toLocaleString()} highlight />
          <InfoCard icon={MapPin} label="Capital" value={country.capital?.[0] || "N/A"} />
          <InfoCard icon={Globe} label="Region" value={country.region} />
          <InfoCard icon={Calendar} label="Area" value={country.area > 1e6 ? `${(country.area / 1e6).toFixed(1)}M km²` : `${country.area.toLocaleString()} km²`} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
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

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 font-sora">
                  <Map className="h-5 w-5 text-cyan-glow" />
                  Geography
                </h3>
                <div className="space-y-3 font-sora">
                  <div className="flex justify-between"><span className="text-muted">Continent</span><span className="font-medium text-text-secondary">{country.continents.join(", ")}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Subregion</span><span className="font-medium text-text-secondary">{country.subregion || "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Timezone</span><span className="font-medium text-text-secondary font-dm-mono">{country.timezones[0]}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Start of Week</span><span className="font-medium text-text-secondary capitalize">{country.startOfWeek}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 font-sora">
                  <Landmark className="h-5 w-5 text-amber-glow" />
                  Identity
                </h3>
                <div className="space-y-3 font-sora">
                  <div className="flex justify-between"><span className="text-muted">Languages</span><span className="font-medium text-text-secondary">{country.languages ? Object.values(country.languages).join(", ") : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Currencies</span><span className="font-medium text-text-secondary">{country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(", ") : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Driving Side</span><span className="font-medium text-text-secondary capitalize">{country.car.side}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Calling Code</span><span className="font-medium text-text-secondary font-dm-mono">{`${country.idd.root}${country.idd.suffixes?.[0] || ""}`}</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 font-sora">
                <TrendingUp className="h-5 w-5 text-amber-glow" />
                Economy & Demographics
              </h3>
              <ExtendedStats cca3={country.cca3} />
            </div>

            {borderCountries.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 font-sora">
                  <Flag className="h-5 w-5 text-violet-glow" />
                  Neighboring Countries ({borderCountries.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {borderCountries.map((border) => (
                    <Link
                      key={border.cca3}
                      href={`/country/${encodeURIComponent(border.name.common.toLowerCase())}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors font-sora"
                    >
                      <Image src={border.flags.svg} alt={border.name.common} width={24} height={16} className="rounded-sm" />
                      <span className="text-sm font-medium text-text-secondary">{border.name.common}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {country.coatOfArms?.svg && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 font-sora">Coat of Arms</h3>
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

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 font-sora">Country Codes</h3>
              <div className="space-y-3 font-sora">
                <div className="flex justify-between items-center"><span className="text-muted">ISO 3166-1</span><span className="font-dm-mono font-bold text-text-secondary">{country.cca3}</span></div>
                {country.fifa && <div className="flex justify-between items-center"><span className="text-muted">FIFA</span><span className="font-dm-mono font-bold text-text-secondary">{country.fifa}</span></div>}
                {country.tld && <div className="flex justify-between items-center"><span className="text-muted">TLD</span><span className="font-dm-mono font-bold text-text-secondary">{country.tld.join(", ")}</span></div>}
                {country.car.signs && <div className="flex justify-between items-center"><span className="text-muted">Car Signs</span><span className="font-dm-mono font-bold text-text-secondary">{country.car.signs.join(", ")}</span></div>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider font-sora">Location</h3>
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
              <div className="p-3 flex justify-between items-center bg-white/[0.03]">
                <span className="text-xs text-muted font-dm-mono">{country.latlng[0].toFixed(2)}°, {country.latlng[1].toFixed(2)}°</span>
                <a href={country.maps.googleMaps} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-glow hover:underline flex items-center gap-1 font-sora">
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