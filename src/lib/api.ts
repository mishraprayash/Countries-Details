import { Country } from "@/types/country";

const BASE_URL = "https://restcountries.com/v3.1";

export async function getAllCountries(): Promise<Country[]> {
  const response = await fetch(`${BASE_URL}/all?fields=name,capital,region,population,flags,cca3,area,independent,landlocked,currencies`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }
  return response.json();
}

export async function getCountryByName(name: string): Promise<Country> {
  const response = await fetch(`${BASE_URL}/name/${name}?fullText=true`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch country: ${name}`);
  }
  const data = await response.json();
  return data[0];
}

export async function getCountriesByCodes(codes: string[]): Promise<Country[]> {
  const response = await fetch(`${BASE_URL}/alpha?codes=${codes.join(",")}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  if (!response.ok) {
    throw new Error("Failed to fetch countries by codes");
  }
  return response.json();
}

export async function getCountriesByRegion(region: string): Promise<Country[]> {
  const response = await fetch(`${BASE_URL}/region/${region}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch countries for region: ${region}`);
  }
  return response.json();
}
