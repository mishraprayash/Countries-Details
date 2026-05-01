const WB_BASE = "https://api.worldbank.org/v2";

const INDICATORS = {
  GDP_PER_CAPITA: "NY.GDP.PCAP.CD",
  GDP: "NY.GDP.MKTP.CD",
  LITERACY_ADULT: "SE.ADT.LITR.ZS",
  LITERACY_YOUTH: "SE.ADT.1524.LT.ZS",
  LIFE_EXPECTANCY: "SP.DYN.LE00.IN",
};

export interface ExtendedStats {
  gdpPerCapita: number | null;
  gdp: number | null;
  literacyAdult: number | null;
  literacyYouth: number | null;
  lifeExpectancy: number | null;
}

export async function getExtendedStats(iso3Code: string): Promise<ExtendedStats> {
  try {
    const indicatorPromises = Object.values(INDICATORS).map(async (indicator) => {
      try {
        const res = await fetch(
          `${WB_BASE}/country/${iso3Code}/indicator/${indicator}?format=json&date=2023&per_page=1`,
          { next: { revalidate: 86400 } }
        );
        const data = await res.json();
        const value = data[1]?.[0]?.value ?? null;
        return { indicator, value };
      } catch {
        return { indicator, value: null };
      }
    });

    const results = await Promise.all(indicatorPromises);
    const statsMap = Object.fromEntries(results.map((r) => [r.indicator, r.value]));

    return {
      gdpPerCapita: statsMap[INDICATORS.GDP_PER_CAPITA],
      gdp: statsMap[INDICATORS.GDP],
      literacyAdult: statsMap[INDICATORS.LITERACY_ADULT],
      literacyYouth: statsMap[INDICATORS.LITERACY_YOUTH],
      lifeExpectancy: statsMap[INDICATORS.LIFE_EXPECTANCY],
    };
  } catch {
    return {
      gdpPerCapita: null,
      gdp: null,
      literacyAdult: null,
      literacyYouth: null,
      lifeExpectancy: null,
    };
  }
}