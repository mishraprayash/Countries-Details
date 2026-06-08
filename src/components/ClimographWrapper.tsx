"use client";

import dynamic from "next/dynamic";

const Climograph = dynamic(() => import("./Climograph"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-atlas-900 text-muted font-sora text-sm rounded-2xl border border-white/5">
      Loading climate climograph…
    </div>
  ),
});

interface ClimographWrapperProps {
  lat: number;
  lng: number;
  capitalName: string;
}

export default function ClimographWrapper(props: ClimographWrapperProps) {
  return <Climograph {...props} />;
}
