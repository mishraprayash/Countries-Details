"use client";

import { useState, useEffect, useCallback } from "react";

interface RecentlyViewed {
  cca3: string;
  name: string;
  flag: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("world_insights_recently_viewed");
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch {}
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const addViewed = useCallback((country: { cca3: string; name: string; flag: string }) => {
    try {
      const stored = localStorage.getItem("world_insights_recently_viewed");
      let viewed: RecentlyViewed[] = stored ? JSON.parse(stored) : [];
      
      viewed = viewed.filter((v) => v.cca3 !== country.cca3);
      viewed.unshift({ ...country, viewedAt: Date.now() });
      viewed = viewed.slice(0, 10);
      
      localStorage.setItem("world_insights_recently_viewed", JSON.stringify(viewed));
      setRecentlyViewed(viewed);
    } catch {}
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem("world_insights_recently_viewed");
    setRecentlyViewed([]);
  }, []);

  return { recentlyViewed, addViewed, clearRecentlyViewed, mounted };
}
