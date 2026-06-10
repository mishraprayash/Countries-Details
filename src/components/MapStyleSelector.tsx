"use client";

import { MAP_STYLES } from "@/constants/ui";
import { Layers } from "lucide-react";
import { useState } from "react";

interface MapStyleSelectorProps {
  currentStyleId: string;
  onStyleChange: (id: string) => void;
}

export function MapStyleSelector({ currentStyleId, onStyleChange }: MapStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-[1000] font-sora pointer-events-auto">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-atlas-900/90 hover:bg-atlas-900 border border-white/10 dark:border-white/10 shadow-2xl backdrop-blur-md transition-all text-text-primary hover:scale-105"
          title="Change Map Format"
        >
          <Layers className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-atlas-900/95 backdrop-blur-md p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="px-2.5 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Map Style
            </span>
            <div className="border-b border-white/5 my-1" />
            <div className="space-y-0.5">
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    onStyleChange(style.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentStyleId === style.id
                      ? "bg-cyan-glow/10 text-cyan-glow border-l-2 border-cyan-glow pl-2"
                      : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                  }`}
                >
                  <span>{style.name}</span>
                  {currentStyleId === style.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
