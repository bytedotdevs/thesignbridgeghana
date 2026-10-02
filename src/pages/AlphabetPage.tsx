import React, { useState } from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';
import { Badge } from '../components/common/Badge';
import { Grid, BookOpen, ArrowRight, Sparkles, Hand, Info } from 'lucide-react';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';

// GSL fingerspelling descriptions from official dictionary plate 8
const LETTER_DESCRIPTIONS: Record<string, string> = {
  A: 'Fist with thumb alongside index finger',
  B: 'Flat hand, four fingers extended, thumb folded in',
  C: 'Curved C-shape, thumb opposite fingers',
  D: 'Index finger up, others curved to meet thumb',
  E: 'Fingers bent to mid-joint, thumb tucked under',
  F: 'Index+thumb touch forming circle, other three up',
  G: 'Index and thumb point sideways, others closed',
  H: 'Index+middle extended horizontally, palm sideways',
  I: 'Pinky finger only extended, fist for others',
  J: 'Like I, then trace a J-curve downward',
  K: 'Index up, middle bent, thumb between them',
  L: 'L-shape: thumb up, index pointing forward',
  M: 'Three fingers (index+middle+ring) over thumb',
  N: 'Two fingers (index+middle) over thumb',
  O: 'All fingers curved to meet thumb tip (O-shape)',
  P: 'Like K but pointing downward',
  Q: 'Index+thumb pinch pointing downward',
  R: 'Index+middle crossed, thumb slightly extended',
  S: 'Tight fist with thumb over fingers',
  T: 'Thumb between index and middle (T-shape)',
  U: 'Index+middle extended upward together',
  V: 'Index+middle extended and spread (V/peace)',
  W: 'Index+middle+ring extended (W/3)',
  X: 'Index finger hooked/crooked',
  Y: 'Thumb + pinky extended, others folded',
  Z: 'Index points, traces Z in the air',
};

