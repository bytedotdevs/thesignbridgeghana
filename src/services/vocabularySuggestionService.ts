/**
 * VocabularySuggestionService — Context-Aware & Typo-Tolerant GSL Matcher
 *
 * Provides:
 *  - Fast Levenshtein distance & phonetic string similarity
 *  - Typo correction with confidence scoring
 *  - Semantic & category-based related vocabulary recommendations
 *  - Number recognition (digits, compound numbers, English number words)
 */

import { GSLSearchIndexItem } from '../types/dictionary';

export interface VocabularySuggestion {
  item: GSLSearchIndexItem;
  similarity: number; // 0..1
  matchType: 'exact' | 'typo-correction' | 'synonym' | 'related-category';
  reason: string;
}

export interface SuggestionResult {
  originalQuery: string;
  bestMatch: GSLSearchIndexItem | null;
  isTypo: boolean;
  resolvedWord: string;
  confidence: number;
  suggestions: VocabularySuggestion[];
  categoryContext?: string;
  isNumber?: boolean;
  numberValue?: number;
}

/**
 * Fast Levenshtein distance between two normalized strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = new Int32Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) row[j] = j;

  for (let i = 1; i <= a.length; i++) {
    let prevDiag = row[0];
    row[0] = i;
    const charA = a.charCodeAt(i - 1);

    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      const charB = b.charCodeAt(j - 1);
      const cost = charA === charB ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prevDiag + cost);
      prevDiag = temp;
    }
  }

  return row[b.length];
}

/**
 * Generates a phonetic sound key for fuzzy, phonetic typo matching
 * (e.g. skool -> skul, school -> skul, fone -> fon, phone -> fon).
 */
export function phoneticKey(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/ph/g, 'f')
    .replace(/gh/g, 'f')
    .replace(/sch/g, 'sk')
    .replace(/ch(?=[aeiouyrl])/g, 'k')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c/g, 'k')
    .replace(/ck/g, 'k')
    .replace(/q/g, 'k')
    .replace(/oo/g, 'u')
    .replace(/ee/g, 'i')
    .replace(/ea/g, 'i')
    .replace(/([a-z])\1+/g, '$1');
}

/**
 * Normalized string similarity score between 0 and 1.
 * Accounts for edit distance, prefix match, phonetic sound match, and substring containment.
 */
export function calculateSimilarity(input: string, target: string): number {
  const a = input.toLowerCase().trim();
  const b = target.toLowerCase().trim();

  if (a === b) return 1.0;
  if (!a.length || !b.length) return 0.0;

  // Exact substring containment bonus
  if (b.includes(a)) {
    return Math.min(1.0, Math.max(0.75, a.length / b.length));
  }
  if (a.includes(b)) {
    return Math.min(1.0, Math.max(0.70, b.length / a.length));
  }

  const maxLen = Math.max(a.length, b.length);
  const dist = levenshteinDistance(a, b);
  const baseSim = 1 - dist / maxLen;

  // Prefix match bonus
  let prefixBonus = 0;
  const minLen = Math.min(a.length, b.length, 3);
  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) prefixBonus += 0.05;
    else break;
  }

  // Phonetic sound match bonus
  const pkA = phoneticKey(a);
  const pkB = phoneticKey(b);
  if (pkA === pkB && pkA.length > 2) {
    return Math.min(1.0, Math.max(0.92, baseSim + 0.25));
  }

  return Math.min(1.0, Math.max(0.0, baseSim + prefixBonus));
}

// ── Number Words Map ────────────────────────────────────────────────────────
export const NUMBER_WORD_MAP: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
};

/**
 * Checks if a string represents a number (numeric digits or English number word).
 */
export function parseNumberInput(raw: string): number | null {
  const clean = raw.trim().toLowerCase();
  if (/^\d+$/.test(clean)) {
    const val = parseInt(clean, 10);
    return isNaN(val) ? null : val;
  }
  if (NUMBER_WORD_MAP[clean] !== undefined) {
    return NUMBER_WORD_MAP[clean];
  }
  return null;
}

/**
 * Match a user search term against the GSL search index with typo awareness
 * and returns close/similar vocabulary suggestions.
 */
