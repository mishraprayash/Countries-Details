export interface CachedCountry {
  cca3: string;
  name: { common: string; official: string };
  flags: { svg: string; png?: string };
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  area: number;
  borders?: string[];
  latlng?: [number, number];
}

let countriesCache: CachedCountry[] | null = null;
let fetchPromise: Promise<CachedCountry[]> | null = null;

export function getClientCountries(): Promise<CachedCountry[]> {
  if (countriesCache) {
    return Promise.resolve(countriesCache);
  }
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = fetch(
    "https://restcountries.com/v3.1/all?fields=name,cca3,flags,capital,region,subregion,population,area,borders,latlng"
  )
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch countries for client cache");
      return res.json();
    })
    .then((data: CachedCountry[]) => {
      countriesCache = data;
      fetchPromise = null; // Clear promise once resolved
      return data;
    })
    .catch((err) => {
      fetchPromise = null; // Reset promise on error so we can try again
      throw err;
    });

  return fetchPromise;
}
