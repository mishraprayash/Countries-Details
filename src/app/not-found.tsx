"use client";

import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto text-center p-8 rounded-3xl bg-white/[0.02] border border-white/10 glass-card">
        <div className="mx-auto w-16 h-16 bg-cyan-glow/10 rounded-full flex items-center justify-center mb-6">
          <Compass className="h-8 w-8 text-cyan-glow" />
        </div>
        
        <h2 className="text-4xl font-black font-instrument-serif mb-2">404</h2>
        <h3 className="text-xl font-bold font-sora mb-3">Lost off the map</h3>
        <p className="text-muted text-sm mb-8 font-sora">
          The page you are looking for doesn&apos;t exist or has been moved to another coordinate.
        </p>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-cyan-glow text-atlas-950 rounded-xl text-sm font-bold hover:bg-cyan-glow/90 transition-colors font-sora"
        >
          <Home className="h-4 w-4" /> Return to Base
        </Link>
      </div>
    </main>
  );
}