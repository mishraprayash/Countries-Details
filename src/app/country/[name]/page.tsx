import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Globe, MapPin, Users, Calendar, 
  Map, Flag, Landmark, ExternalLink, TrendingUp, Calculator
} from "lucide-react";
import { getCountryByName, getCountriesByCodes } from "@/lib/api";

import ExtendedStats from "@/components/ExtendedStats";
import LiveWeather from "@/components/LiveWeather";
import CountryActions from "@/components/CountryActions";
import TrackView from "@/components/TrackView";
import CurrencyConverter from "@/components/CurrencyConverter";
import CountryLocationMapWrapper from "@/components/CountryLocationMapWrapper";
import ClimographWrapper from "@/components/ClimographWrapper";
import SeismicMonitorWrapper from "@/components/SeismicMonitorWrapper";
import PopularDestinations from "@/components/PopularDestinations";

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

  let wikiSummary: { extract: string; description?: string } | null = null;
  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country.name.common)}`,
      { next: { revalidate: 86400 } }
    );
    if (wikiRes.ok) {
      wikiSummary = await wikiRes.json();
    }
  } catch {}

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

      <TrackView
        cca3={country.cca3}
        name={country.name.common}
        flag={country.flags.svg}
      />

      {/* Print-only summary (hidden on screen, visible on print) */}
      <div className="hidden print:block print-page">
        <header className="mb-6 pb-4 border-b-2 border-zinc-900">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 font-sora">World Insights · Country Sheet</p>
          <h1 className="mt-2 text-3xl font-black">{country.name.common}</h1>
          <p className="mt-1 text-sm text-zinc-700">{country.name.official}</p>
        </header>

        <section className="mb-6 flex gap-6 items-start">
          <div className="shrink-0 w-32 h-20 border border-zinc-300 rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={country.flags.svg} alt={`Flag of ${country.name.common}`} className="w-full h-full object-cover" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-800">
            {country.name.common} is a {country.independent ? "sovereign" : "non-sovereign"} {country.unMember ? "UN member" : "non-UN member"} country located in {country.subregion ? country.subregion + ", " : ""}{country.region}, with {country.capital?.[0] ? `${country.capital[0]} as its capital` : "no recognized capital"}.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-zinc-900">Quick Facts</h2>
          <table>
            <tbody>
              <tr><th>Capital</th><td>{country.capital?.[0] || "N/A"}</td></tr>
              <tr><th>Region</th><td>{country.region}{country.subregion ? ` (${country.subregion})` : ""}</td></tr>
              <tr><th>Continent</th><td>{country.continents.join(", ")}</td></tr>
              <tr><th>Population</th><td>{country.population.toLocaleString()}</td></tr>
              <tr><th>Area</th><td>{country.area.toLocaleString()} km²</td></tr>
              <tr><th>Languages</th><td>{country.languages ? Object.values(country.languages).join(", ") : "N/A"}</td></tr>
              <tr><th>Currencies</th><td>{country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(", ") : "N/A"}</td></tr>
              <tr><th>Calling Code</th><td>{`${country.idd.root}${country.idd.suffixes?.[0] || ""}`}</td></tr>
              <tr><th>Driving Side</th><td>{country.car.side.charAt(0).toUpperCase() + country.car.side.slice(1)}</td></tr>
              <tr><th>Start of Week</th><td>{country.startOfWeek.charAt(0).toUpperCase() + country.startOfWeek.slice(1)}</td></tr>
              <tr><th>ISO 3166-1</th><td>{country.cca2} / {country.cca3}{country.ccn3 ? ` / ${country.ccn3}` : ""}</td></tr>
              {country.tld && <tr><th>TLD</th><td>{country.tld.join(", ")}</td></tr>}
              {country.fifa && <tr><th>FIFA</th><td>{country.fifa}</td></tr>}
              <tr><th>UN Member</th><td>{country.unMember ? "Yes" : "No"}</td></tr>
              <tr><th>Independent</th><td>{country.independent ? "Yes" : "No"}</td></tr>
              <tr><th>Landlocked</th><td>{country.landlocked ? "Yes" : "No"}</td></tr>
            </tbody>
          </table>
        </section>

        {borderCountries.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-zinc-900">Neighboring Countries ({borderCountries.length})</h2>
            <p className="text-sm text-zinc-800">{borderCountries.map(b => b.name.common).join(", ")}</p>
          </section>
        )}

        <footer className="pt-4 mt-6 border-t border-zinc-300 text-xs text-zinc-600 flex justify-between">
          <span>Printed from World Insights</span>
          <span>{new Date().toLocaleDateString()}</span>
        </footer>
      </div>

      <div className="relative h-64 sm:h-80 print:hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={country.flags.svg}
            alt={country.name.common}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-atlas-950 via-atlas-950/70 to-transparent" />
        </div>
        
        <div className="relative h-full">
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
                
                <CountryActions
                  cca3={country.cca3}
                  name={country.name.common}
                  unMember={country.unMember}
                  independent={country.independent}
                  shareCardData={{
                    name: country.name,
                    flags: country.flags,
                    population: country.population,
                    area: country.area,
                    region: country.region,
                    subregion: country.subregion,
                    capital: country.capital,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <InfoCard icon={Users} label="Population" value={country.population > 1e6 ? `${(country.population / 1e6).toFixed(1)}M` : country.population.toLocaleString()} highlight />
          <InfoCard icon={MapPin} label="Capital" value={country.capital?.[0] || "N/A"} />
          <InfoCard icon={Globe} label="Region" value={country.region} />
          <InfoCard icon={Calendar} label="Area" value={country.area > 1e6 ? `${(country.area / 1e6).toFixed(1)}M km²` : `${country.area.toLocaleString()} km²`} />
        </div>

        {wikiSummary && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6 mb-8 font-sora">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">Narrative Introduction</h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              {wikiSummary.extract}
            </p>
            {wikiSummary.description && (
              <span className="text-[10px] text-text-muted mt-3 block uppercase tracking-wider">
                Source: Wikipedia · {wikiSummary.description}
              </span>
            )}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6 print:hidden">
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

            {country.capitalInfo?.latlng ? (
              <ClimographWrapper
                lat={country.capitalInfo.latlng[0]}
                lng={country.capitalInfo.latlng[1]}
                capitalName={country.capital?.[0] || country.name.common}
              />
            ) : (
              <ClimographWrapper
                lat={country.latlng[0]}
                lng={country.latlng[1]}
                capitalName={country.name.common}
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
                  <div className="flex justify-between"><span className="text-muted">Timezones</span><span className="font-medium text-text-secondary text-right font-dm-mono">{country.timezones.length > 2 ? `${country.timezones[0]} +${country.timezones.length - 1} more` : country.timezones.join(", ")}</span></div>
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

          <div className="space-y-6 print:hidden">
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

            <CurrencyConverter currencies={country.currencies} />

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2 font-sora">Travel Utilities</h3>
              <p className="text-xs text-text-muted mb-4 leading-relaxed font-sora">Estimate lodging, dining, activities, and transit costs in {country.name.common}.</p>
              <Link
                href={`/budget-planner?country=${encodeURIComponent(country.name.common)}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/20 transition-all font-sora text-sm font-semibold"
              >
                <Calculator className="h-4 w-4" />
                Calculate Trip Budget
              </Link>
            </div>

            <SeismicMonitorWrapper lat={country.latlng[0]} lng={country.latlng[1]} countryName={country.name.common} />

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 font-sora">Country Codes</h3>
              <div className="space-y-3 font-sora">
                <div className="flex justify-between items-center"><span className="text-muted">ISO 3166-1</span><span className="font-dm-mono font-bold text-text-secondary">{country.cca3}</span></div>
                {country.fifa && <div className="flex justify-between items-center"><span className="text-muted">FIFA</span><span className="font-dm-mono font-bold text-text-secondary">{country.fifa}</span></div>}
                {country.tld && <div className="flex justify-between items-center"><span className="text-muted">TLD</span><span className="font-dm-mono font-bold text-text-secondary">{country.tld.join(", ")}</span></div>}
                {country.car.signs && <div className="flex justify-between items-center"><span className="text-muted">Car Signs</span><span className="font-dm-mono font-bold text-text-secondary">{country.car.signs.join(", ")}</span></div>}
              </div>
            </div>

          </div>
        </div>

        {/* Top Curated Destinations */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6 print:hidden">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2.5 font-sora">
              <Landmark className="h-6 w-6 text-cyan-glow" />
              Popular Destinations & Landmarks
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Explore curated historical landmarks, natural wonders, and popular cities to visit in {country.name.common}.
            </p>
          </div>
          <PopularDestinations countryName={country.name.common} />
        </div>

        {/* Full-width Interactive Leaflet Map */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] glass-card overflow-hidden print:hidden">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-text-primary font-sora">Interactive Map</h3>
              <p className="text-xs text-text-muted mt-0.5">Explore the geographical location and surroundings of {country.name.common}.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-secondary font-dm-mono">{country.latlng[0].toFixed(2)}°, {country.latlng[1].toFixed(2)}°</span>
              <a href={country.maps.googleMaps} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-glow hover:underline flex items-center gap-1 font-sora">
                Google Maps <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <CountryLocationMapWrapper
            lat={country.latlng[0]}
            lng={country.latlng[1]}
            name={country.name.common}
            flag={country.flags.svg}
            area={country.area}
          />
        </div>

      </div>
    </main>
  );
}