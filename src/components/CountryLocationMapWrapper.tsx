"use client";

import dynamic from "next/dynamic";

const CountryLocationMap = dynamic(() => import("./CountryLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] flex items-center justify-center bg-atlas-900 text-muted font-sora text-sm">
      Loading interactive map…
    </div>
  ),
});

interface CountryLocationMapWrapperProps {
  lat: number;
  lng: number;
  name: string;
  flag: string;
  area: number;
}

export default function CountryLocationMapWrapper(props: CountryLocationMapWrapperProps) {
  return <CountryLocationMap {...props} />;
}
