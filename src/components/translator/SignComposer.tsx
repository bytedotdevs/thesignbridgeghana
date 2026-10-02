import React, { useState, useCallback } from 'react';
import { useDictionary } from '../../context/DictionaryContext';
import { GSLSearchIndexItem } from '../../types/dictionary';
import { Sparkles, ArrowRight, BookOpen, Layers, Type, Hash, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LiquidChromeButton } from '../common/LiquidChromeButton';
import { Badge } from '../common/Badge';
import {
  matchCloseVocabulary,
  parseNumberInput,
  type VocabularySuggestion,
} from '../../services/vocabularySuggestionService';

interface ComposedEntry {
  word: string;
  sign: GSLSearchIndexItem | null;
  isTypo: boolean;
  isNumber: boolean;
  numberVal?: number;
  isFingerspell: boolean;
  confidence: number;
  suggestion?: string; // If typo: what it resolved to
}

const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const SignComposer: React.FC<{ onSelectSign?: (slug: string) => void }> = ({ onSelectSign }) => {
  const { searchIndex } = useDictionary();
  const [inputText, setInputText] = useState('School family Ghana teacher friend');
  const [composedWords, setComposedWords] = useState<ComposedEntry[]>([]);
  const [suggestions, setSuggestions] = useState<VocabularySuggestion[]>([]);
  const [showFingerspellRef, setShowFingerspellRef] = useState(false);

  const samplePhrases = [
    'School family Ghana teacher friend',
    'Welcome father mother children home',
    'Brother sister study education book',
    'Happy morning work hospital doctor',
    'Hello my name is Ghana',
    'I love you thank you please',
  ];

  const handleCompose = useCallback(
    (textToCompose: string) => {
      if (!searchIndex.length) return;

      const words = textToCompose
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z0-9'-]/g, ''))
        .filter((w) => w.length > 0);

      const allSuggestionsMap = new Map<string, VocabularySuggestion>();
      const result: ComposedEntry[] = words.map((word) => {
        const lower = word.toLowerCase();

        // Check if it's a number
        const numVal = parseNumberInput(lower);
        if (numVal !== null) {
          return {
            word,
            sign: null,
            isTypo: false,
            isNumber: true,
            numberVal: numVal,
            isFingerspell: false,
            confidence: 1.0,
          };
        }

        // Use intelligent vocabulary matching
        const result = matchCloseVocabulary(word, searchIndex, 4);

        // Collect suggestions
        result.suggestions.forEach((s) => {
          if (!allSuggestionsMap.has(s.item.slug)) {
            allSuggestionsMap.set(s.item.slug, s);
          }
        });

        const isFingerspell = result.bestMatch === null && !result.isNumber;
        return {
          word,
          sign: result.bestMatch,
          isTypo: result.isTypo,
          isNumber: false,
          isFingerspell,
          confidence: result.confidence,
          suggestion: result.isTypo ? result.resolvedWord : undefined,
        };
      });

      setComposedWords(result);
      setSuggestions(Array.from(allSuggestionsMap.values()).slice(0, 8));
    },
    [searchIndex]
  );

  // Run initial composition once searchIndex is available
  React.useEffect(() => {
    if (searchIndex.length > 0 && inputText) {
      handleCompose(inputText);
    }
  }, [searchIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const directMatches = composedWords.filter((w) => w.sign && !w.isTypo).length;
  const typoMatches = composedWords.filter((w) => w.isTypo).length;
  const numberCount = composedWords.filter((w) => w.isNumber).length;
  const fingerspellCount = composedWords.filter((w) => w.isFingerspell).length;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid rgba(220, 230, 245, 0.8)',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
        padding: 'clamp(16px, 4vw, 28px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: 'var(--ink-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Type size={22} color="var(--brand-blue)" />
            <span>Sign Sequence Composer</span>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Type any English text — intelligent dictionary matching, typo correction &amp; fingerspelling fallback.
          </p>
        </div>
        <Badge variant="blue" size="md">
          AI-Powered Lookup
        </Badge>
      </div>

      {/* Input area */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompose(inputText)}
            placeholder="Type words to sequence GSL signs..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 18px',
              borderRadius: '9999px',
              border: '1.5px solid rgba(200, 215, 235, 0.9)',
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--ink-primary)',
              outline: 'none',
              backgroundColor: '#f8fafc',
            }}
          />
          <LiquidChromeButton
            variant="primary"
            size="md"
            icon={<Sparkles size={16} />}
            onClick={() => handleCompose(inputText)}
          >
            Compose
          </LiquidChromeButton>
        </div>

        {/* Quick Sample Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Try:</span>
          {samplePhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(phrase);
                handleCompose(phrase);
              }}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(241, 245, 249, 0.9)',
                border: '1px solid #cbd5e1',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              &ldquo;{phrase.slice(0, 22)}&hellip;&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      {composedWords.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            padding: '10px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <span style={{ color: 'var(--brand-blue)' }}>📖 {directMatches} Direct Match{directMatches !== 1 ? 'es' : ''}</span>
          {typoMatches > 0 && <span style={{ color: '#f59e0b' }}>✏️ {typoMatches} Typo-Corrected</span>}
          {numberCount > 0 && <span style={{ color: '#6366f1' }}>🔢 {numberCount} Number{numberCount !== 1 ? 's' : ''}</span>}
          {fingerspellCount > 0 && <span style={{ color: '#ec4899' }}>✋ {fingerspellCount} Fingerspelled</span>}
        </div>
      )}

      {/* Sequenced Sign Output Cards */}
      {composedWords.length > 0 && (
        <div
          style={{
            padding: 'clamp(12px, 3vw, 20px)',
            backgroundColor: '#f8fafc',
            borderRadius: '18px',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              GSL SIGN PLAYLIST ({composedWords.length} SIGNS)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px',
            }}
          >
            {composedWords.map((item, i) => {
              const hasSign = item.sign !== null;
              const cardBorderColor = item.isTypo
                ? 'rgba(245, 158, 11, 0.4)'
                : item.isNumber
                ? 'rgba(99, 102, 241, 0.4)'
                : item.isFingerspell
                ? 'rgba(236, 72, 153, 0.35)'
                : hasSign
                ? 'rgba(37, 99, 235, 0.3)'
                : '1.5px dashed #cbd5e1';

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (item.sign && onSelectSign) {
                      onSelectSign(item.sign.slug);
                    }
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: `1.5px solid ${cardBorderColor}`,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: hasSign ? 'pointer' : 'default',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* Step badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '9999px',
                      backgroundColor: item.isTypo ? '#f59e0b' : item.isNumber ? '#6366f1' : item.isFingerspell ? '#ec4899' : 'var(--ink-primary)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </span>

                  {/* Typo correction indicator */}
                  {item.isTypo && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        fontSize: '10px',
                        color: '#f59e0b',
                        fontWeight: 700,
                      }}
                      title={`Corrected to: ${item.suggestion}`}
                    >
                      ✏️
                    </span>
                  )}

                  {/* Image / fallback display */}
                  <div
                    style={{
                      width: '100%',
                      height: '90px',
                      backgroundColor: item.isFingerspell ? 'rgba(236,72,153,0.04)' : item.isNumber ? 'rgba(99,102,241,0.04)' : '#ffffff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      marginBottom: '8px',
                      padding: '4px',
                    }}
                  >
                    {hasSign ? (
                      <img
                        src={item.sign!.image}
                        alt={item.word}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : item.isNumber ? (
                      <div style={{ textAlign: 'center', color: '#6366f1' }}>
                        <Hash size={28} />
                        <div style={{ fontSize: '20px', fontWeight: 900, marginTop: '2px' }}>
                          {item.numberVal}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#ec4899', letterSpacing: '2px' }}>
                          {item.word.toUpperCase().slice(0, 8)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>A–Z fingerspell</div>
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink-primary)', textAlign: 'center', wordBreak: 'break-word' }}>
                    {item.word.toUpperCase()}
                  </span>
                  {item.isTypo && item.suggestion && (
                    <span style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px', textAlign: 'center' }}>
                      → {item.suggestion}
                    </span>
                  )}
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', textAlign: 'center' }}>
                    {item.isNumber
                      ? 'GSL Number'
                      : item.isFingerspell
                      ? 'Fingerspelling'
                      : item.sign?.category?.split(',')[0] || 'Sign'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestions from dictionary */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: '10px' }}>
            Related vocabulary you might also need:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  if (onSelectSign) onSelectSign(s.item.slug);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(37,99,235,0.06)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  color: 'var(--brand-blue)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s.item.primaryWord}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fingerspelling A-Z Quick Reference */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '16px',
        }}
      >
        <button
          onClick={() => setShowFingerspellRef(!showFingerspellRef)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#475569',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <Layers size={16} />
          {showFingerspellRef ? 'Hide' : 'Show'} Fingerspelling A–Z Quick Reference
          <span style={{ marginLeft: '4px', fontSize: '16px' }}>
            {showFingerspellRef ? '▴' : '▾'}
          </span>
        </button>

        {showFingerspellRef && (
          <div
            style={{
              marginTop: '14px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', fontWeight: 600 }}>
              Official GSL Alphabet (Plate 8 — 3rd Edition Dictionary)
            </p>
            <img
              src="/data/dictionary/images/plates/alphabet.webp"
              alt="GSL Fingerspelling A-Z"
              style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: '10px', backgroundColor: '#ffffff' }}
            />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
              When a word is not in the GSL dictionary, the avatar will automatically fingerspell each letter using these official handshapes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
