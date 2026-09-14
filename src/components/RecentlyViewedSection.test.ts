import { describe, test, expect } from "vitest";

interface Country {
  cca3: string;
  name: { common: string };
  flags: { svg: string };
  region: string;
  population: number;
}

// Current approach (O(M * N) array lookup)
export function getOrderedCountriesUnoptimized(
  recentlyViewed: { cca3: string }[],
  data: Country[]
): Country[] {
  return recentlyViewed
    .map((v) => data.find((c) => c.cca3 === v.cca3))
    .filter(Boolean) as Country[];
}

// Optimized approach (O(N + M) Map lookup)
export function getOrderedCountriesOptimized(
  recentlyViewed: { cca3: string }[],
  data: Country[]
): Country[] {
  const countryMap = new Map<string, Country>(data.map((c) => [c.cca3, c]));
  return recentlyViewed
    .map((v) => countryMap.get(v.cca3))
    .filter(Boolean) as Country[];
}

describe("RecentlyViewedSection ordering logic", () => {
  const sampleCountries: Country[] = [
    { cca3: "USA", name: { common: "United States" }, flags: { svg: "" }, region: "Americas", population: 330000000 },
    { cca3: "CAN", name: { common: "Canada" }, flags: { svg: "" }, region: "Americas", population: 38000000 },
    { cca3: "FRA", name: { common: "France" }, flags: { svg: "" }, region: "Europe", population: 67000000 },
    { cca3: "JPN", name: { common: "Japan" }, flags: { svg: "" }, region: "Asia", population: 125000000 },
  ];

  test("produces identical output for valid recentlyViewed entries", () => {
    const recentlyViewed = [{ cca3: "JPN" }, { cca3: "USA" }, { cca3: "CAN" }];
    const unoptimized = getOrderedCountriesUnoptimized(recentlyViewed, sampleCountries);
    const optimized = getOrderedCountriesOptimized(recentlyViewed, sampleCountries);

    expect(optimized).toEqual(unoptimized);
    expect(optimized.map((c) => c.cca3)).toEqual(["JPN", "USA", "CAN"]);
  });

  test("handles missing entries cleanly", () => {
    const recentlyViewed = [{ cca3: "JPN" }, { cca3: "UNKNOWN" }, { cca3: "FRA" }];
    const unoptimized = getOrderedCountriesUnoptimized(recentlyViewed, sampleCountries);
    const optimized = getOrderedCountriesOptimized(recentlyViewed, sampleCountries);

    expect(optimized).toEqual(unoptimized);
    expect(optimized.map((c) => c.cca3)).toEqual(["JPN", "FRA"]);
  });

  test("benchmark: measure performance difference over large datasets", () => {
    // Generate 250 countries (typical REST countries dataset size)
    const mockCountries: Country[] = Array.from({ length: 250 }, (_, i) => ({
      cca3: `C${i.toString().padStart(3, "0")}`,
      name: { common: `Country ${i}` },
      flags: { svg: "" },
      region: "World",
      population: 100000,
    }));

    // Mock 50 recently viewed items repeated over iterations
    const mockRecentlyViewed = Array.from({ length: 50 }, (_, i) => ({
      cca3: `C${(i * 3) % 250}`.padStart(4, "0").replace(/^0/, "C"),
    }));

    const iterations = 5000;

    const startUnoptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
      getOrderedCountriesUnoptimized(mockRecentlyViewed, mockCountries);
    }
    const endUnoptimized = performance.now();
    const durationUnoptimized = endUnoptimized - startUnoptimized;

    const startOptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
      getOrderedCountriesOptimized(mockRecentlyViewed, mockCountries);
    }
    const endOptimized = performance.now();
    const durationOptimized = endOptimized - startOptimized;

    console.log(`Unoptimized total duration (${iterations} iterations): ${durationUnoptimized.toFixed(2)} ms`);
    console.log(`Optimized total duration (${iterations} iterations): ${durationOptimized.toFixed(2)} ms`);
    console.log(`Speedup factor: ${(durationUnoptimized / durationOptimized).toFixed(2)}x faster`);

    expect(durationOptimized).toBeLessThan(durationUnoptimized);
  });
});
