/**
 * Fisher-Yates shuffle algorithm
 * Shuffles array in place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random subset of array
 */
export function getRandomSubset<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}

/**
 * Group array by key
 */
export function groupBy<T, K extends string>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/**
 * Get unique values from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Sort array by numeric property
 */
export function sortByNumeric<T>(
  array: T[],
  getValue: (item: T) => number,
  descending = true
): T[] {
  return [...array].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);
    return descending ? valueB - valueA : valueA - valueB;
  });
}