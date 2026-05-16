"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { RefreshCw, TrendingUp, TrendingDown, Award, Sparkles, Flame, Globe, Clock, Languages, MapPin, Users, Shield } from "lucide-react";

interface CountryData {
  name: { common: string };
  cca3: string;
  flags: { svg: string };
  population?: number;
  area?: number;
  region?: string;
  timezones?: string[];
  languages?: Record<string, string>;
  borders?: string[];
  capital?: string[];
  independent?: boolean;
  unMember?: boolean;
  landlocked?: boolean;
}

interface BattleModeProps {
  countries: CountryData[];
}

type StatKey = "population" | "area" | "density" | "borders" | "timezones" | "languages" | "capital";

interface StatConfig {
  key: StatKey;
  label: string;
  icon: React.ElementType;
  getValue: (c: CountryData) => number;
  format: (v: number) => string;
}

const STAT_CONFIGS: StatConfig[] = [
  {
    key: "population",
    label: "Population",
    icon: Users,
    getValue: (c) => c.population || 0,
    format: (v) => v.toLocaleString(),
  },
  {
    key: "area",
    label: "Total Area",
    icon: Globe,
    getValue: (c) => c.area || 0,
    format: (v) => `${v.toLocaleString()} km²`,
  },
  {
    key: "density",
    label: "Population Density",
    icon: MapPin,
    getValue: (c) => Math.round((c.population || 0) / Math.max(c.area || 1, 1)),
    format: (v) => `${v.toLocaleString()} people/km²`,
  },
  {
    key: "borders",
    label: "Bordering Countries",
    icon: Shield,
    getValue: (c) => c.borders?.length || 0,
    format: (v) => `${v} countries`,
  },
  {
    key: "timezones",
    label: "Time Zones",
    icon: Clock,
    getValue: (c) => c.timezones?.length || 0,
    format: (v) => `${v} timezones`,
  },
  {
    key: "languages",
    label: "Official Languages",
    icon: Languages,
    getValue: (c) => Object.keys(c.languages || {}).length,
    format: (v) => `${v} language${v !== 1 ? "s" : ""}`,
  },
  {
    key: "capital",
    label: "Capital Name Length",
    icon: Globe,
    getValue: (c) => c.capital?.[0]?.length || 0,
    format: (v) => `${v} characters`,
  },
];

const STORAGE_KEY = "battle-mode-stats";

