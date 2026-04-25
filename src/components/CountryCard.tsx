import Link from "next/link";
import Image from "next/image";
import { Country } from "@/types/country";
import { Users, MapPin, Building2 } from "lucide-react";

interface CountryCardProps {
  country: Country;
}

export default function CountryCard({ country }: CountryCardProps) {
  return (
    <Link
      href={`/country/${encodeURIComponent(country.name.common.toLowerCase())}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-100 transition-all duration-500 hover:-trannavy-y-1.5 hover:shadow-2xl dark:bg-navy-900 dark:ring-navy-800"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={country.flags.svg}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex flex-col p-5.5">
        <h3 className="mb-4 text-lg font-black tracking-tight text-navy-900 transition-colors group-hover:text-blue-600 dark:text-navy-50 dark:group-hover:text-blue-400">
          {country.name.common}
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-navy-500 dark:text-navy-400">
            <Users className="h-3.5 w-3.5 text-navy-400" />
            <span className="font-bold text-navy-900 dark:text-navy-200">{country.population.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-navy-500 dark:text-navy-400">
            <MapPin className="h-3.5 w-3.5 text-navy-400" />
            <span className="font-bold text-navy-900 dark:text-navy-200">{country.region}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-navy-500 dark:text-navy-400">
            <Building2 className="h-3.5 w-3.5 text-navy-400" />
            <span className="font-bold text-navy-900 dark:text-navy-200 truncate">{country.capital?.[0] || "N/A"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
