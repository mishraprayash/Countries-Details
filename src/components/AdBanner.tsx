"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  adSlot: string;
  format?: "auto" | "fluid" | "rectangle";
  className?: string;
}

export default function AdBanner({ adSlot, format = "auto", className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const pusher = (window.adsbygoogle = window.adsbygoogle || []);
      pusher.push({});
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoaded(true);
    } catch { /* AdBlock or ad not ready */ }
  }, []);

  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";

  if (!loaded) {
    return (
      <div className={`flex items-center justify-center border border-dashed border-white/10 bg-white/[0.02] rounded-xl ${className}`}>
        <span className="text-xs text-muted">Ad</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adSenseId}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
