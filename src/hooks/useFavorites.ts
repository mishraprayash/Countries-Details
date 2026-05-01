"use client";

import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('world_insights_favorites');
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFavorites(JSON.parse(stored));
      } catch {
        console.error('Failed to parse favorites');
      }
    }
    setMounted(true);
  }, []);

  const toggleFavorite = (cca3: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    let updated;
    if (favorites.includes(cca3)) {
      updated = favorites.filter(id => id !== cca3);
    } else {
      updated = [...favorites, cca3];
    }
    setFavorites(updated);
    localStorage.setItem('world_insights_favorites', JSON.stringify(updated));
    // Trigger a custom event so other components can sync state
    window.dispatchEvent(new Event('favorites-updated'));
  };

  const isFavorite = (cca3: string) => {
    return favorites.includes(cca3);
  };

  // Sync state across different instances of the hook
  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem('world_insights_favorites');
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch { /* ignore parse errors */ }
      }
    };

    window.addEventListener('favorites-updated', handleSync);
    return () => window.removeEventListener('favorites-updated', handleSync);
  }, []);

  return { favorites, toggleFavorite, isFavorite, mounted };
}
