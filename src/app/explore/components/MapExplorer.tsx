"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Compass, ChevronRight, RotateCcw, Trophy, Clock, Zap, Award } from "lucide-react";
import locationData from "@/data/locations.json";
import { useGameStats } from "@/hooks/useGameStats";
import type { Achievement } from "@/types";

// Dynamically import MapBoard to avoid SSR issues with Leaflet
const MapBoard = dynamic(() => import("./MapBoard"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-zinc-900 rounded-2xl flex items-center justify-center">
      <div className="text-zinc-500">Loading map...</div>
    </div>
  )
});

type GamePhase = "select" | "settings" | "playing" | "results";
type RegionKey = "Europe" | "Asia" | "Africa" | "North America" | "South America" | "Oceania";
type Difficulty = "easy" | "hard";

interface GameLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  country: string;
}

interface UserGuess {
  locationId: string;
  locationName: string;
  lat: number;
  lng: number;
  actualLat: number;
  actualLng: number;
  distance: number;
  points: number;
  timeSpent: number;
}

const REGIONS: { key: RegionKey; name: string; icon: string; center: [number, number]; zoom: number }[] = [
  { key: "Europe", name: "Europe", icon: "🏰", center: [54.526, 15.2551], zoom: 4 },
  { key: "Asia", name: "Asia", icon: "🏯", center: [34.0479, 100.6197], zoom: 3 },
  { key: "Africa", name: "Africa", icon: "🦁", center: [-8.7832, 34.5085], zoom: 3 },
  { key: "North America", name: "North America", icon: "🗽", center: [54.526, -105.2551], zoom: 3 },
  { key: "South America", name: "South America", icon: "🏔️", center: [-14.235, -51.9253], zoom: 3 },
  { key: "Oceania", name: "Oceania", icon: "🏝️", center: [-22.7359, 140.0188], zoom: 3 },
];

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Exponential decay scoring
function calculatePoints(distance: number): number {
  if (distance > 2500) return 0;
  return Math.max(0, Math.round(1000 * Math.exp(-distance / 500)));
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MapExplorer() {
  const { stats, recordGame, updateCombo } = useGameStats();
  const [phase, setPhase] = useState<GamePhase>("select");
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [placeCount, setPlaceCount] = useState(10);
  const [locations, setLocations] = useState<GameLocation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuesses, setUserGuesses] = useState<UserGuess[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [currentGuess, setCurrentGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playSoundEffect = useCallback((type: "correct" | "wrong" | "combo" | "achievement") => {
    const frequencies: Record<string, number[]> = {
      correct: [523, 659, 784],
      wrong: [300, 250, 200],
      combo: [523, 659, 784, 1047],
      achievement: [523, 659, 784, 932, 1047],
    };
    
    try {
      const audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      frequencies[type].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.2);
        osc.start(audioCtx.currentTime + i * 0.1);
        osc.stop(audioCtx.currentTime + i * 0.1 + 0.2);
      });
    } catch { /* audio not supported */ }
  }, []);

  const regionData = selectedRegion ? REGIONS.find(r => r.key === selectedRegion) : null;

  const startGame = () => {
    if (!selectedRegion) return;
    
    const regionLocations = locationData[selectedRegion as keyof typeof locationData];
    const filteredLocations = difficulty === "easy" 
      ? regionLocations.easy || []
      : regionLocations.hard || [];
    const selectedLocations = shuffleArray([...filteredLocations]).slice(0, placeCount).map((loc: GameLocation) => ({
      id: loc.id,
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      type: loc.type,
      country: loc.country
    }));

    setLocations(selectedLocations);
    setCurrentIndex(0);
    setUserGuesses([]);
    setTotalScore(0);
    setCurrentGuess(null);
    setShowResult(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setCurrentCombo(0);
    setUnlockedAchievements([]);
    
    if (regionData) {
      setMapCenter(regionData.center);
      setMapZoom(regionData.zoom);
    }
    
    setGameStartTime(Date.now());
    setPhase("playing");
  };

  useEffect(() => {
    if (phase === "playing" && !showResult) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, showResult, startTime]);

  const handleMapClick = (lat: number, lng: number) => {
    if (phase !== "playing" || showResult) return;
    
    setCurrentGuess({ lat, lng });
    setShowResult(true);
  };

  const handleNext = () => {
    if (!currentGuess || !locations[currentIndex]) return;

    const currentLocation = locations[currentIndex];
    const distance = calculateDistance(
      currentGuess.lat,
      currentGuess.lng,
      currentLocation.lat,
      currentLocation.lng
    );
    let points = calculatePoints(distance);
    
    const isGoodGuess = distance < 500;
    const newCombo = isGoodGuess ? currentCombo + 1 : 0;
    const comboBonus = newCombo >= 3 ? Math.round(newCombo * 20) : 0;
    points += comboBonus;
    
    if (isGoodGuess && distance < 500) {
      playSoundEffect("correct");
      if (newCombo >= 3) playSoundEffect("combo");
    } else if (distance >= 1000) {
      playSoundEffect("wrong");
    }

    const cumulativeTime = Math.floor((Date.now() - gameStartTime) / 1000);
    
    const guess: UserGuess = {
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      lat: currentGuess.lat,
      lng: currentGuess.lng,
      actualLat: currentLocation.lat,
      actualLng: currentLocation.lng,
      distance: Math.round(distance),
      points,
      timeSpent: cumulativeTime
    };

    setUserGuesses(prev => [...prev, guess]);
    setTotalScore(prev => prev + points);
    setCurrentCombo(newCombo);
    updateCombo(newCombo);

    if (currentIndex < locations.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setCurrentGuess(null);
        setShowResult(false);
        setStartTime(Date.now());
      }, 800);
    } else {
      setTimeout(() => {
        const finalScore = totalScore + points;
        const correctGuesses = userGuesses.filter(g => g.points > 0).length + (points > 0 ? 1 : 0);
        recordGame(finalScore, locations.length * 1000, selectedRegion!, difficulty, placeCount, correctGuesses);
        setPhase("results");
      }, 800);
    }
  };

  const skipLocation = () => {
    if (!locations[currentIndex]) return;

    const cumulativeTime = Math.floor((Date.now() - gameStartTime) / 1000);

    const guess: UserGuess = {
      locationId: locations[currentIndex].id,
      locationName: locations[currentIndex].name,
      lat: 0,
      lng: 0,
      actualLat: locations[currentIndex].lat,
      actualLng: locations[currentIndex].lng,
      distance: 99999,
      points: 0,
      timeSpent: cumulativeTime
    };

    setUserGuesses(prev => [...prev, guess]);

    if (currentIndex < locations.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentGuess(null);
      setShowResult(false);
      setStartTime(Date.now());
    } else {
      const correctGuesses = userGuesses.filter(g => g.points > 0).length;
      recordGame(totalScore, locations.length * 1000, selectedRegion!, difficulty, placeCount, correctGuesses);
      setPhase("results");
    }
  };

  const resetGame = () => {
    setPhase("select");
    setSelectedRegion(null);
    setLocations([]);
    setCurrentIndex(0);
    setUserGuesses([]);
    setTotalScore(0);
    setCurrentGuess(null);
    setShowResult(false);
  };

  const maxPossibleScore = locations.length * 1000;
  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  // Phase 1: Region Selection
  if (phase === "select") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 ring-2 ring-emerald-500/30 mb-6">
            <Compass className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Map Explorer</h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-base sm:text-lg">
            Select a continent and test your geography skills! Find famous locations on the map and earn points based on accuracy.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {REGIONS.map((region) => (
            <button
              key={region.key}
              onClick={() => setSelectedRegion(region.key)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all hover:scale-105 ${
                selectedRegion === region.key
                  ? "bg-emerald-500/20 border-emerald-500/50"
                  : "bg-zinc-900/50 border-white/5 hover:border-white/20"
              }`}
            >
              <span className="text-4xl mb-3">{region.icon}</span>
              <span className="font-bold text-white">{region.name}</span>
            </button>
          ))}
        </div>

        {selectedRegion && (
          <div className="flex justify-center">
            <button
              onClick={() => setPhase("settings")}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Continue <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Phase 2: Settings
  if (phase === "settings") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setPhase("select")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180" /> Back to regions
          </button>

          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">{regionData?.icon}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Game Settings</h2>
            <p className="text-zinc-400 mt-2">Configure your {selectedRegion} exploration</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 sm:p-8 space-y-8">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-4">Difficulty</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setDifficulty("easy")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    difficulty === "easy"
                      ? "bg-emerald-500 text-black"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficulty("hard")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    difficulty === "hard"
                      ? "bg-amber-500 text-black"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  Hard
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {difficulty === "easy" ? "Well-known famous locations" : "Lesser-known hidden gems"}
              </p>
            </div>

            {/* Place Count */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-4">
                Number of places: <span className="text-emerald-400">{placeCount}</span>
              </label>
              <input
                type="range"
                min="5"
                max="25"
                step="5"
                value={placeCount}
                onChange={(e) => setPlaceCount(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>25</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20 text-lg"
            >
              <MapPin className="h-5 w-5" />
              Start Exploration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 3: Playing
  if (phase === "playing") {
    const currentLocation = locations[currentIndex];
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Location {currentIndex + 1} of {locations.length}
            </h2>
            <p className="text-zinc-400 text-sm">
              Click on the map where you think <span className="text-emerald-400 font-semibold">{currentLocation?.name}</span> is located
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {currentCombo >= 2 && (
              <div className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-400" />
                <span className="text-orange-400 font-bold text-sm">{currentCombo}x</span>
              </div>
            )}
            <div className="px-3 py-1 rounded-lg bg-zinc-800 flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-400" />
              <span className="text-zinc-400 font-mono text-sm">{formatTime(elapsedTime)}</span>
            </div>
            <button
              onClick={skipLocation}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Skip
            </button>
            <div className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold">{totalScore}</span>
              <span className="text-zinc-500 text-sm ml-1">pts</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <MapBoard
            center={mapCenter}
            zoom={mapZoom}
            onMapClick={handleMapClick}
            userMarker={currentGuess}
            showResult={showResult}
            actualLocation={showResult && currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : null}
            regionKey={selectedRegion || undefined}
          />
          
          {/* Location hint */}
          <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-[1000]">
            <div className="bg-zinc-950/90 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10 inline-flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <MapPin className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Find this place</p>
                <p className="font-bold text-white">{currentLocation?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        {currentGuess && showResult && (
          <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              {currentIndex < locations.length - 1 ? "Next Location" : "See Results"}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Phase 4: Results
  if (phase === "results") {
    const unlockedNow = stats.achievements.filter(a => a.unlocked && !unlockedAchievements.includes(a));
    const bestCombo = Math.max(...userGuesses.map((_, i) => {
      let combo = 0;
      for (let j = i; j < userGuesses.length && userGuesses[j].points > 500; j++) combo++;
      return combo;
    }), 0);
    
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Score Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/20 ring-4 ring-amber-500/30 mb-4">
              <Trophy className="h-12 w-12 text-amber-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {percentage >= 80 ? "Outstanding!" : percentage >= 50 ? "Good Try!" : "Keep Practicing!"}
            </h2>
            <p className="text-zinc-400">
              You scored <span className="text-amber-400 font-bold text-xl">{totalScore}</span> points ({percentage}%)
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 text-center">
              <div className="text-2xl font-black text-emerald-400">{stats.gamesPlayed}</div>
              <div className="text-xs text-zinc-500">Games Played</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 text-center">
              <div className="text-2xl font-black text-orange-400">{stats.currentStreak}</div>
              <div className="text-xs text-zinc-500">Day Streak</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 text-center">
              <div className="text-2xl font-black text-blue-400">{bestCombo}</div>
              <div className="text-xs text-zinc-500">Best Combo</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 text-center">
              <div className="text-2xl font-black text-purple-400">{stats.bestScore}</div>
              <div className="text-xs text-zinc-500">Best Score</div>
            </div>
          </div>

          {/* Achievements */}
          {unlockedNow.length > 0 && (
            <div className="mb-8">
              <button
                onClick={() => setShowAchievements(!showAchievements)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-all"
              >
                <Award className="h-5 w-5 text-amber-400" />
                <span className="font-bold text-amber-400">{unlockedNow.length} New Achievement{unlockedNow.length > 1 ? 's' : ''} Unlocked!</span>
                <ChevronRight className={`h-4 w-4 text-amber-400 transition-transform ${showAchievements ? 'rotate-90' : ''}`} />
              </button>
              {showAchievements && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {unlockedNow.map(achievement => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-amber-500/20">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <div className="font-bold text-white text-sm">{achievement.name}</div>
                        <div className="text-xs text-zinc-500">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Map */}
          <div className="rounded-2xl overflow-hidden border border-white/10 mb-8">
            <MapBoard
              center={mapCenter}
              zoom={mapZoom}
              onMapClick={() => {}}
              userMarker={null}
              showResult={false}
              actualLocation={null}
              allGuesses={userGuesses}
              regionKey={selectedRegion || undefined}
            />
          </div>

          {/* Results List */}
          <div className="space-y-3 mb-8">
            {userGuesses.map((guess, idx) => {
              const prevTime = idx > 0 ? userGuesses[idx - 1].timeSpent : 0;
              const timeForThis = guess.timeSpent - prevTime;
              const formatSec = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
              
              return (
                <div
                  key={guess.locationId}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    guess.points > 500
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : guess.points > 0
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white">{guess.locationName}</p>
                      <p className="text-xs text-zinc-500">
                        {guess.distance > 9000 ? "Skipped" : `${guess.distance.toLocaleString()} km away`}
                        <span className="ml-2 text-blue-400">• {formatSec(timeForThis)}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    guess.points > 500 ? "text-emerald-400" : guess.points > 0 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {guess.points} pts
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setPhase("settings");
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all border border-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
            </button>
            <button
              onClick={resetGame}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
            >
              Change Region
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}