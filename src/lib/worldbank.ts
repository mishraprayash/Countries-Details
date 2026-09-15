const WB_BASE = "https://api.worldbank.org/v2";

const INDICATORS = {
  GDP_PER_CAPITA: "NY.GDP.PCAP.CD",
  GDP: "NY.GDP.MKTP.CD",
  LITERACY_ADULT: "SE.ADT.LITR.ZS",
  LITERACY_YOUTH: "SE.ADT.1524.LT.ZS",
  LIFE_EXPECTANCY: "SP.DYN.LE00.IN",
} as const;

export interface ExtendedStats {
  gdpPerCapita: number | null;
  gdp: number | null;
  literacyAdult: number | null;
  literacyYouth: number | null;
  lifeExpectancy: number | null;
}

async function fetchIndicatorValue(iso3Code: string, indicator: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${WB_BASE}/country/${iso3Code}/indicator/${indicator}?format=json&date=2023&per_page=1`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    return data[1]?.[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function getExtendedStats(iso3Code: string): Promise<ExtendedStats> {
  try {
    const [gdpPerCapita, gdp, literacyAdult, literacyYouth, lifeExpectancy] = await Promise.all([
      fetchIndicatorValue(iso3Code, INDICATORS.GDP_PER_CAPITA),
      fetchIndicatorValue(iso3Code, INDICATORS.GDP),
      fetchIndicatorValue(iso3Code, INDICATORS.LITERACY_ADULT),
      fetchIndicatorValue(iso3Code, INDICATORS.LITERACY_YOUTH),
      fetchIndicatorValue(iso3Code, INDICATORS.LIFE_EXPECTANCY),
    ]);

    return {
      gdpPerCapita,
      gdp,
      literacyAdult,
      literacyYouth,
      lifeExpectancy,
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
