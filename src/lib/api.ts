import { Country } from "@/types/country";
import countriesData from "@/data/countriesV3.1.json";

export async function getAllCountries(): Promise<Country[]> {
  return countriesData as unknown as Country[];
}

export async function getCountryByName(name: string): Promise<Country> {
  const decodedName = decodeURIComponent(name).toLowerCase();
  const found = countriesData.find(
    (c) => c.name.common.toLowerCase() === decodedName || c.name.official.toLowerCase() === decodedName
  );
  
  if (!found) {
    throw new Error(`Failed to fetch country: ${name}`);
  }
  
  return found as unknown as Country;
}

export async function getCountriesByCodes(codes: string[]): Promise<Country[]> {
  const codesUpper = codes.map(c => c.toUpperCase());
  const matches = countriesData.filter((c) => codesUpper.includes(c.cca3));
  return matches as unknown as Country[];
}

export async function getCountriesByRegion(region: string): Promise<Country[]> {
  const regionLower = region.toLowerCase();
  const matches = countriesData.filter((c) => c.region.toLowerCase() === regionLower);
  return matches as unknown as Country[];
}