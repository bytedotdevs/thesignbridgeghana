import React, { useState, useEffect } from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { SearchBar } from '../components/dictionary/SearchBar';
import { AlphabetRibbon } from '../components/dictionary/AlphabetRibbon';
import { CategoryPills } from '../components/dictionary/CategoryPills';
import { VocabularyGrid } from '../components/dictionary/VocabularyGrid';
import { ViewMode, SortOption, GSLSearchIndexItem } from '../types/dictionary';
import {
  Grid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  X,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const DictionaryPage: React.FC<{
  onSelectSign: (item: GSLSearchIndexItem) => void;
  initialCategory?: string | null;
  initialLetter?: string | null;
}> = ({ onSelectSign, initialCategory, initialLetter }) => {
  const {
    filteredResults,
    totalResultsCount,
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
    resetFilters,
    isLoading,
    categories,
  } = useDictionary();

  // Set initial filters from URL params if present
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    if (initialLetter) {
      setSelectedLetter(initialLetter.toUpperCase());
    }
  }, [initialCategory, initialLetter]);

  const hasActiveFilters = searchQuery || selectedLetter || selectedCategory;

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Header Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Badge variant="blue" size="sm">
              Official Dictionary Browser
            </Badge>
            {currentCategoryObj && (
              <Badge variant="gold" size="sm">
                Category: {currentCategoryObj.name}
              </Badge>
            )}
            {selectedLetter && (
              <Badge variant="emerald" size="sm">
                Letter: {selectedLetter}
              </Badge>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Ghanaian Sign Language Vocabulary
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Browse and search all 1,516 official GSL signs with illustrations and step-by-step hand movement descriptions.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <SearchBar size="md" onSelectResult={onSelectSign} />
        </div>

        {/* Alphabet Ribbon */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            padding: '8px 14px',
            border: '1px solid rgba(220, 230, 245, 0.8)',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            marginBottom: '16px',
          }}
        >
          <AlphabetRibbon />
        </div>

        {/* Category Pills */}
        <CategoryPills />

        {/* Controls & Active Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '14px 18px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(220, 230, 245, 0.8)',
            marginBottom: '24px',
          }}
        >
          {/* Results Count & Active Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              {totalResultsCount} {totalResultsCount === 1 ? 'Sign' : 'Signs'} Found
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  cursor: 'pointer',
                }}
              >
                <X size={12} />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>

          {/* Sort & View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="#64748b" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ink-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Sort vocabulary"
              >
                <option value="alphabetical-asc">A to Z (Alphabetical)</option>
                <option value="alphabetical-desc">Z to A (Reverse)</option>
                <option value="page-asc">Book Page Order</option>
                <option value="category">Group by Category</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(241, 245, 249, 0.9)',
                borderRadius: '10px',
                padding: '3px',
                border: '1px solid #cbd5e1',
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--ink-primary)' : '#64748b',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                  color: viewMode === 'list' ? 'var(--ink-primary)' : '#64748b',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Vocabulary Items Grid */}
        <VocabularyGrid
          items={filteredResults}
          isLoading={isLoading}
          viewMode={viewMode}
          onSelectItem={onSelectSign}
          onResetFilters={resetFilters}
        />
      </div>
    </div>
  );
};
