import React, { useState } from 'react';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';
import { Badge } from '../components/common/Badge';
import { Hash, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';

export const NumeralsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [selectedTab, setSelectedTab] = useState<'1-20' | '30-1000'>('1-20');

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Badge variant="gold" size="sm" icon={<Hash size={14} />} className="mb-2">
            Number System
          </Badge>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Ghanaian Sign Language Numerals (1–1,000)
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Official GSL numerical counting and base numbering plates from Pages 13–14 of the dictionary.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => setSelectedTab('1-20')}
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: selectedTab === '1-20' ? 'var(--ink-primary)' : '#ffffff',
              color: selectedTab === '1-20' ? '#ffffff' : 'var(--ink-secondary)',
              border: selectedTab === '1-20' ? '1px solid var(--ink-primary)' : '1px solid #cbd5e1',
              boxShadow: selectedTab === '1-20' ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Numerals 1 to 20 (Page 13)
          </button>
          <button
            onClick={() => setSelectedTab('30-1000')}
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: selectedTab === '30-1000' ? 'var(--ink-primary)' : '#ffffff',
              color: selectedTab === '30-1000' ? '#ffffff' : 'var(--ink-secondary)',
              border: selectedTab === '30-1000' ? '1px solid var(--ink-primary)' : '1px solid #cbd5e1',
              boxShadow: selectedTab === '30-1000' ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Numerals 30 to 1,000 (Page 14)
          </button>
        </div>

        {/* Numerals Plate Viewer */}
        <FrostedGlassCard style={{ padding: '24px', textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink-primary)' }}>
              {selectedTab === '1-20' ? 'GSL Numbers 1–20' : 'GSL Numbers 30–1,000 & Multipliers'}
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

        {/* Mathematical & Counting Guidance Card */}
        <FrostedGlassCard style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '12px' }}>
            Understanding Number Formation in GSL
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              fontSize: '14px',
              color: 'var(--ink-secondary)',
              lineHeight: '1.6',
            }}
          >
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Base Digits 1–5
              </h4>
              <p>Signs 1 through 5 use the palm facing toward the signer in standard counting contexts, keeping clarity in wrist position.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Numbers 6–9
              </h4>
              <p>Palm flips forward outward, tapping thumb to specific fingers (6: pinky, 7: ring, 8: middle, 9: index).</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Tens & Hundreds
              </h4>
              <p>Numbers 10, 20, 100, and 1,000 utilize compound gestures combining the base numeral with directional hand movements.</p>
            </div>
          </div>
        </FrostedGlassCard>
      </div>
    </div>
  );
};
