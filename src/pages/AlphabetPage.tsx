import React from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';
import { Badge } from '../components/common/Badge';
import { Grid, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';

export const AlphabetPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { manifest } = useDictionary();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Badge variant="blue" size="sm" icon={<Grid size={14} />} className="mb-2">
            Fingerspelling & Handshapes
          </Badge>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Ghanaian Sign Language Alphabet (A–Z)
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Official GSL manual alphabet and fingerspelling charts from the 3rd Edition dictionary.
          </p>
        </div>

        {/* Alphabet Plate Hero Visual */}
        <div style={{ marginBottom: '40px' }}>
          <FrostedGlassCard style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink-primary)' }}>
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

        {/* Interactive Alphabet Tiles Grid */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink-primary)' }}>
              Interactive Letter Directory
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Click any letter to browse corresponding GSL signs
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '12px',
            }}
          >
            {letters.map((letterChar) => {
              const count = manifest?.letterCounts?.[letterChar] ?? 0;
              return (
                <div
                  key={letterChar}
                  onClick={() => onNavigate(`/dictionary?letter=${letterChar}`)}
                  className="glass-card-interactive"
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '32px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-display)',
                      color: 'var(--ink-primary)',
                      lineHeight: '1',
                      marginBottom: '6px',
                    }}
                  >
                    {letterChar}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: 'var(--brand-blue)',
                    }}
                  >
                    {count} {count === 1 ? 'Sign' : 'Signs'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fingerspelling & Handshapes Reference Plates */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          <FrostedGlassCard style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '12px' }}>
              Fingerspelling Guide (Page 8)
            </h3>
            <div
              style={{
                width: '100%',
                height: '340px',
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
                height: '340px',
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
      </div>
    </div>
  );
};