export default function BattleMode({ countries }: BattleModeProps) {
  const [countryA, setCountryA] = useState<CountryData | null>(null);
  const [countryB, setCountryB] = useState<CountryData | null>(null);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "revealed" | "gameover">("playing");
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setHighScore(data.highScore || 0);
        setBestStreak(data.bestStreak || 0);
        setTotalGames(data.totalGames || 0);
      }
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persistStats = useCallback((newHigh: number, newBest: number, newTotal: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ highScore: newHigh, bestStreak: newBest, totalGames: newTotal }));
    } catch {}
  }, []);

  const pickRandom = useCallback((excludeCca3?: string) => {
    const eligible = countries.filter((c) => c.cca3 !== excludeCca3);
    return eligible[Math.floor(Math.random() * eligible.length)] || null;
  }, [countries]);

  const startNewRound = useCallback(() => {
    const a = pickRandom();
    if (!a) return;
    const b = pickRandom(a.cca3);
    if (!b) return;
    setCountryA(a);
    setCountryB(b);
    setCurrentStatIndex(Math.floor(Math.random() * STAT_CONFIGS.length));
    setGameState("playing");
    setLastGuessCorrect(null);
  }, [pickRandom]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (countries.length > 0 && !countryA) {
      startNewRound();
    }
  }, [countries, countryA, startNewRound]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleGuess = (guessHigher: boolean) => {
    if (gameState !== "playing" || !countryA || !countryB) return;

    const stat = STAT_CONFIGS[currentStatIndex];
    const valA = stat.getValue(countryA);
    const valB = stat.getValue(countryB);

    const isHigher = valB > valA;
    const isCorrect = guessHigher === isHigher;

    setLastGuessCorrect(isCorrect);
    setGameState(isCorrect ? "revealed" : "gameover");

    if (isCorrect) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      const newHigh = Math.max(newScore, highScore);
      const newBest = Math.max(newStreak, bestStreak);
      setHighScore(newHigh);
      setBestStreak(newBest);
      persistStats(newHigh, newBest, totalGames);

      setTimeout(() => {
        const winner = valA > valB ? countryA : countryB;
        const next = pickRandom(winner.cca3);
        if (next) {
          setCountryA(winner);
          setCountryB(next);
          setCurrentStatIndex(Math.floor(Math.random() * STAT_CONFIGS.length));
          setGameState("playing");
          setLastGuessCorrect(null);
        }
      }, 1500);
    } else {
      const newTotal = totalGames + 1;
      setTotalGames(newTotal);
      persistStats(Math.max(score, highScore), Math.max(streak, bestStreak), newTotal);
    }
  };

  const restartGame = () => {
    setScore(0);
    setStreak(0);
    startNewRound();
  };

  if (!countryA || !countryB) {
    return <div className="p-12 text-center text-muted animate-pulse font-sora">Loading Battle Arena...</div>;
  }

  const stat = STAT_CONFIGS[currentStatIndex];
  const valA = stat.getValue(countryA);
  const valB = stat.getValue(countryB);
  const StatIcon = stat.icon;

  return (
    <div className="rounded-3xl border border-white/10 bg-atlas-950 overflow-hidden shadow-2xl relative glass-card">
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex flex-wrap gap-2 sm:gap-3 items-center justify-between z-20 bg-gradient-to-b from-atlas-950/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-atlas-900/80 backdrop-blur border border-white/10 font-sora">
          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-glow" />
          <span className="font-bold text-text-primary font-dm-mono text-sm sm:text-base">Score: {score}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 font-sora">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="font-bold text-orange-400 font-dm-mono text-sm">{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-atlas-900/80 backdrop-blur border border-white/10 font-sora">
            <span className="text-xs sm:text-sm font-medium text-muted">Best:</span>
            <span className="font-bold text-amber-glow font-dm-mono text-sm sm:text-base">{Math.max(highScore, score)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[800px] md:min-h-[600px] md:h-[600px]">
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 pt-24 md:p-8 bg-white/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 to-transparent pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="w-48 h-32 relative mx-auto mb-6 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10">
              <Image src={countryA.flags.svg} alt={countryA.name.common} fill className="object-cover" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-text-primary mb-2 font-instrument-serif">{countryA.name.common}</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              <StatIcon className="h-4 w-4 text-muted" />
              <p className="text-xs sm:text-sm font-bold text-muted uppercase tracking-widest font-sora">has a {stat.label} of</p>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-cyan-glow drop-shadow-sm font-dm-mono">
              {stat.format(valA)}
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-atlas-900 border-4 border-atlas-950 text-text-primary font-black text-xl shadow-2xl font-sora">
          VS
        </div>

        <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-white/[0.03]">
          <div className="absolute inset-0 bg-gradient-to-t from-violet-glow/5 to-transparent pointer-events-none" />
          <div className="relative z-10 text-center w-full max-w-sm">
            <div className="w-48 h-32 relative mx-auto mb-6 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10">
              <Image src={countryB.flags.svg} alt={countryB.name.common} fill className="object-cover" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-text-primary mb-2 font-instrument-serif">{countryB.name.common}</h3>
            <div className="flex items-center justify-center gap-2 mb-6">
              <StatIcon className="h-4 w-4 text-muted" />
              <p className="text-xs sm:text-sm font-bold text-muted uppercase tracking-widest font-sora">has a {stat.label}</p>
            </div>

            {gameState === "playing" ? (
              <div className="space-y-4">
                <button
                  onClick={() => handleGuess(true)}
                  className="w-full py-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all group flex items-center justify-center gap-3 font-sora"
                >
                  <TrendingUp className="h-6 w-6 text-emerald-400 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-xl font-bold text-text-primary">Higher</span>
                </button>
                <button
                  onClick={() => handleGuess(false)}
                  className="w-full py-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all group flex items-center justify-center gap-3 font-sora"
                >
                  <TrendingDown className="h-6 w-6 text-red-400 group-hover:translate-y-1 transition-transform" />
                  <span className="text-xl font-bold text-text-primary">Lower</span>
                </button>
                <p className="text-xs font-medium text-muted pt-2 font-sora">than {countryA.name.common}</p>
              </div>
            ) : (
              <div className="animate-in zoom-in duration-300">
                <div className={`text-3xl sm:text-5xl font-black mb-4 font-dm-mono ${lastGuessCorrect ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.format(valB)}
                </div>
                {gameState === "revealed" && (
                  <div className="inline-flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-2 rounded-full font-sora">
                    <Sparkles className="h-5 w-5" /> Correct! Next round...
                  </div>
                )}
                {gameState === "gameover" && (
                  <div className="mt-8 space-y-6">
                    <div className="text-red-400 font-bold text-xl uppercase tracking-widest font-sora">Game Over</div>
                    <div className="grid grid-cols-2 gap-4 text-sm font-sora">
                      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                        <p className="text-muted text-xs">Final Score</p>
                        <p className="text-xl font-bold text-text-primary font-dm-mono">{score}</p>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                        <p className="text-muted text-xs">Best Streak</p>
                        <p className="text-xl font-bold text-orange-400 font-dm-mono">{bestStreak}</p>
                      </div>
                    </div>
                    <button
                      onClick={restartGame}
                      className="mx-auto flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-glow text-atlas-950 font-bold hover:bg-cyan-glow/80 transition-all active:scale-95 shadow-xl font-sora"
                    >
                      <RefreshCw className="h-5 w-5" /> Play Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
