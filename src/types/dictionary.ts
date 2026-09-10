export interface GSLVocabulary {
  id: string;
  slug: string;
  word: string;
  primaryWord: string;
  normalizedWord: string;
  letter: string;
  synonyms: string[];
  definition: string;
  category: string;
  categorySlug: string;
  image: {
    src: string;
    alt: string;
  };
  source: {
    title: string;
    page: number;
    pdfPage: number;
  };
}

export interface GSLSearchIndexItem {
  id: string;
  slug: string;
  word: string;
  primaryWord: string;
  normalizedWord: string;
  letter: string;
  category: string;
  categorySlug: string;
  definition: string;
  image: string;
  bookPage: number;
  synonyms: string[];
}

export interface GSLCategory {
  name: string;
  slug: string;
  count: number;
  icon: string;
  sampleWords: string[];
  pageRange: string;
}

export interface GSLDeafSchool {
  id: string;
  name: string;
  location: string;
  region: string;
  type: string;
  details: string;
  sourcePage: number;
}

export interface GSLManifest {
  name: string;
  edition: string;
  publisher: string;
  version: string;
  generatedAt: string;
  totalEntries: number;
  totalCategories: number;
  totalDeafSchools: number;
  specialPlates: string[];
  letterCounts: Record<string, number>;
}

export interface FavoriteItem {
  id: string;
  slug: string;
  word: string;
  category: string;
  image: string;
  savedAt: string;
  note?: string;
}

export interface RecentSearchItem {
  query: string;
  timestamp: string;
  resultCount: number;
}

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortOption = 'alphabetical-asc' | 'alphabetical-desc' | 'page-asc' | 'category';
