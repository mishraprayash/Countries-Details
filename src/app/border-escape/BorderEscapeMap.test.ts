import { describe, it, expect } from "vitest";

interface Country {
  cca3: string;
  name: { common: string; official: string };
  flags: { svg: string };
  borders?: string[];
  region: string;
  latlng?: [number, number];
}

// Baseline logic extracted from SingleMap
function processCountriesBaseline(countries: Country[]) {
  const uniqueCca3s = Array.from(new Set(countries.map((c) => c.cca3)));
  const uniqueCountries = uniqueCca3s
    .map((code) => countries.find((c) => c.cca3 === code))
    .filter((c): c is Country => !!c && !!c.latlng);

  const results = uniqueCountries.map((c) => {
    const indices = countries
      .map((x, i) => (x.cca3 === c.cca3 ? i : -1))
      .filter((i) => i !== -1);
    return { cca3: c.cca3, indices };
  });

  return { uniqueCountries, results };
}

// Optimized O(N) pre-indexed logic
export function processCountriesOptimized(countries: Country[]) {
  const countryMap = new Map<string, Country>();
  const indicesMap = new Map<string, number[]>();

  for (let i = 0; i < countries.length; i++) {
    const c = countries[i];
    if (!c) continue;
    if (c.latlng && !countryMap.has(c.cca3)) {
      countryMap.set(c.cca3, c);
    }
    let idxList = indicesMap.get(c.cca3);
    if (!idxList) {
      idxList = [];
      indicesMap.set(c.cca3, idxList);
    }
    idxList.push(i);
  }

  const uniqueCountries = Array.from(countryMap.values());
  const results = uniqueCountries.map((c) => ({
    cca3: c.cca3,
    indices: indicesMap.get(c.cca3) || [],
  }));

  return { uniqueCountries, results };
}

describe("BorderEscapeMap processing logic benchmark & correctness", () => {
  const mockCountries: Country[] = [];
  const numUnique = 100;
  const numTotal = 5000;

  for (let i = 0; i < numTotal; i++) {
    const code = `C${i % numUnique}`;
    mockCountries.push({
      cca3: code,
      name: { common: `Country ${code}`, official: `Official ${code}` },
      flags: { svg: `http://example.com/${code}.svg` },
      region: "Test",
      latlng: i % 10 === 0 ? undefined : [10 + (i % 50), 20 + (i % 50)],
    });
  }

  it("produces identical output between baseline and optimized", () => {
    const baseline = processCountriesBaseline(mockCountries);
    const optimized = processCountriesOptimized(mockCountries);

    expect(optimized.uniqueCountries).toEqual(baseline.uniqueCountries);
    expect(optimized.results).toEqual(baseline.results);
  });

  it("benchmarks performance improvement of pre-indexing", () => {
    const iterations = 50;

    const startBaseline = performance.now();
    for (let i = 0; i < iterations; i++) {
      processCountriesBaseline(mockCountries);
    }
    const durationBaseline = performance.now() - startBaseline;

    const startOptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
      processCountriesOptimized(mockCountries);
    }
    const durationOptimized = performance.now() - startOptimized;

    console.log(`Baseline duration: ${durationBaseline.toFixed(2)}ms`);
    console.log(`Optimized duration: ${durationOptimized.toFixed(2)}ms`);
    const speedup = (durationBaseline / Math.max(0.001, durationOptimized)).toFixed(2);
    console.log(`Speedup factor: ${speedup}x`);

    expect(durationOptimized).toBeLessThan(durationBaseline);
  });
});
