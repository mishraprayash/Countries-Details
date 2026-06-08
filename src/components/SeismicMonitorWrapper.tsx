"use client";

import dynamic from "next/dynamic";

const SeismicMonitor = dynamic(() => import("./SeismicMonitor"), {
  ssr: false,
  loading: () => (
    <div className="h-48 flex items-center justify-center bg-atlas-900 text-muted font-sora text-sm rounded-2xl border border-white/5">
      Analyzing recent seismic data…
    </div>
  ),
});

interface SeismicMonitorWrapperProps {
  lat: number;
  lng: number;
  countryName: string;
}

export default function SeismicMonitorWrapper(props: SeismicMonitorWrapperProps) {
  return <SeismicMonitor {...props} />;
}
