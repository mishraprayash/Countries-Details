import { NextResponse } from "next/server";
import countriesData from "@/data/countriesV3.1.json";

export async function GET() {
  // Map only the fields needed by the clientCache to minimize payload size
  const minimalData = countriesData.map((c) => ({
    name: c.name,
    cca3: c.cca3,
    flags: c.flags,
    capital: c.capital,
    region: c.region,
    subregion: c.subregion,
    population: c.population,
    area: c.area,
    borders: c.borders,
    latlng: c.latlng
  }));
  
  return NextResponse.json(minimalData);
}