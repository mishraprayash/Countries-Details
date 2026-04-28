import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Globe, Info, Landmark, Zap, Compass, MapPin,
  CheckCircle2, XCircle, Shield, ChevronRight, ExternalLink
} from "lucide-react";
import { getCountryByName, getCountriesByCodes, getCountriesByRegion } from "@/lib/api";
import CountryComparison from "@/components/CountryComparison";
import Navbar from "@/components/Navbar";

import { Metadata } from "next";
import { LucideIcon } from "lucide-react";

interface CountryPageProps {
  params: Promise<{ name: string }>;
}

function DetailSection({ title, icon: Icon, children, delay }: { title: string; icon: LucideIcon; children: React.ReactNode; delay: string }) {
  return (
    <div className={`group rounded-2xl border border-white/5 bg-zinc-900/50 shadow-sm transition-all hover:bg-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500 ${delay}`}>
      <div className="flex items-center gap-2.5 border-b border-white/5 bg-white/5 px-5 py-3.5">
        <Icon className="h-4.5 w-4.5 text-zinc-500 transition-colors group-hover:text-zinc-300" />
        <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function DataRow({ label, value, subValue }: { label: string; value: string | React.ReactNode; subValue?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
      <span className="text-sm font-medium text-zinc-500">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold text-white">{value}</span>
        {subValue && <p className="text-[10px] uppercase tracking-wider text-zinc-500">{subValue}</p>}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { name } = await params;
  const countryName = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    title: `${countryName} Details | World Insights`,
    description: `Detailed information about ${countryName}, including population, area, region, and neighboring countries.`,
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { name } = await params;
  const country = await getCountryByName(name);
  const borderCountries = country.borders
    ? await getCountriesByCodes(country.borders)
    : [];
  const regionCountries = await getCountriesByRegion(country.region);
  const regionAverage = regionCountries.reduce((acc, c) => acc + c.population, 0) / regionCountries.length;

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-white hover:opacity-80">
            <Globe className="h-5.5 w-5.5 text-blue-500" />
            <span className="text-lg font-bold tracking-tight">World Insights</span>
          </Link>
          <Navbar />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4.5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar / Flag / Badges */}
          <div className="space-y-6 lg:col-span-1">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-xl ring-1 ring-white/10">
              <Image
                src={country.flags.svg}
                alt={country.flags.alt || `Flag of ${country.name.common}`}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ${country.unMember ? "bg-blue-500/10 text-blue-400 ring-blue-500/20" : "bg-white/5 text-zinc-500 ring-white/10"}`}>
                {country.unMember ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                UN Member
              </div>
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ${country.independent ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-white/5 text-zinc-500 ring-white/10"}`}>
                {country.independent ? <Shield className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Independent
              </div>
            </div>

            {/* Coat of Arms */}
            {country.coatOfArms?.svg && (
              <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5 text-center shadow-sm">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Coat of Arms</p>
                <div className="relative mx-auto h-24 w-24">
                  <Image
                    src={country.coatOfArms.svg}
                    alt={`Coat of arms of ${country.name.common}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
                {country.name.common}
              </h1>
              <p className="mt-2 text-lg font-medium text-zinc-400">
                {country.name.official}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <DetailSection title="Geography" icon={Info} delay="delay-0">
                <DataRow label="Region" value={country.region} subValue={country.subregion} />
                <DataRow label="Continents" value={country.continents.join(", ")} />
                <DataRow label="Capital" value={country.capital?.join(", ") || "N/A"} />
                <DataRow label="Population" value={country.population.toLocaleString()} />
                <DataRow label="Total Area" value={`${country.area.toLocaleString()} km²`} />
              </DetailSection>

              <DetailSection title="Identity & Codes" icon={Landmark} delay="delay-75">
                <DataRow label="Languages" value={country.languages ? Object.values(country.languages).join(", ") : "N/A"} />
                <DataRow label="Native Name" value={country.name.nativeName ? Object.values(country.name.nativeName)[0].common : "N/A"} />
                <DataRow label="ISO Code" value={country.cca3} />
                <DataRow label="FIFA" value={country.fifa || "N/A"} />
              </DetailSection>

              <DetailSection title="Connectivity" icon={Zap} delay="delay-150">
                <DataRow label="Calling Code" value={`${country.idd.root}${country.idd.suffixes?.[0] || ""}`} />
                <DataRow label="Top Level Domain" value={country.tld?.[0] || "N/A"} />
                <DataRow label="Timezone" value={country.timezones[0]} />
              </DetailSection>

              <DetailSection title="Logistics" icon={Compass} delay="delay-200">
                <DataRow label="Driving Side" value={country.car.side.charAt(0).toUpperCase() + country.car.side.slice(1)} />
                <DataRow label="Currencies" value={country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(", ") : "N/A"} />
                <DataRow label="Start of Week" value={country.startOfWeek.charAt(0).toUpperCase() + country.startOfWeek.slice(1)} />
              </DetailSection>
            </div>
          </div>
        </div>

        {/* Neighbors & Map */}
        <div className="mt-12 grid gap-12">
          {/* Neighbors */}
          <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
              Neighboring Countries
            </h2>
            <div className="flex flex-wrap gap-3">
              {borderCountries.length > 0 ? (
                borderCountries.map((border) => (
                  <Link
                    key={border.cca3}
                    href={`/country/${encodeURIComponent(border.name.common.toLowerCase())}`}
                    className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-5 py-2.5 text-sm font-semibold transition-all hover:bg-white/10"
                  >
                    {border.name.common}
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  </Link>
                ))
              ) : (
                <p className="text-sm text-zinc-500">This country has no land borders.</p>
              )}
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <CountryComparison 
              countryName={country.name.common}
              countryPopulation={country.population}
              regionName={country.region}
              regionAverage={regionAverage}
            />

            <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 shadow-sm">
              <div className="border-b border-white/5 bg-white/5 px-8 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  Interactive Map
                </h2>
              </div>
              <div className="relative aspect-square w-full sm:h-[400px]">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${country.latlng[0]},${country.latlng[1]}&z=4&output=embed`}
                  className="grayscale-[0.2] invert hue-rotate-180"
                ></iframe>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-8 py-4">
                <span className="text-xs font-mono text-zinc-500">
                  {country.latlng[0].toFixed(4)}, {country.latlng[1].toFixed(4)}
                </span>
                <a
                  href={country.maps.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:underline"
                >
                  Google Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}