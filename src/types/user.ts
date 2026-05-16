export type CountryStatus = "visited" | "want-to-visit" | "lived-in";

export interface UserCountryEntry {
  status: CountryStatus;
  addedAt: number;
  updatedAt: number;
}

export interface TravelStats {
  visitedCount: number;
  wantToVisitCount: number;
  livedInCount: number;
  totalTracked: number;
  visitedPercentage: number;
  continentsVisited: number;
  continentBreakdown: Record<string, { visited: number; total: number }>;
}
