"use client";

import { useEffect, useRef } from "react";

interface TrackViewProps {
  cca3: string;
  name: string;
  flag: string;
}

export default function TrackView({ cca3, name, flag }: TrackViewProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    try {
      const stored = localStorage.getItem("world_insights_recently_viewed");
      let viewed: Array<{ cca3: string; name: string; flag: string; viewedAt: number }> = stored ? JSON.parse(stored) : [];

      viewed = viewed.filter((v) => v.cca3 !== cca3);
      viewed.unshift({ cca3, name, flag, viewedAt: Date.now() });
      viewed = viewed.slice(0, 10);

      localStorage.setItem("world_insights_recently_viewed", JSON.stringify(viewed));
    } catch {}
  }, [cca3, name, flag]);

  return null;
}