export const AlphabetPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { manifest } = useDictionary();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showPlate, setShowPlate] = useState(true);

  return (
    <div style={{ paddingTop: 'clamp(16px, 4vw, 32px)', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Header */}
        <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <Badge variant="blue" size="sm" icon={<Grid size={14} />} className="mb-2">
            Fingerspelling &amp; Handshapes
          </Badge>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 40px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Ghanaian Sign Language Alphabet (A–Z)
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Official GSL manual alphabet and fingerspelling charts from the 3rd Edition dictionary.
            Click any letter to see its description and dictionary signs.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPlate(true)}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: showPlate ? 'var(--ink-primary)' : '#ffffff',
              color: showPlate ? '#ffffff' : 'var(--ink-secondary)',
              border: showPlate ? '1px solid var(--ink-primary)' : '1px solid #cbd5e1',
              transition: 'all 0.15s ease',
            }}
          >
            📋 Full Alphabet Plate
          </button>
          <button
            onClick={() => setShowPlate(false)}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: !showPlate ? 'var(--ink-primary)' : '#ffffff',
              color: !showPlate ? '#ffffff' : 'var(--ink-secondary)',
              border: !showPlate ? '1px solid var(--ink-primary)' : '1px solid #cbd5e1',
              transition: 'all 0.15s ease',
            }}
          >
            ✋ Interactive Letters
          </button>
        </div>

        {/* Alphabet Plate Hero Visual */}
        {showPlate && (
          <div style={{ marginBottom: '40px' }}>
            <FrostedGlassCard style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  Official GSL Alphabet Visual Chart (Page 12)
                </span>
                <Badge variant="ghana" size="sm">
                  Authentic Dictionary Plate
                </Badge>
              </div>

              <div
                style={{
                  width: '100%',
                  maxHeight: '600px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(220, 230, 245, 0.9)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <img
                  src="/data/dictionary/images/plates/alphabet.webp"
                  alt="GSL Alphabet A-Z Plate"
                  style={{ maxWidth: '100%', maxHeight: '560px', objectFit: 'contain' }}
                />
              </div>
            </FrostedGlassCard>
          </div>
        )}

        {/* Interactive Alphabet Tiles Grid */}
        {!showPlate && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
                Interactive Letter Cards
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Tap any letter to see its GSL handshape description
              </span>
            </div>

            {/* Selected Letter Detail */}
            {selectedLetter && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '20px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  border: '1.5px solid rgba(37, 99, 235, 0.18)',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '18px',
                      backgroundColor: 'var(--ink-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {selectedLetter}
                  </div>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '4px' }}>
                      Letter {selectedLetter} — Fingerspelling Handshape
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: '1.5' }}>
                      {LETTER_DESCRIPTIONS[selectedLetter]}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <LiquidChromeButton
                    variant="primary"
                    size="sm"
                    icon={<BookOpen size={14} />}
                    onClick={() => onNavigate(`/dictionary?letter=${selectedLetter}`)}
                  >
                    View {selectedLetter} Signs
                  </LiquidChromeButton>
                  <LiquidChromeButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLetter(null)}
                  >
                    Close
                  </LiquidChromeButton>
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(110px, 100%), 1fr))',
                gap: '10px',
              }}
            >
              {letters.map((letterChar) => {
                const count = manifest?.letterCounts?.[letterChar] ?? 0;
                const isSelected = selectedLetter === letterChar;
                return (
                  <div
                    key={letterChar}
                    onClick={() => setSelectedLetter(isSelected ? null : letterChar)}
                    className="glass-card-interactive"
                    style={{
                      padding: 'clamp(10px, 2vw, 16px)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isSelected ? '2px solid var(--brand-blue)' : '1.5px solid transparent',
                      backgroundColor: isSelected ? 'rgba(37,99,235,0.06)' : undefined,
                      transition: 'all 0.15s ease',
                      touchAction: 'manipulation',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'clamp(24px, 5vw, 32px)',
                        fontWeight: 800,
                        fontFamily: 'var(--font-display)',
                        color: isSelected ? 'var(--brand-blue)' : 'var(--ink-primary)',
                        lineHeight: '1',
                        marginBottom: '6px',
                      }}
                    >
                      {letterChar}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                        color: 'var(--brand-blue)',
                      }}
                    >
                      {count} Sign{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fingerspelling & Handshapes Reference Plates */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <FrostedGlassCard style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '12px' }}>
              Fingerspelling Guide (Page 8)
            </h3>
            <div
              style={{
                width: '100%',
                height: 'clamp(220px, 40vw, 340px)',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '12px',
              }}
            >
              <img
                src="/data/dictionary/images/plates/fingerspelling.webp"
                alt="Fingerspelling Chart"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </FrostedGlassCard>

          <FrostedGlassCard style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '12px' }}>
              Common Handshapes (Page 7)
            </h3>
            <div
              style={{
                width: '100%',
                height: 'clamp(220px, 40vw, 340px)',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '12px',
              }}
            >
              <img
                src="/data/dictionary/images/plates/common-handshapes.webp"
                alt="Common Handshapes Chart"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </FrostedGlassCard>
        </div>

        {/* Call-to-Action */}
        <FrostedGlassCard style={{ padding: '24px', textAlign: 'center' }}>
          <Hand size={32} style={{ color: 'var(--brand-blue)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '8px' }}>
            Practice Fingerspelling with the Avatar
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', marginBottom: '18px', maxWidth: '500px', margin: '0 auto 18px' }}>
            Type any word in the Text-to-Sign translator. If it's not in the dictionary, 
            the avatar will automatically fingerspell it letter by letter using official GSL handshapes.
          </p>
          <LiquidChromeButton
            variant="primary"
            size="md"
            icon={<ArrowRight size={16} />}
            onClick={() => onNavigate('/translate')}
          >
            Try the Sign Translator
          </LiquidChromeButton>
        </FrostedGlassCard>
      </div>
    </div>
  );
};
