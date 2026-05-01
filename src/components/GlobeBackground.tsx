"use client";

import { useEffect, useState } from "react";

export default function GlobeBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-glow/5 blur-[120px] glow-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-glow/5 blur-[100px] glow-pulse" style={{ animationDelay: "3s" }} />

      {/* Animated SVG globe */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20 slow-rotate"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="100" cy="100" r="95" stroke="rgba(0, 212, 255, 0.15)" strokeWidth="0.5" />

        {/* Latitude lines */}
        <ellipse cx="100" cy="100" rx="95" ry="32" stroke="rgba(0, 212, 255, 0.08)" strokeWidth="0.3" strokeDasharray="2 3" />
        <ellipse cx="100" cy="100" rx="95" ry="60" stroke="rgba(0, 212, 255, 0.06)" strokeWidth="0.3" strokeDasharray="2 3" />
        <ellipse cx="100" cy="100" rx="95" ry="85" stroke="rgba(0, 212, 255, 0.04)" strokeWidth="0.3" strokeDasharray="2 3" />

        {/* Longitude lines */}
        <ellipse cx="100" cy="100" rx="32" ry="95" stroke="rgba(0, 212, 255, 0.08)" strokeWidth="0.3" strokeDasharray="2 3" />
        <ellipse cx="100" cy="100" rx="60" ry="95" stroke="rgba(0, 212, 255, 0.06)" strokeWidth="0.3" strokeDasharray="2 3" />
        <ellipse cx="100" cy="100" rx="85" ry="95" stroke="rgba(0, 212, 255, 0.04)" strokeWidth="0.3" strokeDasharray="2 3" />

        {/* Center meridian */}
        <line x1="100" y1="5" x2="100" y2="195" stroke="rgba(0, 212, 255, 0.1)" strokeWidth="0.5" strokeDasharray="3 4" />

        {/* Equator */}
        <line x1="5" y1="100" x2="195" y2="100" stroke="rgba(0, 212, 255, 0.1)" strokeWidth="0.5" strokeDasharray="3 4" />

        {/* Dotted path accents */}
        {[
          "M 20,60 Q 50,30 80,50 T 120,40 T 160,60",
          "M 30,130 Q 60,110 90,120 T 140,110 T 170,130",
          "M 40,80 Q 70,50 100,70 T 130,60 T 170,80",
          "M 25,150 Q 55,130 85,140 T 120,130 T 160,150",
        ].map((d, i) => (
          <path key={i} d={d} stroke="rgba(0, 212, 255, 0.12)" strokeWidth="0.4" strokeDasharray="1.5 4" fill="none" />
        ))}

        {/* Continent dots */}
        {[
          { cx: 70, cy: 65 }, { cx: 75, cy: 70 }, { cx: 65, cy: 72 },
          { cx: 80, cy: 55 }, { cx: 85, cy: 60 }, { cx: 78, cy: 68 },
          { cx: 120, cy: 70 }, { cx: 125, cy: 65 }, { cx: 130, cy: 75 },
          { cx: 135, cy: 80 }, { cx: 140, cy: 72 }, { cx: 128, cy: 82 },
          { cx: 55, cy: 90 }, { cx: 60, cy: 95 }, { cx: 50, cy: 100 },
          { cx: 58, cy: 105 }, { cx: 62, cy: 110 },
          { cx: 145, cy: 120 }, { cx: 150, cy: 115 }, { cx: 155, cy: 125 },
          { cx: 148, cy: 130 }, { cx: 142, cy: 135 },
          { cx: 90, cy: 140 }, { cx: 95, cy: 135 }, { cx: 100, cy: 145 },
          { cx: 88, cy: 148 }, { cx: 105, cy: 150 },
        ].map((pos, i) => (
          <circle
            key={`dot-${i}`}
            cx={pos.cx}
            cy={pos.cy}
            r="0.8"
            fill="rgba(0, 212, 255, 0.3)"
          >
            <animate
              attributeName="opacity"
              values="0.1;0.5;0.1"
              dur={`${3 + (i % 4)}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (i * 137.5) % 100;
        const y = (i * 97.3) % 100;
        const size = 1 + (i % 3);
        return (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-cyan-glow/20"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `glowPulse ${4 + (i % 3) * 2}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
