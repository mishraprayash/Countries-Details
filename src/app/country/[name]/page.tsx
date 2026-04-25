import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Globe, Info, Landmark, Languages, Zap, Compass, MapPin,
  CheckCircle2, XCircle, Shield, ChevronRight, ExternalLink
} from "lucide-react";
import { getCountryByName, getCountriesByCodes, getCountriesByRegion } from "@/lib/api";
import CountryComparison from "@/components/CountryComparison";
import { ThemeToggle } from "@/components/ThemeToggle";

import { Metadata } from "next";

interface CountryPageProps {
  params: Promise<{ name: string }>;
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

  // Reusable UI components with consistent spacing
  const DetailSection = ({ title, icon: Icon, children, delay }: { title: string, icon: any, children: React.ReactNode, delay: string }) => (
    <div className={`group rounded-2xl border border-navy-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-navy-900/50 animate-in fade-in slide-in-from-bottom-4 duration-500 ${delay}`}>
      <div className="flex items-center gap-2.5 border-b border-navy-100 bg-navy-50/50 px-5 py-3.5 dark:border-white/10 dark:bg-white/5">
        <Icon className="h-4.5 w-4.5 text-navy-400 transition-colors group-hover:text-navy-600 dark:group-hover:text-navy-300" />
        <h3 className="text-sm font-semibold tracking-tight text-navy-900 dark:text-navy-50">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );

  const DataRow = ({ label, value, subValue }: { label: string, value: string | React.ReactNode, subValue?: string }) => (
    <div className="flex items-center justify-between border-b border-navy-100 py-3 last:border-0 dark:border-white/5">
      <span className="text-sm font-medium text-navy-500 dark:text-navy-400">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold text-navy-900 dark:text-navy-50">{value}</span>
        {subValue && <p className="text-[10px] uppercase tracking-wider text-navy-400">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <main className="flex-1 bg-navy-50/30 pb-24 dark:bg-navy-950/30">
      <header className="sticky top-0 z-50 border-b border-navy-200 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-navy-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-navy-900 hover:opacity-80 dark:text-navy-50">
            <Globe className="h-5.5 w-5.5" />
            <span className="text-lg font-bold tracking-tight">World Insights</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 dark:text-navy-400 dark:hover:bg-white/5 dark:hover:text-navy-50"
            >
              Dashboard
            </Link>
            <Link
              href="/countries"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 dark:text-navy-400 dark:hover:bg-white/5 dark:hover:text-navy-50"
            >
              Countries
            </Link>
            <div className="ml-2 border-l border-navy-200 pl-4 dark:border-white/10">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4.5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-800 active:scale-[0.98] dark:bg-white dark:text-navy-900 dark:hover:bg-navy-200"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-trannavy-x-0.5" />
            Back
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar / Flag / Badges */}
          <div className="space-y-6 lg:col-span-1">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-xl ring-1 ring-navy-200 dark:ring-white/10">
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
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ${country.unMember ? "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20" : "bg-navy-50 text-navy-400 ring-navy-100 dark:bg-white/5 dark:text-navy-500 dark:ring-white/10"}`}>
                {country.unMember ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                UN Member
              </div>
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ${country.independent ? "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20" : "bg-navy-50 text-navy-400 ring-navy-100 dark:bg-white/5 dark:text-navy-500 dark:ring-white/10"}`}>
                {country.independent ? <Shield className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Independent
              </div>
            </div>

            {/* Coat of Arms */}
            {country.coatOfArms?.svg && (
              <div className="rounded-2xl border border-navy-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-navy-900/50">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-navy-400">Coat of Arms</p>
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
              <h1 className="text-4xl font-black tracking-tight text-navy-900 dark:text-navy-50 sm:text-6xl">
                {country.name.common}
              </h1>
              <p className="mt-2 text-lg font-medium text-navy-500 dark:text-navy-400">
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
          <div className="rounded-3xl border border-navy-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-navy-900/50">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-navy-900 dark:text-navy-50">
              Neighboring Countries
            </h2>
            <div className="flex flex-wrap gap-3">
              {borderCountries.length > 0 ? (
                borderCountries.map((border) => (
                  <Link
                    key={border.cca3}
                    href={`/country/${encodeURIComponent(border.name.common.toLowerCase())}`}
                    className="flex items-center gap-2 rounded-xl border border-navy-100 bg-navy-50/50 px-5 py-2.5 text-sm font-semibold transition-all hover:border-navy-300 hover:bg-navy-100 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10"
                  >
                    {border.name.common}
                    <ChevronRight className="h-4 w-4 text-navy-300" />
                  </Link>
                ))
              ) : (
                <p className="text-sm text-navy-500">This country has no land borders.</p>
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

            <div className="overflow-hidden rounded-3xl border border-navy-200 bg-white shadow-sm dark:border-white/10 dark:bg-navy-900/50">
              <div className="border-b border-navy-200 bg-navy-50/50 px-8 py-4 dark:border-white/10 dark:bg-white/5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900 dark:text-navy-50">
                  <MapPin className="h-4 w-4 text-navy-400" />
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
                  className="grayscale-[0.2] dark:invert dark:hue-rotate-180"
                ></iframe>
              </div>
              <div className="flex items-center justify-between bg-navy-50/50 px-8 py-4 dark:bg-white/5">
                <span className="text-xs font-mono text-navy-400">
                  {country.latlng[0].toFixed(4)}, {country.latlng[1].toFixed(4)}
                </span>
                <a
                  href={country.maps.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
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