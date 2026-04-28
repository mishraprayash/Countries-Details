"use client";

import { useState, useEffect } from "react";

export interface QuizScore {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  mode: string;
}

const STORAGE_KEY = "world_insights_quiz_leaderboard";
const MAX_SCORES = 10;

export function useQuizLeaderboard() {
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setScores(JSON.parse(stored));
        } catch {
          setScores([]);
        }
      }
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const addScore = (score: number, totalQuestions: number, mode: string): number => {
    const percentage = Math.round((score / totalQuestions) * 100);
    const newScore: QuizScore = {
      id: Date.now().toString(),
      score,
      totalQuestions,
      percentage,
      date: new Date().toISOString(),
      mode,
    };

    const updatedScores = [newScore, ...scores]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, MAX_SCORES);

    setScores(updatedScores);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScores));
    return updatedScores.findIndex(s => s.id === newScore.id) + 1;
  };

  const clearScores = () => {
    setScores([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeScore = (id: string) => {
    const updatedScores = scores.filter(s => s.id !== id);
    setScores(updatedScores);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScores));
  };

  const getPersonalBest = () => scores[0] || null;
  const getTotalGamesPlayed = () => scores.length;

  return { scores, addScore, clearScores, removeScore, getPersonalBest, getTotalGamesPlayed, mounted };
}