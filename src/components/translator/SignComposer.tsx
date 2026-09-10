import React, { useState } from 'react';
import { useDictionary } from '../../context/DictionaryContext';
import { GSLSearchIndexItem } from '../../types/dictionary';
import { Sparkles, Play, ArrowRight, BookOpen, Layers, Type } from 'lucide-react';
import { LiquidChromeButton } from '../common/LiquidChromeButton';
import { Badge } from '../common/Badge';

export const SignComposer: React.FC<{ onSelectSign?: (slug: string) => void }> = ({ onSelectSign }) => {
  const { searchIndex } = useDictionary();
  const [inputText, setInputText] = useState('School family Ghana teacher friend');
  const [composedWords, setComposedWords] = useState<Array<{ word: string; sign: GSLSearchIndexItem | null }>>([]);

  const samplePhrases = [
    'School family Ghana teacher friend',
    'Welcome father mother children home',
    'Brother sister study education book',
    'Happy morning work hospital doctor',
  ];

  const handleCompose = (textToCompose: string) => {
    const words = textToCompose
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
      .filter((w) => w.length > 0);

    const result = words.map((word) => {
      const normalized = word.toLowerCase();
      // Match from search index
      const matched = searchIndex.find(
        (item) =>
          item.normalizedWord === normalized ||
          item.primaryWord.toLowerCase() === normalized ||
          item.synonyms.some((s) => s.toLowerCase() === normalized)
      );
      return {
        word,
        sign: matched || null,
      };
    });

    setComposedWords(result);
  };

  // Run initial composition once searchIndex is available
  React.useEffect(() => {
    if (searchIndex.length > 0 && inputText) {
      handleCompose(inputText);
    }
  }, [searchIndex]);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid rgba(220, 230, 245, 0.8)',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
        padding: '28px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Type size={22} color="var(--brand-blue)" />
            <span>Text to GSL Sign Sequence Composer</span>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Type English words or phrases to generate the corresponding Ghanaian Sign Language sign sequence.
          </p>
        </div>
        <Badge variant="blue" size="md">
          Dictionary Lookup Engine
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
            placeholder="Type words to sequence signs..."
            style={{
              flex: 1,
              minWidth: '240px',
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
            Sequence Signs
          </LiquidChromeButton>
        </div>

        {/* Quick Sample Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Try examples:</span>
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
              "{phrase.slice(0, 24)}..."
            </button>
          ))}
        </div>
      </div>

      {/* Sequenced Sign Output Cards */}
      <div
        style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '18px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)' }}>
            GSL SIGN PLAYLIST ({composedWords.length} SIGNS)
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {composedWords.filter((w) => w.sign).length} Direct Matches • {composedWords.filter((w) => !w.sign).length} Fingerspelling Fallbacks
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '14px',
          }}
        >
          {composedWords.map((item, i) => {
            const hasSign = item.sign !== null;
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
                  border: hasSign ? '1.5px solid rgba(37, 99, 235, 0.3)' : '1.5px dashed #cbd5e1',
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
                    backgroundColor: 'var(--ink-primary)',
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

                <div
                  style={{
                    width: '100%',
                    height: '110px',
                    backgroundColor: '#ffffff',
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
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', padding: '6px' }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#64748b' }}>
                        A–Z
                      </span>
                      Fingerspell Word
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink-primary)', textAlign: 'center' }}>
                  {item.word.toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {hasSign ? item.sign!.category.split(',')[0] : 'Fingerspelling'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