export function matchCloseVocabulary(
  query: string,
  searchIndex: GSLSearchIndexItem[],
  maxSuggestions = 6
): SuggestionResult {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  // Check if query is a number
  const numVal = parseNumberInput(trimmed);
  if (numVal !== null) {
    return {
      originalQuery: trimmed,
      bestMatch: null,
      isTypo: false,
      resolvedWord: `${numVal}`,
      confidence: 1.0,
      suggestions: [],
      isNumber: true,
      numberValue: numVal,
    };
  }

  if (!trimmed || !searchIndex.length) {
    return {
      originalQuery: trimmed,
      bestMatch: null,
      isTypo: false,
      resolvedWord: trimmed,
      confidence: 0,
      suggestions: [],
    };
  }

  // 1. Direct exact match check
  const exactMatch = searchIndex.find(
    (item) =>
      item.normalizedWord === lower ||
      item.primaryWord.toLowerCase() === lower ||
      item.word.toLowerCase() === lower
  );

  if (exactMatch) {
    // Find related words from the same category
    const categoryRelated = searchIndex
      .filter(
        (i) =>
          i.categorySlug === exactMatch.categorySlug &&
          i.slug !== exactMatch.slug
      )
      .slice(0, maxSuggestions)
      .map((item) => ({
        item,
        similarity: 0.85,
        matchType: 'related-category' as const,
        reason: `Related in ${exactMatch.category || 'Category'}`,
      }));

    return {
      originalQuery: trimmed,
      bestMatch: exactMatch,
      isTypo: false,
      resolvedWord: exactMatch.primaryWord,
      confidence: 1.0,
      suggestions: categoryRelated,
      categoryContext: exactMatch.category,
    };
  }

  // 2. Synonym match check
  const synonymMatch = searchIndex.find((item) =>
    item.synonyms?.some((syn) => syn.toLowerCase() === lower)
  );

  if (synonymMatch) {
    return {
      originalQuery: trimmed,
      bestMatch: synonymMatch,
      isTypo: false,
      resolvedWord: synonymMatch.primaryWord,
      confidence: 0.95,
      suggestions: [
        {
          item: synonymMatch,
          similarity: 0.95,
          matchType: 'synonym',
          reason: `Synonym for "${trimmed}"`,
        },
      ],
      categoryContext: synonymMatch.category,
    };
  }

  // 3. Typo-tolerant / Fuzzy scoring across entire dictionary
  const scoredCandidates: {
    item: GSLSearchIndexItem;
    similarity: number;
    matchType: 'typo-correction' | 'synonym' | 'related-category';
    reason: string;
  }[] = [];

  for (const item of searchIndex) {
    const normSim = calculateSimilarity(lower, item.normalizedWord);
    const primSim = calculateSimilarity(lower, item.primaryWord);

    let maxItemSim = Math.max(normSim, primSim);
    let reason = `Spelling match (${Math.round(maxItemSim * 100)}%)`;

    // Check synonyms
    if (item.synonyms && item.synonyms.length > 0) {
      for (const syn of item.synonyms) {
        const sSim = calculateSimilarity(lower, syn);
        if (sSim > maxItemSim) {
          maxItemSim = sSim;
          reason = `Similar to synonym "${syn}"`;
        }
      }
    }

    if (maxItemSim >= 0.52) {
      scoredCandidates.push({
        item,
        similarity: maxItemSim,
        matchType: 'typo-correction',
        reason,
      });
    }
  }

  // Sort descending by similarity
  scoredCandidates.sort((a, b) => b.similarity - a.similarity);

  const bestCandidate = scoredCandidates[0] || null;
  const isTypo = bestCandidate !== null && bestCandidate.similarity >= 0.60;

  // Collect top suggestions
  const topSuggestions: VocabularySuggestion[] = [];
  const seenSlugs = new Set<string>();

  for (const cand of scoredCandidates) {
    if (seenSlugs.has(cand.item.slug)) continue;
    seenSlugs.add(cand.item.slug);
    topSuggestions.push(cand);
    if (topSuggestions.length >= maxSuggestions) break;
  }

  return {
    originalQuery: trimmed,
    bestMatch: isTypo ? bestCandidate.item : null,
    isTypo,
    resolvedWord: isTypo ? bestCandidate.item.primaryWord : trimmed,
    confidence: bestCandidate ? bestCandidate.similarity : 0,
    suggestions: topSuggestions,
    categoryContext: bestCandidate?.item.category,
  };
}

/**
 * Given a full sentence or multi-word input, analyzes each word and returns
 * individual word resolutions and close vocabulary suggestions.
 */
export function resolveSentenceVocabularies(
  text: string,
  searchIndex: GSLSearchIndexItem[]
): {
  words: {
    original: string;
    resolved: GSLSearchIndexItem | null;
    isTypo: boolean;
    isNumber: boolean;
    numberVal?: number;
    closeSuggestions: GSLSearchIndexItem[];
  }[];
  allSuggestions: VocabularySuggestion[];
} {
  const rawWords = text
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9'-]/g, ''))
    .filter((w) => w.length > 0);

  const allSuggestionsMap = new Map<string, VocabularySuggestion>();

  const words = rawWords.map((word) => {
    const res = matchCloseVocabulary(word, searchIndex, 4);

    res.suggestions.forEach((s) => {
      if (!allSuggestionsMap.has(s.item.slug)) {
        allSuggestionsMap.set(s.item.slug, s);
      }
    });

    return {
      original: word,
      resolved: res.bestMatch,
      isTypo: res.isTypo,
      isNumber: !!res.isNumber,
      numberVal: res.numberValue,
      closeSuggestions: res.suggestions.map((s) => s.item),
    };
  });

  return {
    words,
    allSuggestions: Array.from(allSuggestionsMap.values()).slice(0, 8),
  };
}
