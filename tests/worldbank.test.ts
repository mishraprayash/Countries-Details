import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getExtendedStats } from "../src/lib/worldbank";

describe("getExtendedStats", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch all indicator stats correctly for a valid country", async () => {
    const mockResponses: Record<string, number> = {
      "NY.GDP.PCAP.CD": 82586.78,
      "NY.GDP.MKTP.CD": 27360000000000,
      "SE.ADT.LITR.ZS": 99.0,
      "SE.ADT.1524.LT.ZS": 99.5,
      "SP.DYN.LE00.IN": 77.5,
    };

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      const match = Object.keys(mockResponses).find((ind) => url.includes(ind));
      if (match) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { page: 1 },
            [{ indicator: { id: match }, value: mockResponses[match] }],
          ],
        });
      }
      return Promise.resolve({
        ok: false,
        json: async () => [],
      });
    }) as unknown as typeof fetch;

    const stats = await getExtendedStats("USA");

    expect(stats).toEqual({
      gdpPerCapita: 82586.78,
      gdp: 27360000000000,
      literacyAdult: 99.0,
      literacyYouth: 99.5,
      lifeExpectancy: 77.5,
    });
  });

  it("should handle partial failures gracefully", async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("NY.GDP.PCAP.CD")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{}, [{ value: 50000 }]],
        });
      }
      return Promise.reject(new Error("Network error"));
    }) as unknown as typeof fetch;

    const stats = await getExtendedStats("USA");

    expect(stats).toEqual({
      gdpPerCapita: 50000,
      gdp: null,
      literacyAdult: null,
      literacyYouth: null,
      lifeExpectancy: null,
    });
  });

  it("should handle complete failure gracefully", async () => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.reject(new Error("Network error"))
    ) as unknown as typeof fetch;

    const stats = await getExtendedStats("USA");

    expect(stats).toEqual({
      gdpPerCapita: null,
      gdp: null,
      literacyAdult: null,
      literacyYouth: null,
      lifeExpectancy: null,
    });
  });

  it("benchmark allocation and execution time", async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      return Promise.resolve({
        ok: true,
        json: async () => [{}, [{ value: 123.45 }]],
      });
    }) as unknown as typeof fetch;

    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await getExtendedStats("USA");
    }
    const duration = performance.now() - start;
    console.log(`Execution time for ${iterations} iterations: ${duration.toFixed(2)}ms`);
    expect(duration).toBeGreaterThan(0);
  });
});
