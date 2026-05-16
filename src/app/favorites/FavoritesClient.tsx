"use client";

import { useEffect, useState, useCallback } from "react";
import { Country } from "@/types/country";
import { useFavorites } from "@/hooks/useFavorites";
import CountryCard from "@/components/CountryCard";
import { Heart, Scale, X, Plus, FolderOpen, Check, FolderPlus } from "lucide-react";
import Link from "next/link";

interface CollectionDef {
  name: string;
  items: string[];
}

export default function FavoritesClient() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, mounted } = useFavorites();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCollections, setShowCollections] = useState(false);
  const [collections, setCollections] = useState<CollectionDef[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [addingToCollection, setAddingToCollection] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,cca3,region,population,area");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setCountries(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCountries();
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("world_insights_collections");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCollections(parsed);
      }
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persistCollections = useCallback((updated: CollectionDef[]) => {
    setCollections(updated);
    localStorage.setItem("world_insights_collections", JSON.stringify(updated));
  }, []);

  const createCollection = () => {
    const name = newCollectionName.trim();
    if (!name || collections.some((c) => c.name === name)) return;
    persistCollections([...collections, { name, items: [] }]);
    setNewCollectionName("");
  };

  const deleteCollection = (name: string) => {
    persistCollections(collections.filter((c) => c.name !== name));
    if (addingToCollection === name) setAddingToCollection(null);
  };

  const addSelectedToCollection = (collectionName: string) => {
    const col = collections.find((c) => c.name === collectionName);
    if (!col) return;
    const merged = [...new Set([...col.items, ...selectedIds])];
    persistCollections(collections.map((c) => c.name === collectionName ? { ...c, items: merged } : c));
    setSelectedIds(new Set());
    setAddingToCollection(null);
  };

  const removeFromCollection = (collectionName: string, cca3: string) => {
    persistCollections(collections.map((c) =>
      c.name === collectionName ? { ...c, items: c.items.filter((id) => id !== cca3) } : c
    ));
  };

  const toggleSelect = (cca3: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cca3)) next.delete(cca3);
      else next.add(cca3);
      return next;
    });
  };

  if (!mounted || loading) {
    return (
      <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-glow" />
        </div>
      </main>
    );
  }

  const favoriteCountries = countries.filter((c) => favorites.includes(c.cca3));
  const hasSelection = selectedIds.size > 0;

  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="mb-8 border-b border-white/5 pb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-text-primary sm:text-4xl font-instrument-serif">My Favorites</h2>
            <p className="mt-2 text-muted font-sora">{favoriteCountries.length} countr{favoriteCountries.length === 1 ? "y" : "ies"} saved.</p>
          </div>

          {favoriteCountries.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowCollections(!showCollections)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all font-sora ${
                  showCollections
                    ? "bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20"
                    : "bg-white/[0.05] border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/[0.08]"
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Collections</span>
              </button>
            </div>
          )}
        </div>

        {showCollections && (
          <div className="mb-8 rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4 font-sora">Manage Collections</h3>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="New collection name..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createCollection()}
                className="flex-1 h-10 rounded-xl bg-white/[0.03] border border-white/10 px-4 text-sm text-text-primary placeholder:text-muted focus:outline-none focus:border-cyan-glow/50 font-sora"
              />
              <button
                onClick={createCollection}
                className="px-5 h-10 rounded-xl bg-cyan-glow text-atlas-950 text-sm font-bold font-sora hover:bg-cyan-glow/80 transition-all"
              >
                Create
              </button>
            </div>

            {collections.length === 0 && (
              <p className="text-sm text-muted font-sora">No collections yet. Create one above.</p>
            )}

            <div className="space-y-4">
              {collections.map((col) => {
                const colCountries = favoriteCountries.filter((c) => col.items.includes(c.cca3));
                return (
                  <div key={col.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FolderPlus className="h-4 w-4 text-cyan-glow" />
                        <span className="text-sm font-semibold text-text-primary font-sora">{col.name}</span>
                        <span className="text-xs text-muted font-sora">{col.items.length} countr{col.items.length === 1 ? "y" : "ies"}</span>
                      </div>
                      <div className="flex gap-2">
                        {hasSelection && (
                          <button
                            onClick={() => addSelectedToCollection(col.name)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-glow/10 text-cyan-glow text-xs font-medium hover:bg-cyan-glow/20 transition-all font-sora"
                          >
                            Add Selected ({selectedIds.size})
                          </button>
                        )}
                        <button
                          onClick={() => deleteCollection(col.name)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {colCountries.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {colCountries.map((c) => (
                          <div key={c.cca3} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 font-sora group">
                            <span className="text-sm text-text-secondary">{c.name.common}</span>
                            <button
                              onClick={() => removeFromCollection(col.name, c.cca3)}
                              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {colCountries.length === 0 && (
                      <p className="text-xs text-muted font-sora">Empty. Select countries below and add them here.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {favoriteCountries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Heart className="h-16 w-16 text-muted mb-4" />
            <h3 className="text-2xl font-bold text-text-primary mb-2 font-sora">No favorites yet</h3>
            <p className="text-muted mb-6 font-sora">Click the heart icon on any country to save it.</p>
            <Link href="/countries" className="px-6 py-3 bg-cyan-glow text-atlas-950 rounded-xl font-bold font-sora transition-all hover:bg-cyan-glow/80">
              Explore Countries
            </Link>
          </div>
        ) : (
          <>
            {hasSelection && (
              <div className="mb-6 rounded-xl border border-cyan-glow/20 bg-cyan-glow/5 p-4 flex items-center justify-between animate-in fade-in">
                <span className="text-sm font-medium text-cyan-glow font-sora">{selectedIds.size} selected</span>
                <div className="flex gap-2">
                  {collections.length > 0 && (
                    <button
                      onClick={() => setAddingToCollection(addingToCollection ? null : collections[0]?.name || null)}
                      className="px-4 py-2 rounded-lg bg-cyan-glow/10 text-cyan-glow text-sm font-medium hover:bg-cyan-glow/20 transition-all font-sora"
                    >
                      Add to Collection
                    </button>
                  )}
                  <Link
                    href={`/compare?countries=${Array.from(selectedIds).join(",")}`}
                    className="px-4 py-2 rounded-lg bg-cyan-glow text-atlas-950 text-sm font-bold hover:bg-cyan-glow/80 transition-all font-sora flex items-center gap-2"
                  >
                    <Scale className="h-4 w-4" /> Compare
                  </Link>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="px-4 py-2 rounded-lg text-sm text-muted hover:text-text-primary transition-all font-sora"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {favoriteCountries.map((country) => {
                const isSelected = selectedIds.has(country.cca3);
                return (
                  <div key={country.cca3} className="relative group">
                    <button
                      onClick={() => toggleSelect(country.cca3)}
                      className={`absolute top-3 left-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all font-sora border ${
                          isSelected
                            ? "bg-cyan-glow text-atlas-950 border-cyan-glow"
                            : "bg-black/40 text-white/60 border-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                    <CountryCard country={country} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
