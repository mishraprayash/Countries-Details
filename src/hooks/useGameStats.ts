"use client";

import { useState, useEffect, useCallback } from "react";
import { GameStats, Achievement } from "@/types";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { GAME_CONFIG } from "@/constants/game";

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first_game", name: "Explorer", description: "Play your first game", icon: "🎯", unlocked: false },
  { id: "streak_3", name: "Consistent", description: "3 day streak", icon: "🔥", unlocked: false },
  { id: "streak_7", name: "Dedicated", description: "7 day streak", icon: "⭐", unlocked: false },
  { id: "streak_30", name: "Geography Master", description: "30 day streak", icon: "🏆", unlocked: false },
  { id: "score_5000", name: "High Scorer", description: "Score 5000+ in one game", icon: "💯", unlocked: false },
  { id: "score_8000", name: "Elite Player", description: "Score 8000+ in one game", icon: "👑", unlocked: false },
  { id: "perfect_game", name: "Perfect!", description: "100% accuracy in a game", icon: "💎", unlocked: false },
  { id: "combo_5", name: "Hot Streak", description: "5 correct guesses in a row", icon: "🔥", unlocked: false },
  { id: "combo_10", name: "On Fire!", description: "10 correct guesses in a row", icon: "🌟", unlocked: false },
  { id: "all_regions", name: "World Traveler", description: "Play in all 6 regions", icon: "🌍", unlocked: false },
  { id: "hard_mode", name: "Challenge Accepted", description: "Complete a hard mode game", icon: "💪", unlocked: false },
  { id: "games_10", name: "Regular Player", description: "Play 10 games", icon: "🎮", unlocked: false },
  { id: "games_50", name: "Veteran", description: "Play 50 games", icon: "🏅", unlocked: false },
  { id: "games_100", name: "Legend", description: "Play 100 games", icon: "🏆", unlocked: false },
];

const createDefaultStats = (): GameStats => ({
  gamesPlayed: 0,
  totalScore: 0,
  averageScore: 0,
  bestScore: 0,
  bestPercentage: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  currentCombo: 0,
  bestCombo: 0,
  totalPlacesFound: 0,
  regionsPlayed: [],
  achievements: DEFAULT_ACHIEVEMENTS,
});

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(createDefaultStats());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const storedStats = getStorageItem<GameStats>(GAME_CONFIG.STORAGE_KEYS.GAME_STATS);
    if (storedStats) {
      setStats(storedStats);
    }
  }, []);

  const saveStats = useCallback((newStats: GameStats) => {
    setStats(newStats);
    setStorageItem(GAME_CONFIG.STORAGE_KEYS.GAME_STATS, newStats);
  }, []);

  const checkStreak = useCallback((lastPlayed: string | null): number => {
    if (!lastPlayed) return 1;
    
    const last = new Date(lastPlayed);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 0;
    if (diffDays === 1) return 1;
    return -1;
  }, []);

  const recordGame = useCallback((
    score: number, 
    maxScore: number, 
    region: string, 
    difficulty: string,
    placeCount: number,
    correctGuesses: number
  ) => {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const today = new Date().toISOString().split('T')[0];
    
    const streakResult = checkStreak(stats.lastPlayedDate);
    let newStreak = stats.currentStreak;
    if (streakResult === 1) {
      newStreak = stats.currentStreak + 1;
    } else if (streakResult === -1 || streakResult === 0) {
      newStreak = streakResult === 0 ? stats.currentStreak : 1;
    }

    const newRegionsPlayed = stats.regionsPlayed.includes(region)
      ? stats.regionsPlayed
      : [...stats.regionsPlayed, region];

    const newStats: GameStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      totalScore: stats.totalScore + score,
      averageScore: Math.round((stats.totalScore + score) / (stats.gamesPlayed + 1)),
      bestScore: Math.max(stats.bestScore, score),
      bestPercentage: Math.max(stats.bestPercentage, percentage),
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastPlayedDate: today,
      totalPlacesFound: stats.totalPlacesFound + correctGuesses,
      regionsPlayed: newRegionsPlayed,
    };

    // Check achievements against the updated stats and apply all at once
    let updatedAchievements = [...newStats.achievements];
    const unlock = (id: string) => {
      updatedAchievements = updatedAchievements.map(a =>
        a.id === id && !a.unlocked
          ? { ...a, unlocked: true, unlockedDate: new Date().toISOString() }
          : a
      );
    };

    if (newStats.gamesPlayed >= 1) unlock("first_game");
    if (newStats.currentStreak >= 3) unlock("streak_3");
    if (newStats.currentStreak >= 7) unlock("streak_7");
    if (newStats.currentStreak >= 30) unlock("streak_30");
    if (score >= 5000) unlock("score_5000");
    if (score >= 8000) unlock("score_8000");
    if (percentage === 100) unlock("perfect_game");
    if (newStats.bestCombo >= 5) unlock("combo_5");
    if (newStats.bestCombo >= 10) unlock("combo_10");
    if (newStats.regionsPlayed.length >= 6) unlock("all_regions");
    if (difficulty === "hard") unlock("hard_mode");
    if (newStats.gamesPlayed >= 10) unlock("games_10");
    if (newStats.gamesPlayed >= 50) unlock("games_50");
    if (newStats.gamesPlayed >= 100) unlock("games_100");

    saveStats({ ...newStats, achievements: updatedAchievements });
  }, [stats, checkStreak, saveStats]);

  const updateCombo = useCallback((combo: number) => {
    const newStats = {
      ...stats,
      currentCombo: combo,
      bestCombo: Math.max(stats.bestCombo, combo),
    };
    saveStats(newStats);
  }, [stats, saveStats]);

  const resetStats = useCallback(() => {
    saveStats(createDefaultStats());
  }, [saveStats]);

  return {
    stats,
    recordGame,
    updateCombo,
    resetStats,
    mounted,
  };
}