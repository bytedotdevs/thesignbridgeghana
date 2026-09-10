import React, { createContext, useContext, useState, useEffect } from 'react';
import { FavoriteItem, RecentSearchItem } from '../types/dictionary';
import { storageService } from '../services/storageService';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  recentSearches: RecentSearchItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: { id: string; slug: string; word: string; category: string; image: string }) => void;
  updateNote: (id: string, note: string) => void;
  clearHistory: () => void;
  exportFavorites: () => void;
  importFavorites: (jsonStr: string) => boolean;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setFavorites(storageService.getFavorites());
    setRecentSearches(storageService.getRecentSearches());
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some((f) => f.id === id);
  };

  const toggleFavorite = (item: { id: string; slug: string; word: string; category: string; image: string }) => {
    if (isFavorite(item.id)) {
      const updated = storageService.removeFavorite(item.id);
      setFavorites(updated);
      showToast(`Removed "${item.word}" from favorites`, 'info');
    } else {
      const updated = storageService.addFavorite(item);
      setFavorites(updated);
      showToast(`Saved "${item.word}" to favorites! ⭐`, 'success');
    }
  };

  const updateNote = (id: string, note: string) => {
    const updated = storageService.updateFavoriteNote(id, note);
    setFavorites(updated);
    showToast('Note updated successfully', 'success');
  };

  const clearHistory = () => {
    storageService.clearRecentSearches();
    setRecentSearches([]);
    showToast('Search history cleared', 'info');
  };

  const exportFavorites = () => {
    const jsonStr = storageService.exportFavoritesJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signbridge-gsl-favorites-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Favorites exported successfully', 'success');
  };

  const importFavorites = (jsonStr: string): boolean => {
    try {
      const updated = storageService.importFavoritesJson(jsonStr);
      setFavorites(updated);
      showToast(`Imported ${updated.length} favorites`, 'success');
      return true;
    } catch {
      showToast('Failed to import favorites. Invalid format.', 'error');
      return false;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        recentSearches,
        isFavorite,
        toggleFavorite,
        updateNote,
        clearHistory,
        exportFavorites,
        importFavorites,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
