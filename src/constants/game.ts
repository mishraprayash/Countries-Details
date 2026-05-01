export const GAME_CONFIG = {
  MIN_PLACE_COUNT: 5,
  MAX_PLACE_COUNT: 25,
  DEFAULT_PLACE_COUNT: 10,
  PLACE_COUNT_STEP: 5,
  
  SCORING: {
    MAX_POINTS_PER_LOCATION: 1000,
    DISTANCE_THRESHOLD: 500,
    DISTANCE_CUTOFF: 2500,
    DECAY_FACTOR: 500,
  },
  
  TIMING: {
    FAST_ANSWER_THRESHOLD: 10,
    TIME_BONUS_MULTIPLIER: 10,
    COMBO_THRESHOLD: 3,
    COMBO_BONUS_MULTIPLIER: 20,
    TRANSITION_DELAY: 800,
  },
  
  STORAGE_KEYS: {
    GAME_STATS: "world-insights-explore-stats",
  },
} as const;

export const CONTINENTS = {
  EUROPE: { key: "Europe", name: "Europe", icon: "🏰", center: [54.526, 15.2551] as [number, number], zoom: 4 },
  ASIA: { key: "Asia", name: "Asia", icon: "🏯", center: [34.0479, 100.6197] as [number, number], zoom: 3 },
  AFRICA: { key: "Africa", name: "Africa", icon: "🦁", center: [-8.7832, 34.5085] as [number, number], zoom: 3 },
  NORTH_AMERICA: { key: "North America", name: "North America", icon: "🗽", center: [54.526, -105.2551] as [number, number], zoom: 3 },
  SOUTH_AMERICA: { key: "South America", name: "South America", icon: "🏔️", center: [-14.235, -51.9253] as [number, number], zoom: 3 },
  OCEANIA: { key: "Oceania", name: "Oceania", icon: "🏝️", center: [-22.7359, 140.0188] as [number, number], zoom: 3 },
} as const;

export type ContinentKey = keyof typeof CONTINENTS;