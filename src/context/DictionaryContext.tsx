import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  GSLSearchIndexItem,
  GSLCategory,
  GSLDeafSchool,
  GSLManifest,
  ViewMode,
  SortOption,
} from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { searchService } from '../services/searchService';
import { storageService } from '../services/storageService';

interface DictionaryContextType {
  manifest: GSLManifest | null;
  categories: GSLCategory[];
  schools: GSLDeafSchool[];
  searchIndex: GSLSearchIndexItem[];
  isLoading: boolean;
  error: string | null;
  
  // Search & Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLetter: string | null;
  setSelectedLetter: (letter: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (categorySlug: string | null) => void;
  
  // View & Sorting
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;

  // Filtered & Searched Results
  filteredResults: GSLSearchIndexItem[];
  totalResultsCount: number;
  
  // Helper Actions
  resetFilters: () => void;
  getRandomSign: () => GSLSearchIndexItem | null;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export const DictionaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manifest, setManifest] = useState<GSLManifest | null>(null);
  const [categories, setCategories] = useState<GSLCategory[]>([]);
  const [schools, setSchools] = useState<GSLDeafSchool[]>([]);
  const [searchIndex, setSearchIndex] = useState<GSLSearchIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('alphabetical-asc');

  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);
        setError(null);

        const [manifestData, indexData, categoriesData, schoolsData] = await Promise.all([
          dictionaryService.getManifest(),
          dictionaryService.getSearchIndex(),
          dictionaryService.getCategories(),
          dictionaryService.getDeafSchools(),
        ]);

        setManifest(manifestData);
        setSearchIndex(indexData);
        setCategories(categoriesData);
        setSchools(schoolsData);

        // Initialize Search Index
        searchService.init(indexData);
      } catch (err: any) {
        console.error('Error initializing dictionary data:', err);
        setError(err.message || 'Failed to load dictionary data.');
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  // Compute filtered results
  const filteredResults = useMemo(() => {
    if (!searchIndex.length) return [];

    let results = searchService.search(searchQuery, {
      categorySlug: selectedCategory || undefined,
      letter: selectedLetter || undefined,
    });

    // Apply Sorting
    results = [...results].sort((a, b) => {
      if (sortOption === 'alphabetical-asc') {
        return a.primaryWord.localeCompare(b.primaryWord);
      }
      if (sortOption === 'alphabetical-desc') {
        return b.primaryWord.localeCompare(a.primaryWord);
      }
      if (sortOption === 'page-asc') {
        return a.bookPage - b.bookPage;
      }
      if (sortOption === 'category') {
        return a.category.localeCompare(b.category) || a.primaryWord.localeCompare(b.primaryWord);
      }
      return 0;
    });

    return results;
  }, [searchIndex, searchQuery, selectedLetter, selectedCategory, sortOption]);

  // Track recent search on non-empty query
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        storageService.addRecentSearch(searchQuery.trim(), filteredResults.length);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filteredResults.length]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLetter(null);
    setSelectedCategory(null);
  };

  const getRandomSign = (): GSLSearchIndexItem | null => {
    if (!searchIndex.length) return null;
    const randomIndex = Math.floor(Math.random() * searchIndex.length);
    return searchIndex[randomIndex];
  };

  return (
    <DictionaryContext.Provider
      value={{
        manifest,
        categories,
        schools,
        searchIndex,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        selectedLetter,
        setSelectedLetter,
        selectedCategory,
        setSelectedCategory,
        viewMode,
        setViewMode,
        sortOption,
        setSortOption,
        filteredResults,
        totalResultsCount: filteredResults.length,
        resetFilters,
        getRandomSign,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};
