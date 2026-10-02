import React, { useState } from 'react';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';
import { Badge } from '../components/common/Badge';
import { Hash, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';

// GSL number descriptions derived from dictionary Plates 13-14
const NUMBER_DESCRIPTIONS: Record<number, string> = {
  0: 'Circular O-shape with index and thumb, then twist wrist',
  1: 'Index finger pointing upward, others folded',
  2: 'Index and middle fingers extended (peace/V)',
  3: 'Thumb, index, and middle extended (3 count)',
  4: 'Four fingers extended, thumb folded across palm',
  5: 'Open hand, all five fingers spread',
  6: 'Thumb touches pinky, other fingers extended',
  7: 'Thumb touches ring finger, other fingers extended',
  8: 'Thumb touches middle finger, index and others extended',
  9: 'Thumb touches index finger (O-shape/pinch), others extended',
  10: 'Fist with thumb up, shake or pivot wrist',
  11: 'Flick index finger upward twice',
  12: 'Flick index and middle fingers upward twice',
  13: 'Three fingers flick downward (13 pattern)',
  14: 'Four fingers flick downward',
  15: 'Five fingers (open hand) flick downward',
  16: 'Thumb touches pinky, flick/twist motion',
  17: 'Thumb touches ring, flick/twist motion',
  18: 'Thumb touches middle, flick/twist motion',
  19: 'Thumb touches index (pinch), flick/twist motion',
  20: 'V/peace sign then bend fingers (20 compound)',
  30: 'Three fingers then closed fist motion',
  40: 'Four fingers then fist',
  50: 'Open five then fist twist',
  60: '6-shape then fist motion',
  70: '7-shape + directional motion',
  80: '8-shape + directional motion',
  90: '9-shape (pinch) + directional motion',
  100: 'C-shape or 1 then 00 formation — "one hundred"',
  1000: '1 then sweep to flat palm — "one thousand"',
};

const NUMBERED_CARDS_1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const NUMBERED_CARDS_2 = [20, 30, 40, 50, 60, 70, 80, 90, 100, 1000];

export const NumeralsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [selectedTab, setSelectedTab] = useState<'1-20' | '30-1000'>('1-20');
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [showInteractive, setShowInteractive] = useState(false);

  const currentCards = selectedTab === '1-20' ? NUMBERED_CARDS_1 : NUMBERED_CARDS_2;

  return (
    <div style={{ paddingTop: 'clamp(16px, 4vw, 32px)', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Header */}
        <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <Badge variant="gold" size="sm" icon={<Hash size={14} />} className="mb-2">
            Number System
          </Badge>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 40px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Ghanaian Sign Language Numerals (0–1,000)
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Official GSL numerical counting and base numbering plates from Pages 13–14 of the dictionary.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowInteractive(false)}
            style={{
              padding: '8px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              backgroundColor: !showInteractive ? 'var(--ink-primary)' : '#ffffff',
              color: !showInteractive ? '#ffffff' : 'var(--ink-secondary)',
              border: !showInteractive ? '1px solid var(--ink-primary)' : '1px solid #cbd5e1',
              transition: 'all 0.15s ease',
            }}
          >
            📋 Official Plates
          </button>
          <button
            onClick={() => setShowInteractive(true)}
            style={{
              padding: '8px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              backgroundColor: showInteractive ? 'var(--ink-primary)' : '#ffffff',
              color: showInteractive ? '#ffffff' : 'var(--ink-secondary)',
              border: showInteractive ? '1px solid var(--ink-primary)' : '1px solid #cbd5e1',
              transition: 'all 0.15s ease',
            }}
          >
            🔢 Interactive Number Cards
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => setSelectedTab('1-20')}
            style={{
              padding: '8px 20px', borderRadius: '9999px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              backgroundColor: selectedTab === '1-20' ? 'var(--ink-primary)' : '#ffffff',
              color: selectedTab === '1-20' ? '#ffffff' : 'var(--ink-secondary)',
              border: selectedTab === '1-20' ? '1px solid var(--ink-primary)' : '1px solid #cbd5e1',
              boxShadow: selectedTab === '1-20' ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Numerals 0–19 (Page 13)
          </button>
          <button
            onClick={() => setSelectedTab('30-1000')}
            style={{
              padding: '8px 20px', borderRadius: '9999px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              backgroundColor: selectedTab === '30-1000' ? 'var(--ink-primary)' : '#ffffff',
              color: selectedTab === '30-1000' ? '#ffffff' : 'var(--ink-secondary)',
              border: selectedTab === '30-1000' ? '1px solid var(--ink-primary)' : '1px solid #cbd5e1',
              boxShadow: selectedTab === '30-1000' ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Numerals 20–1,000 (Page 14)
          </button>
        </div>

        {/* Official Plate Viewer */}
        {!showInteractive && (
          <FrostedGlassCard style={{ padding: '24px', textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
                {selectedTab === '1-20' ? 'GSL Numbers 0–19' : 'GSL Numbers 20–1,000 & Multipliers'}
              </span>
              <Badge variant="ghana" size="sm">
                Official Plate {selectedTab === '1-20' ? 'Page 13' : 'Page 14'}
              </Badge>
            </div>

            <div
              style={{
                width: '100%',
                maxHeight: '650px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(220, 230, 245, 0.9)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <img
                src={
                  selectedTab === '1-20'
                    ? '/data/dictionary/images/plates/numerals-1.webp'
                    : '/data/dictionary/images/plates/numerals-2.webp'
                }
                alt="GSL Numerals Plate"
                style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
              />
            </div>
          </FrostedGlassCard>
        )}

        {/* Interactive Number Cards */}
        {showInteractive && (
          <div style={{ marginBottom: '40px' }}>
            {/* Selected number detail */}
            {selectedNum !== null && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '20px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(99, 102, 241, 0.04)',
                  border: '1.5px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: selectedNum >= 100 ? '22px' : '36px',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {selectedNum}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '4px' }}>
                      Number {selectedNum.toLocaleString()} — GSL Sign Description
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: '1.5' }}>
                      {NUMBER_DESCRIPTIONS[selectedNum] ?? 'See the official GSL dictionary plate for this number\'s sign.'}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <LiquidChromeButton
                    variant="primary"
                    size="sm"
                    icon={<Sparkles size={14} />}
                    onClick={() => onNavigate('/translate')}
                  >
                    Sign {selectedNum} in Translator
                  </LiquidChromeButton>
                  <LiquidChromeButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNum(null)}
                  >
                    Close
                  </LiquidChromeButton>
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100px, 100%), 1fr))',
                gap: '10px',
              }}
            >
              {currentCards.map((num) => {
                const isSelected = selectedNum === num;
                return (
                  <div
                    key={num}
                    onClick={() => setSelectedNum(isSelected ? null : num)}
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
                      border: isSelected ? '2px solid #6366f1' : '1.5px solid transparent',
                      backgroundColor: isSelected ? 'rgba(99,102,241,0.06)' : undefined,
                      transition: 'all 0.15s ease',
                      touchAction: 'manipulation',
                      minHeight: '80px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: num >= 1000 ? '18px' : num >= 100 ? '22px' : 'clamp(22px, 4vw, 30px)',
                        fontWeight: 900,
                        color: isSelected ? '#6366f1' : 'var(--ink-primary)',
                        lineHeight: '1',
                        marginBottom: '6px',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {num.toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        backgroundColor: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.07)',
                        color: '#6366f1',
                      }}
                    >
                      GSL
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mathematical & Counting Guidance Card */}
        <FrostedGlassCard style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
          <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '12px' }}>
            Understanding Number Formation in GSL
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
              gap: '16px',
              fontSize: '14px',
              color: 'var(--ink-secondary)',
              lineHeight: '1.6',
            }}
          >
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Base Digits 0–5
              </h4>
              <p>Signs 1 through 5 use the palm facing toward the signer. Zero uses an O-shape with wrist rotation. Clear wrist position is key to readability.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Numbers 6–9
              </h4>
              <p>Palm flips outward. Thumb taps each remaining finger: 6=pinky, 7=ring, 8=middle, 9=index. Creates a distinctive pinch-and-extend motion.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                10–19 (Teen Numbers)
              </h4>
              <p>Numbers 11–19 use a flicking or bending motion on the base digit. 10 is a fist with thumb up and a pivot. 13–19 follow similar twisting patterns.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Tens, Hundreds &amp; Thousands
              </h4>
              <p>Numbers 20, 100, and 1,000 utilize compound gestures combining the base numeral with directional hand movements or two-handed signs for multipliers.</p>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <LiquidChromeButton
              variant="primary"
              size="md"
              icon={<ArrowRight size={16} />}
              onClick={() => onNavigate('/translate')}
            >
              Try Number Signing in Translator
            </LiquidChromeButton>
          </div>
        </FrostedGlassCard>
      </div>
    </div>
  );
};
