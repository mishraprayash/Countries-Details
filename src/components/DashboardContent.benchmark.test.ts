import { describe, it, expect } from "vitest";

export interface Country {
  cca3: string;
  name: { common: string; official: string };
  population: number;
  area: number;
  region: string;
  independent?: boolean;
  landlocked: boolean;
  currencies?: Record<string, { name: string; symbol: string }>;
  flags: { svg: string };
}

export function oldCalculateStats(countries: Country[]) {
  const totalCountries = countries.length;
  const totalPopulation = countries.reduce((acc, c) => acc + c.population, 0);
  const totalArea = countries.reduce((acc, c) => acc + (c.area || 0), 0);
  const independentCount = countries.filter(c => c.independent === true).length;
  return { totalCountries, totalPopulation, totalArea, independentCount };
}

export function newCalculateStats(countries: Country[]) {
  const totalCountries = countries.length;
  let totalPopulation = 0;
  let totalArea = 0;
  let independentCount = 0;

  for (let i = 0; i < totalCountries; i++) {
    const c = countries[i];
    totalPopulation += c.population || 0;
    totalArea += c.area || 0;
    if (c.independent === true) {
      independentCount++;
    }
  }

  return { totalCountries, totalPopulation, totalArea, independentCount };
}

describe("DashboardStats Calculation", () => {
  const mockCountries: Country[] = Array.from({ length: 50000 }, (_, i) => ({
    cca3: `C${i}`,
    name: { common: `Country ${i}`, official: `Official Country ${i}` },
    population: (i * 1000) % 100000000,
    area: (i * 500) % 10000000,
    region: i % 2 === 0 ? "Europe" : "Asia",
    independent: i % 3 === 0,
    landlocked: i % 4 === 0,
    flags: { svg: "flag.svg" },
  }));

  it("produces identical results for old and new implementations", () => {
    const oldRes = oldCalculateStats(mockCountries);
    const newRes = newCalculateStats(mockCountries);
    expect(newRes).toEqual(oldRes);
  });

  it("benchmarks performance difference", () => {
    const iterations = 500;

    const startOld = performance.now();
    for (let i = 0; i < iterations; i++) {
      oldCalculateStats(mockCountries);
    }
    const endOld = performance.now();
    const durationOld = endOld - startOld;

    const startNew = performance.now();
    for (let i = 0; i < iterations; i++) {
      newCalculateStats(mockCountries);
    }
    const endNew = performance.now();
    const durationNew = endNew - startNew;

    console.log(`Baseline (Old implementation): ${durationOld.toFixed(2)} ms`);
    console.log(`Optimized (New implementation): ${durationNew.toFixed(2)} ms`);
    console.log(`Speedup: ${((durationOld - durationNew) / durationOld * 100).toFixed(2)}% faster`);

    // Ensure both returned correct structure and values
    expect(newCalculateStats(mockCountries)).toEqual(oldCalculateStats(mockCountries));
  });
});
