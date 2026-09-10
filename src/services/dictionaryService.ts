import {
  GSLVocabulary,
  GSLSearchIndexItem,
  GSLCategory,
  GSLDeafSchool,
  GSLManifest,
} from '../types/dictionary';

class DictionaryService {
  private indexCache: GSLSearchIndexItem[] | null = null;
  private categoriesCache: GSLCategory[] | null = null;
  private manifestCache: GSLManifest[] | GSLManifest | null = null;
  private schoolsCache: GSLDeafSchool[] | null = null;
  private letterVocabCache: Map<string, GSLVocabulary[]> = new Map();
  private allVocabCache: GSLVocabulary[] | null = null;

  async getManifest(): Promise<GSLManifest> {
    if (this.manifestCache && !Array.isArray(this.manifestCache)) {
      return this.manifestCache;
    }
    const res = await fetch('/data/dictionary/manifest.json');
    if (!res.ok) {
      throw new Error(`Failed to load manifest (${res.status})`);
    }
    const data: GSLManifest = await res.json();
    this.manifestCache = data;
    return data;
  }

  async getSearchIndex(): Promise<GSLSearchIndexItem[]> {
    if (this.indexCache) {
      return this.indexCache;
    }
    const res = await fetch('/data/dictionary/index.json');
    if (!res.ok) {
      throw new Error(`Failed to load search index (${res.status})`);
    }
    const data: GSLSearchIndexItem[] = await res.json();
    this.indexCache = data;
    return data;
  }

  async getCategories(): Promise<GSLCategory[]> {
    if (this.categoriesCache) {
      return this.categoriesCache;
    }
    const res = await fetch('/data/dictionary/categories.json');
    if (!res.ok) {
      throw new Error(`Failed to load categories (${res.status})`);
    }
    const data: GSLCategory[] = await res.json();
    this.categoriesCache = data;
    return data;
  }

  async getDeafSchools(): Promise<GSLDeafSchool[]> {
    if (this.schoolsCache) {
      return this.schoolsCache;
    }
    const res = await fetch('/data/dictionary/schools.json');
    if (!res.ok) {
      throw new Error(`Failed to load deaf schools (${res.status})`);
    }
    const data: GSLDeafSchool[] = await res.json();
    this.schoolsCache = data;
    return data;
  }

  async getVocabularyByLetter(letter: string): Promise<GSLVocabulary[]> {
    const key = letter.toUpperCase();
    if (this.letterVocabCache.has(key)) {
      return this.letterVocabCache.get(key)!;
    }

    const fname = key === '#' ? '0-9.json' : `${key.toLowerCase()}.json`;
    const res = await fetch(`/data/dictionary/vocabulary/${fname}`);
    if (!res.ok) {
      console.warn(`Could not load vocabulary for letter ${key}`);
      return [];
    }
    const data: GSLVocabulary[] = await res.json();
    this.letterVocabCache.set(key, data);
    return data;
  }

  async getVocabularyBySlug(slug: string): Promise<GSLVocabulary | null> {
    // Check if we have search index
    const index = await this.getSearchIndex();
    const item = index.find((i) => i.slug === slug || i.id === slug || i.id === `gsl-${slug}`);
    if (!item) return null;

    const letterVocab = await this.getVocabularyByLetter(item.letter);
    const fullEntry = letterVocab.find((v) => v.slug === item.slug || v.id === item.id);
    return fullEntry || null;
  }

  async getAllVocabulary(): Promise<GSLVocabulary[]> {
    if (this.allVocabCache) {
      return this.allVocabCache;
    }

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
    const promises = letters.map((letterChar) => this.getVocabularyByLetter(letterChar));
    const results = await Promise.all(promises);
    const combined = results.flat();
    this.allVocabCache = combined;
    return combined;
  }

  async getRelatedVocabulary(categorySlug: string, currentSlug: string, limit = 4): Promise<GSLVocabulary[]> {
    const all = await this.getAllVocabulary();
    return all
      .filter((v) => v.categorySlug === categorySlug && v.slug !== currentSlug)
      .slice(0, limit);
  }
}

export const dictionaryService = new DictionaryService();
