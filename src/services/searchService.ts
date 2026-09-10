import MiniSearch from 'minisearch';
import { GSLSearchIndexItem } from '../types/dictionary';

export interface SearchOptions {
  categorySlug?: string;
  letter?: string;
  limit?: number;
}

class SearchService {
  private miniSearch: MiniSearch<GSLSearchIndexItem> | null = null;
  private items: GSLSearchIndexItem[] = [];

  init(items: GSLSearchIndexItem[]) {
    this.items = items;
    this.miniSearch = new MiniSearch<GSLSearchIndexItem>({
      fields: ['primaryWord', 'word', 'normalizedWord', 'synonyms', 'definition', 'category'],
      storeFields: [
        'id',
        'slug',
        'word',
        'primaryWord',
        'normalizedWord',
        'letter',
        'category',
        'categorySlug',
        'definition',
        'image',
        'bookPage',
        'synonyms',
      ],
      searchOptions: {
        boost: { primaryWord: 3, word: 2.5, synonyms: 2, category: 1.2 },
        prefix: true,
        fuzzy: 0.2,
      },
    });

    this.miniSearch.addAll(items);
  }

  search(query: string, options: SearchOptions = {}): GSLSearchIndexItem[] {
    const trimmed = query.trim();

    // If query is empty, return filtered by category / letter
    if (!trimmed) {
      let filtered = [...this.items];
      if (options.categorySlug) {
        filtered = filtered.filter((i) => i.categorySlug === options.categorySlug);
      }
      if (options.letter) {
        filtered = filtered.filter((i) => i.letter.toUpperCase() === options.letter?.toUpperCase());
      }
      return options.limit ? filtered.slice(0, options.limit) : filtered;
    }

    if (!this.miniSearch) {
      // Fallback simple search
      const q = trimmed.toLowerCase();
      let results = this.items.filter(
        (i) =>
          i.normalizedWord.includes(q) ||
          i.word.toLowerCase().includes(q) ||
          i.synonyms.some((s) => s.toLowerCase().includes(q)) ||
          i.definition.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );

      if (options.categorySlug) {
        results = results.filter((i) => i.categorySlug === options.categorySlug);
      }
      if (options.letter) {
        results = results.filter((i) => i.letter.toUpperCase() === options.letter?.toUpperCase());
      }
      return options.limit ? results.slice(0, options.limit) : results;
    }

    // MiniSearch query
    const searchResults = this.miniSearch.search(trimmed, {
      filter: (result) => {
        if (options.categorySlug && result.categorySlug !== options.categorySlug) {
          return false;
        }
        if (options.letter && result.letter.toUpperCase() !== options.letter.toUpperCase()) {
          return false;
        }
        return true;
      },
    });

    // Cast and deduplicate
    const matched = searchResults.map((r) => {
      const { ...item } = r;
      return item as unknown as GSLSearchIndexItem;
    });

    // Boost exact matches to the top
    const exact = matched.filter(
      (m) =>
        m.normalizedWord === trimmed.toLowerCase() ||
        m.word.toLowerCase() === trimmed.toLowerCase() ||
        m.synonyms.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    );
    const nonExact = matched.filter(
      (m) =>
        m.normalizedWord !== trimmed.toLowerCase() &&
        m.word.toLowerCase() !== trimmed.toLowerCase() &&
        !m.synonyms.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    );

    const ordered = [...exact, ...nonExact];
    return options.limit ? ordered.slice(0, options.limit) : ordered;
  }
}

export const searchService = new SearchService();
