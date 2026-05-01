"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { RefreshCw, TrendingUp, TrendingDown, Award, Sparkles } from "lucide-react";

interface CountryData {
  name: { common: string };
  cca3: string;
  flags: { svg: string };
  population?: number;
  area?: number;
}

interface BattleModeProps {
  countries: CountryData[];
}

type StatKey = "population" | "area";

export default function BattleMode({ countries }: BattleModeProps) {
  const [countryA, setCountryA] = useState<CountryData | null>(null);
  const [countryB, setCountryB] = useState<CountryData | null>(null);
  const [currentStat, setCurrentStat] = useState<StatKey>("population");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "revealed" | "gameover">("playing");
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null);

  const getRandomCountry = useCallback((exclude?: string) => {
    const validCountries = countries.filter(
      (c) => (c.population || 0) > 0 && (c.area || 0) > 0 && c.cca3 !== exclude
    );
    return validCountries[Math.floor(Math.random() * validCountries.length)];
  }, [countries]);

  const startNewRound = useCallback((keepWinner = false) => {
    const nextStat: StatKey = Math.random() > 0.5 ? "population" : "area";
    setCurrentStat(nextStat);
    
    if (keepWinner && countryA && countryB) {
      // Winner becomes country A, get new country B
      const valA = countryA[nextStat] || 0;
      const valB = countryB[nextStat] || 0;
      const winner = (valA > valB) ? countryA : countryB;
      setCountryA(winner);
      setCountryB(getRandomCountry(winner.cca3));
    } else {
      const a = getRandomCountry();
      setCountryA(a);
      setCountryB(getRandomCountry(a.cca3));
    }
    
    setGameState("playing");
    setLastGuessCorrect(null);
  }, [countryA, countryB, getRandomCountry]);

  // Initial load
  useEffect(() => {
    if (countries.length > 0 && !countryA) {
      const timeoutId = setTimeout(() => {
        startNewRound();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [countries, countryA, startNewRound]);

  const handleGuess = (guessHigher: boolean) => {
    if (gameState !== "playing" || !countryA || !countryB) return;

    const valA = countryA[currentStat] || 0;
    const valB = countryB[currentStat] || 0;
    
    const isHigher = valB > valA;
    const isCorrect = guessHigher === isHigher;

    setLastGuessCorrect(isCorrect);
    setGameState(isCorrect ? "revealed" : "gameover");

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) setHighScore(newScore);
      
      // Auto-advance after correct guess
      setTimeout(() => {
        startNewRound(true);
      }, 1500);
    }
  };

  const restartGame = () => {
    setScore(0);
    startNewRound();
  };

  const formatStat = (val: number | undefined, stat: StatKey) => {
    const num = val || 0;
    if (stat === "population") return num.toLocaleString();
    return `${num.toLocaleString()} km²`;
  };

  const statLabel = currentStat === "population" ? "Population" : "Total Area";

  if (!countryA || !countryB) {
    return <div className="p-12 text-center text-muted animate-pulse font-sora">Loading Battle Arena...</div>;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-atlas-950 overflow-hidden shadow-2xl relative glass-card">
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-atlas-950/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-atlas-900/80 backdrop-blur border border-white/10 font-sora">
          <Award className="h-5 w-5 text-amber-glow" />
          <span className="font-bold text-text-primary font-dm-mono">Score: {score}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-atlas-900/80 backdrop-blur border border-white/10 font-sora">
          <span className="text-sm font-medium text-muted">High Score:</span>
          <span className="font-bold text-amber-glow font-dm-mono">{highScore}</span>
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
            <p className="text-xs sm:text-sm font-bold text-muted uppercase tracking-widest mb-2 font-sora">has a {statLabel} of</p>
            <div className="text-3xl sm:text-4xl font-black text-cyan-glow drop-shadow-sm font-dm-mono">
              {formatStat(countryA[currentStat], currentStat)}
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
            <p className="text-xs sm:text-sm font-bold text-muted uppercase tracking-widest mb-6 font-sora">has a {statLabel}</p>
            
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
                <div className={`text-4xl sm:text-5xl font-black mb-4 font-dm-mono ${lastGuessCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatStat(countryB[currentStat], currentStat)}
                </div>
                {gameState === "revealed" && (
                  <div className="inline-flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-2 rounded-full font-sora">
                    <Sparkles className="h-5 w-5" /> Correct! Next round...
                  </div>
                )}
                {gameState === "gameover" && (
                  <div className="mt-8 space-y-6">
                    <div className="text-red-400 font-bold text-xl uppercase tracking-widest font-sora">Game Over</div>
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