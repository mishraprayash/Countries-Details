export type GamePhase = "select" | "settings" | "playing" | "results";
export type Difficulty = "easy" | "hard";
export type RegionKey = "Europe" | "Asia" | "Africa" | "North America" | "South America" | "Oceania";

export interface GameLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  country: string;
}

export interface UserGuess {
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

export interface GameRecord {
  id: string;
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  region: string;
  difficulty: string;
  placeCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  bestPercentage: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  currentCombo: number;
  bestCombo: number;
  totalPlacesFound: number;
  regionsPlayed: string[];
  achievements: Achievement[];
}