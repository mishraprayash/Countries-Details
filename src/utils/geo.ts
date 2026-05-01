import { GAME_CONFIG } from "@/constants/game";

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate points based on distance using exponential decay
 * Formula: 1000 * e^(-distance/500)
 */
export function calculatePoints(distance: number): number {
  const { DISTANCE_CUTOFF, MAX_POINTS_PER_LOCATION, DECAY_FACTOR } = GAME_CONFIG.SCORING;
  
  if (distance > DISTANCE_CUTOFF) return 0;
  return Math.max(0, Math.round(MAX_POINTS_PER_LOCATION * Math.exp(-distance / DECAY_FACTOR)));
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance > 9000) return "Skipped";
  return `${distance.toLocaleString()} km`;
}

/**
 * Format time in seconds to readable format
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Calculate time spent on a specific location
 */
export function calculateTimeSpent(currentTime: number, previousTime: number): number {
  return Math.max(0, currentTime - previousTime);
}