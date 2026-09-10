import { FavoriteItem, RecentSearchItem } from '../types/dictionary';

const FAVORITES_KEY = 'signbridge_gsl_favorites_v1';
const RECENT_SEARCHES_KEY = 'signbridge_gsl_recent_searches_v1';
const MAX_RECENT_SEARCHES = 20;

export const storageService = {
  getFavorites(): FavoriteItem[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load favorites from localStorage', e);
      return [];
    }
  },

  isFavorite(id: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some((f) => f.id === id);
  },

  addFavorite(item: Omit<FavoriteItem, 'savedAt'> & { savedAt?: string }): FavoriteItem[] {
    const favorites = this.getFavorites();
    if (!favorites.some((f) => f.id === item.id)) {
      const updated = [
        {
          ...item,
          savedAt: item.savedAt || new Date().toISOString(),
        },
        ...favorites,
      ];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save favorite', e);
      }
      return updated;
    }
    return favorites;
  },

  removeFavorite(id: string): FavoriteItem[] {
    const favorites = this.getFavorites();
    const updated = favorites.filter((f) => f.id !== id);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove favorite', e);
    }
    return updated;
  },

  updateFavoriteNote(id: string, note: string): FavoriteItem[] {
    const favorites = this.getFavorites();
    const updated = favorites.map((f) => (f.id === id ? { ...f, note } : f));
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update favorite note', e);
    }
    return updated;
  },

  getRecentSearches(): RecentSearchItem[] {
    try {
      const data = localStorage.getItem(RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load recent searches', e);
      return [];
    }
  },

  addRecentSearch(query: string, resultCount: number): RecentSearchItem[] {
    const trimmed = query.trim();
    if (!trimmed) return this.getRecentSearches();

    const searches = this.getRecentSearches().filter(
      (s) => s.query.toLowerCase() !== trimmed.toLowerCase()
    );

    const updated = [
      {
        query: trimmed,
        timestamp: new Date().toISOString(),
        resultCount,
      },
      ...searches,
    ].slice(0, MAX_RECENT_SEARCHES);

    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent search', e);
    }
    return updated;
  },

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.error('Failed to clear recent searches', e);
    }
  },

  exportFavoritesJson(): string {
    const favorites = this.getFavorites();
    return JSON.stringify(favorites, null, 2);
  },

  importFavoritesJson(jsonStr: string): FavoriteItem[] {
    try {
      const items = JSON.parse(jsonStr);
      if (Array.isArray(items)) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
        return items;
      }
    } catch (e) {
      console.error('Invalid JSON for favorites import', e);
    }
    return this.getFavorites();
  },
};
