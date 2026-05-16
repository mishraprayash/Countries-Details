"use client";

import { useState, useEffect, useCallback } from "react";
import { CountryStatus, UserCountryEntry, TravelStats } from "@/types/user";

const STORAGE_KEY = "world_insights_travel_map";
const EVENT_NAME = "travel-map-updated";

interface ContinentMapping {
  [cca3: string]: string;
}

let continentCache: ContinentMapping | null = null;

async function fetchContinents(): Promise<ContinentMapping> {
  if (continentCache) return continentCache;
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=cca3,continents");
    const data = await res.json();
    const mapping: ContinentMapping = {};
    for (const c of data) {
      mapping[c.cca3] = c.continents?.[0] || "Unknown";
    }
    continentCache = mapping;
    return mapping;
  } catch {
    return {};
  }
}

function createTravelStats(data: Record<string, UserCountryEntry>, continents: ContinentMapping): TravelStats {
  const visited = new Set<string>();
  const wantToVisit = new Set<string>();
  const livedIn = new Set<string>();
  const visitedContinents = new Set<string>();
  const continentCount: Record<string, { visited: number; total: number }> = {};

  for (const [cca3, entry] of Object.entries(data)) {
    const cont = continents[cca3] || "Unknown";
    if (!continentCount[cont]) continentCount[cont] = { visited: 0, total: 0 };

    if (entry.status === "visited") {
      visited.add(cca3);
      visitedContinents.add(cont);
      continentCount[cont].visited += 1;
    } else if (entry.status === "want-to-visit") {
      wantToVisit.add(cca3);
    } else if (entry.status === "lived-in") {
      livedIn.add(cca3);
      visitedContinents.add(cont);
      continentCount[cont].visited += 1;
    }
  }

  const totalCountries = Object.keys(continents).length || 195;
  const visitedPercentage = totalCountries > 0 ? Math.round((visited.size / totalCountries) * 100) : 0;

  return {
    visitedCount: visited.size,
    wantToVisitCount: wantToVisit.size,
    livedInCount: livedIn.size,
    totalTracked: Object.keys(data).length,
    visitedPercentage,
    continentsVisited: visitedContinents.size,
    continentBreakdown: continentCount,
  };
}

export function useTravelMap() {
  const [data, setData] = useState<Record<string, UserCountryEntry>>({});
  const [mounted, setMounted] = useState(false);
  const [continents, setContinents] = useState<ContinentMapping>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          setData(parsed);
        }
      }
    } catch {}
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    fetchContinents().then(setContinents);
  }, []);

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            setData(parsed);
          }
        }
      } catch {}
    };
    window.addEventListener(EVENT_NAME, handleSync);
    return () => window.removeEventListener(EVENT_NAME, handleSync);
  }, []);

  const persist = useCallback((newData: Record<string, UserCountryEntry>) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  const setStatus = useCallback((cca3: string, status: CountryStatus) => {
    const now = Date.now();
    const existing = data[cca3];
    if (existing?.status === status) {
      const updated = { ...data };
      delete updated[cca3];
      persist(updated);
      return;
    }
    persist({
      ...data,
      [cca3]: { status, addedAt: existing?.addedAt ?? now, updatedAt: now },
    });
  }, [data, persist]);

  const removeCountry = useCallback((cca3: string) => {
    const updated = { ...data };
    delete updated[cca3];
    persist(updated);
  }, [data, persist]);

  const getStatus = useCallback((cca3: string): CountryStatus | null => {
    return data[cca3]?.status ?? null;
  }, [data]);

  const clearAll = useCallback(() => {
    persist({});
  }, [persist]);

  const getStats = useCallback((): TravelStats => {
    return createTravelStats(data, continents);
  }, [data, continents]);

  return {
    data,
    mounted,
    setStatus,
    removeCountry,
    getStatus,
    clearAll,
    getStats,
  };
}
