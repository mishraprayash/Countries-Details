"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Map as MapIcon, ArrowLeft, RefreshCw, Trophy,
  ChevronRight, Compass, ShieldAlert, Footprints, Play
} from "lucide-react";
import { getClientCountries } from "@/lib/clientCache";
import { calculateShortestPath } from "@/utils/pathfinding";

interface Country {
  cca3: string;
  name: { common: string; official: string };
  flags: { svg: string };
  borders?: string[];
  region: string;
  latlng?: [number, number];
}

const BorderEscapeMap = dynamic(() => import("./BorderEscapeMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse flex items-center justify-center">
      <span className="text-sm text-muted">Loading Interactive Map...</span>
    </div>
  ),
});

type Difficulty = "easy" | "medium" | "hard";

export default function BorderEscapePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [gameState, setGameState] = useState<"start" | "playing" | "victory">("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [startCountry, setStartCountry] = useState<Country | null>(null);
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [path, setPath] = useState<string[]>([]); // Array of CCA3 codes visited
  const [optimalPath, setOptimalPath] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [personalBests, setPersonalBests] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });

  // Load countries using client cache
  useEffect(() => {
    let active = true;
    
    getClientCountries()
      .then((data) => {
        if (!active) return;
        // Filter out countries without code or flags
        const valid = data.filter((c) => c.cca3 && c.flags?.svg);
        setCountries(valid);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load map data. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Load high scores from localStorage
    try {
      const stored = localStorage.getItem("world_insights_border_escape_pb");
      if (stored) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setPersonalBests(JSON.parse(stored));
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {}
    
    return () => { active = false; };
  }, []);



  // Generate a valid game setup
  const generateGame = useCallback(() => {
    if (countries.length === 0) return;

    // Build map for quick access
    const countriesByCode = new Map<string, Country>();
    countries.forEach((c) => countriesByCode.set(c.cca3, c));

    // Find countries with borders
    const borderCountries = countries.filter((c) => c.borders && c.borders.length > 0);

    let found = false;
    let start: Country | null = null;
    let target: Country | null = null;
    let pathResult: string[] = [];

    // Simple limits to define difficulties (optimal step counts)
    let minSteps = 3;
    let maxSteps = 4;
    if (difficulty === "medium") {
      minSteps = 5;
      maxSteps = 6;
    } else if (difficulty === "hard") {
      minSteps = 7;
      maxSteps = 12;
    }

    // Try finding a start-target pair up to 300 times
    for (let attempts = 0; attempts < 300; attempts++) {
      const randomStart = borderCountries[Math.floor(Math.random() * borderCountries.length)];
      
      // BFS to find all reachable nodes and their path lengths
      const queue: [string, string[]][] = [[randomStart.cca3, [randomStart.cca3]]];
      const visited = new Set<string>([randomStart.cca3]);
      const reachables: { code: string; path: string[] }[] = [];

      while (queue.length > 0) {
        const [curr, currentPath] = queue.shift()!;
        if (currentPath.length >= minSteps && currentPath.length <= maxSteps) {
          reachables.push({ code: curr, path: currentPath });
        }
        
        // Stop going deeper than maxSteps + 2 for efficiency
        if (currentPath.length > maxSteps + 2) continue;

        const neighbors = countriesByCode.get(curr)?.borders || [];
        for (const n of neighbors) {
          if (!visited.has(n) && countriesByCode.has(n)) {
            visited.add(n);
            queue.push([n, [...currentPath, n]]);
          }
        }
      }

      if (reachables.length > 0) {
        const chosen = reachables[Math.floor(Math.random() * reachables.length)];
        start = randomStart;
        target = countriesByCode.get(chosen.code) || null;
        pathResult = chosen.path;
        if (start && target) {
          found = true;
          break;
        }
      }
    }

    if (found && start && target) {
      setStartCountry(start);
      setTargetCountry(target);
      setCurrentCountry(start);
      setPath([start.cca3]);
      setOptimalPath(pathResult);
      setRevealed(false);
      setGameState("playing");
    } else {
      // Fallback in case loop fails: Spain to India
      const esp = countriesByCode.get("ESP");
      const ind = countriesByCode.get("IND");
      if (esp && ind) {
        setStartCountry(esp);
        setTargetCountry(ind);
        setCurrentCountry(esp);
        setPath(["ESP"]);
        const defaultPath = calculateShortestPath("ESP", "IND", countries) || [];
        setOptimalPath(defaultPath);
        setRevealed(false);
        setGameState("playing");
      }
    }
  }, [countries, difficulty]);

  const selectBorder = (code: string) => {
    if (gameState !== "playing" || !currentCountry) return;

    const nextCountry = countries.find((c) => c.cca3 === code);
    if (!nextCountry) return;

    const newPath = [...path, code];
    setPath(newPath);
    setCurrentCountry(nextCountry);

    // Check if target is reached
    if (code === targetCountry?.cca3) {
      setGameState("victory");
      // Calculate high score (fewer steps is better)
      const currentScore = newPath.length;
      const prevBest = personalBests[difficulty];
      if (prevBest === null || currentScore < prevBest) {
        const updatedBests = { ...personalBests, [difficulty]: currentScore };
        setPersonalBests(updatedBests);
        try {
          localStorage.setItem("world_insights_border_escape_pb", JSON.stringify(updatedBests));
        } catch {}
      }
    }
  };

  const getCountryName = (code: string) => {
    return countries.find((c) => c.cca3 === code)?.name.common || code;
  };

  const getCountryFlag = (code: string) => {
    return countries.find((c) => c.cca3 === code)?.flags.svg || "";
  };

  if (loading) {
    return (
      <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-glow" />
          <p className="text-muted font-sora">Loading border escape map...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen p-8">
        <div className="max-w-md mx-auto text-center p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
          <ShieldAlert className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Failed to Start Game</h2>
          <p className="text-muted text-sm mb-4">{error}</p>
          <Link href="/" className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header navigation */}
        <div className="mb-8 border-b border-white/5 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-instrument-serif tracking-tight flex items-center gap-2">
              <Compass className="h-8 w-8 text-cyan-glow animate-pulse" />
              Border Escape
            </h1>
            <p className="text-muted text-sm font-sora mt-1">
              Pathfind from start to target by stepping through neighboring land borders.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 self-start px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-text-primary hover:bg-white/5 transition-colors font-sora"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        {/* START GAME SCREEN */}
        {gameState === "start" && (
          <div className="max-w-xl mx-auto rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-6 sm:p-10 text-center animate-in fade-in duration-300">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-glow/10 ring-1 ring-cyan-glow/20 mx-auto">
              <MapIcon className="h-10 w-10 text-cyan-glow" />
            </div>
            <h2 className="text-2xl font-bold font-sora mb-3">Geographical Pathfinding</h2>
            <p className="text-muted text-sm leading-relaxed mb-8 font-sora">
              Test your mental world map! We select two countries on the same continent/landmass. 
              Your task is to reach the Target by clicking bordering countries in the fewest moves possible.
            </p>

            <div className="mb-8">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 font-sora">
                Select Difficulty
              </label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all font-sora ${
                      difficulty === d
                        ? "bg-cyan-glow text-atlas-950"
                        : "bg-white/[0.03] text-muted hover:bg-white/[0.06] border border-white/5"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-3 font-sora">
                {difficulty === "easy" && "Optimal Route: ~3-4 moves."}
                {difficulty === "medium" && "Optimal Route: ~5-6 moves."}
                {difficulty === "hard" && "Optimal Route: ~7+ moves. For true pathfinders."}
              </p>
            </div>

            {/* High scores block */}
            {Object.values(personalBests).some((v) => v !== null) && (
              <div className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left font-sora text-sm">
                <span className="text-xs font-bold text-amber-glow uppercase tracking-wider mb-2 block">Personal Bests (Fewest Steps)</span>
                <div className="space-y-1.5 font-dm-mono">
                  {personalBests.easy !== null && <div className="flex justify-between"><span>Easy:</span><span className="text-text-primary font-bold">{personalBests.easy} steps</span></div>}
                  {personalBests.medium !== null && <div className="flex justify-between"><span>Medium:</span><span className="text-text-primary font-bold">{personalBests.medium} steps</span></div>}
                  {personalBests.hard !== null && <div className="flex justify-between"><span>Hard:</span><span className="text-text-primary font-bold">{personalBests.hard} steps</span></div>}
                </div>
              </div>
            )}

            <button
              onClick={generateGame}
              className="w-full rounded-xl bg-cyan-glow py-4 text-base font-bold text-atlas-950 transition-all hover:bg-cyan-glow/80 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-glow/20 flex items-center justify-center gap-2 font-sora"
            >
              <Play className="h-5 w-5 fill-current" /> Start Game
            </button>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {gameState === "playing" && startCountry && targetCountry && currentCountry && (
          <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in duration-300">
            {/* Mission Stats (Left panel) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 font-sora">Mission Objectives</h3>
                
                <div className="space-y-4">
                  {/* Start country */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="relative w-12 h-8 rounded overflow-hidden shadow">
                      <Image src={startCountry.flags.svg} alt={startCountry.name.common} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider block font-sora">Start Location</span>
                      <span className="text-sm font-bold text-text-primary">{startCountry.name.common}</span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex justify-center">
                    <ChevronRight className="h-6 w-6 text-cyan-glow rotate-90 lg:rotate-0" />
                  </div>

                  {/* Target country */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-glow/5 border border-cyan-glow/20">
                    <div className="relative w-12 h-8 rounded overflow-hidden shadow">
                      <Image src={targetCountry.flags.svg} alt={targetCountry.name.common} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-glow uppercase tracking-wider block font-sora">Target Destination</span>
                      <span className="text-sm font-bold text-cyan-glow">{targetCountry.name.common}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress counter */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6 font-sora">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-muted">Steps taken</span>
                  <span className="font-dm-mono text-xl font-bold text-text-primary">{path.length - 1}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted">Optimal Path</span>
                  <span className="font-dm-mono text-cyan-glow font-semibold">{optimalPath.length - 1} steps</span>
                </div>
                <div className="mt-4 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-glow transition-all duration-300"
                    style={{ width: `${Math.min(((path.length - 1) / (optimalPath.length - 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Travel Breadcrumbs / Log */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Footprints className="h-4 w-4 text-cyan-glow" />
                  <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider font-sora">Your Route</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {path.map((nodeCode, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-sora font-medium p-2 rounded bg-white/[0.01]">
                      <span className="text-text-muted font-dm-mono w-4">#{idx}</span>
                      <div className="relative w-6 h-4 rounded overflow-hidden shrink-0 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getCountryFlag(nodeCode)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-text-secondary truncate">{getCountryName(nodeCode)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger / Restart buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setGameState("start")}
                  className="flex-1 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-text-primary hover:bg-white/[0.06] transition-all font-sora font-semibold flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Restart
                </button>
                <button
                  onClick={() => {
                    setRevealed(true);
                    setGameState("victory");
                  }}
                  className="flex-1 py-3 rounded-xl border border-amber-glow/20 bg-amber-glow/5 text-sm text-amber-glow hover:bg-amber-glow/10 transition-all font-sora font-semibold flex items-center justify-center gap-2"
                >
                  <Compass className="h-4 w-4" /> Show Answer
                </button>
              </div>
            </div>

            {/* Game interface (Right panel) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Country Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-glow/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                      <Image src={currentCountry.flags.svg} alt={currentCountry.name.common} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-glow uppercase tracking-[0.2em] font-bold font-sora">Current Location</span>
                      <h2 className="text-3xl font-black text-text-primary font-instrument-serif mt-0.5">{currentCountry.name.common}</h2>
                      <span className="text-xs text-text-muted font-sora">{currentCountry.region}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Borders Selector list */}
              <div>
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 font-sora">
                  Where would you like to travel next?
                </h3>
                {currentCountry.borders && currentCountry.borders.length > 0 ? (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {currentCountry.borders.map((neighborCode) => {
                      const name = getCountryName(neighborCode);
                      const flag = getCountryFlag(neighborCode);
                      const isTarget = neighborCode === targetCountry.cca3;

                      return (
                        <button
                          key={neighborCode}
                          onClick={() => selectBorder(neighborCode)}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left font-sora transition-all font-bold hover:scale-[1.02] active:scale-[0.98] ${
                            isTarget
                              ? "border-amber-glow/50 bg-amber-glow/10 hover:bg-amber-glow/20 text-amber-glow"
                              : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06] text-text-primary"
                          }`}
                        >
                          <div className="relative w-10 h-6.5 rounded overflow-hidden shrink-0 border border-white/10 shadow">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={flag} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 truncate">
                            <span className="block text-sm leading-tight truncate">{name}</span>
                            {isTarget && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-glow animate-pulse">
                                Target Destination!
                              </span>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-red-500/10 border border-red-500/20">
                    <ShieldAlert className="h-8 w-8 text-red-400 mx-auto mb-3" />
                    <p className="text-sm font-sora font-semibold text-text-primary">
                      No Borders Found!
                    </p>
                    <p className="text-xs text-text-muted font-sora mt-1">
                      This country doesn&apos;t seem to have land borders recorded in the database.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VICTORY SCREEN */}
        {gameState === "victory" && startCountry && targetCountry && (
          <div className="max-w-xl mx-auto rounded-3xl border border-white/5 bg-white/[0.03] glass-card p-6 sm:p-10 text-center animate-in zoom-in-95 duration-500">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full mx-auto ${
              revealed 
                ? "bg-cyan-glow/10 ring-4 ring-cyan-glow/20" 
                : "bg-amber-glow/10 ring-4 ring-amber-glow/20"
            }`}>
              {revealed ? (
                <Compass className="h-10 w-10 text-cyan-glow" />
              ) : (
                <Trophy className="h-10 w-10 text-amber-glow" />
              )}
            </div>
            
            <h2 className="text-3xl font-black font-instrument-serif text-text-primary mb-2">
              {revealed ? "Route Revealed" : "Border Escaped!"}
            </h2>
            <p className="text-muted text-sm font-sora mb-6">
              {revealed 
                ? `Here is the optimal path from ${startCountry.name.common} to ${targetCountry.name.common}.` 
                : `You successfully built a land bridge from ${startCountry.name.common} to ${targetCountry.name.common}.`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 bg-white/[0.01] border border-white/5 p-5 rounded-2xl font-sora">
              <div className="text-center border-r border-white/5">
                <span className="text-xs text-text-muted uppercase tracking-wider block">Your moves</span>
                <span className="text-3xl font-black font-dm-mono text-text-primary block mt-1">{path.length - 1}</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-text-muted uppercase tracking-wider block">Optimal moves</span>
                <span className="text-3xl font-black font-dm-mono text-cyan-glow block mt-1">{optimalPath.length - 1}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-8 text-left">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-sora text-sm">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 block">Your Route ({path.length - 1} steps):</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {path.map((code, idx) => (
                    <div key={idx} className="flex items-center gap-1 my-0.5">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] text-xs font-medium text-text-secondary border border-white/5">
                        <span className="relative w-4 h-2.5 rounded overflow-hidden shrink-0 border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getCountryFlag(code)} alt="" className="w-full h-full object-cover" />
                        </span>
                        {getCountryName(code)}
                      </span>
                      {idx < path.length - 1 && <ChevronRight className="h-3 w-3 text-text-muted" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-sora text-sm">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 block">Optimal Route ({optimalPath.length - 1} steps):</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {optimalPath.map((code, idx) => (
                    <div key={idx} className="flex items-center gap-1 my-0.5">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] text-xs font-medium text-text-secondary border border-white/5">
                        <span className="relative w-4 h-2.5 rounded overflow-hidden shrink-0 border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getCountryFlag(code)} alt="" className="w-full h-full object-cover" />
                        </span>
                        {getCountryName(code)}
                      </span>
                      {idx < optimalPath.length - 1 && <ChevronRight className="h-3 w-3 text-text-muted" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive route path comparison map */}
            <div className="mb-8">
              <BorderEscapeMap
                startCountry={startCountry}
                targetCountry={targetCountry}
                userPathCountries={path
                  .map((code) => countries.find((c) => c.cca3 === code))
                  .filter(Boolean) as Country[]}
                optimalPathCountries={optimalPath
                  .map((code) => countries.find((c) => c.cca3 === code))
                  .filter(Boolean) as Country[]}
                revealed={revealed}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateGame}
                className="flex-1 rounded-xl bg-cyan-glow py-4 text-sm font-bold text-atlas-950 transition-all hover:bg-cyan-glow/80 active:scale-95 shadow-lg shadow-cyan-glow/20 flex items-center justify-center gap-2 font-sora"
              >
                <RefreshCw className="h-4 w-4" /> Play Again
              </button>
              <button
                onClick={() => setGameState("start")}
                className="flex-1 rounded-xl bg-white/[0.05] py-4 text-sm font-bold text-text-primary transition-all hover:bg-white/[0.08] active:scale-95 ring-1 ring-white/10 font-sora"
              >
                Change Difficulty
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
