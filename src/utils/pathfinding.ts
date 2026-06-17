export interface PathfindingCountry {
  cca3: string;
  borders?: string[];
}

/**
 * Calculates the shortest path between two countries using Breadth-First Search.
 * @param startCode The CCA3 code of the starting country.
 * @param targetCode The CCA3 code of the target country.
 * @param countriesList The list of all available countries.
 * @returns An array of CCA3 codes representing the path, or null if no path is found.
 */
export function calculateShortestPath(
  startCode: string,
  targetCode: string,
  countriesList: PathfindingCountry[]
): string[] | null {
  const adjMap = new Map<string, string[]>();
  countriesList.forEach((c) => {
    adjMap.set(c.cca3, c.borders || []);
  });

  const queue: [string, string[]][] = [[startCode, [startCode]]];
  const visited = new Set<string>([startCode]);

  while (queue.length > 0) {
    const [curr, currentPath] = queue.shift()!;
    if (curr === targetCode) return currentPath;

    const neighbors = adjMap.get(curr) || [];
    for (const n of neighbors) {
      if (!visited.has(n)) {
        visited.add(n);
        queue.push([n, [...currentPath, n]]);
      }
    }
  }
  return null;
}