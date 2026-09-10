import React from 'react';
import { Badge } from './Badge';
import { Heart, BookOpen, ShieldCheck, MapPin, ExternalLink, Sparkles } from 'lucide-react';

export const AppFooter: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '60px',
        paddingBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #d32f2f 0%, #fbc02d 50%, #2e7d32 100%)',
        }}
      />

      <div className="app-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src="/favicon.png" alt="Logo" style={{ width: '28px', height: '28px' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>
                SignBridge<span style={{ color: '#60a5fa' }}>Ghana</span>
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>
              The authoritative digital gateway to Ghanaian Sign Language (GSL). Preserving, teaching, and bridging deaf and hearing communities through interactive technology.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Badge variant="chrome" size="sm">
                GNAD & GES Source
              </Badge>
              <Badge variant="ghana" size="sm">
                1,500+ Official Signs
              </Badge>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              Digital Dictionary
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#cbd5e1' }}>
              <li>
                <button
                  onClick={() => onNavigate('/dictionary')}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  Browse Full A–Z Vocabulary
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/categories')}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  24 Thematic GSL Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/alphabet')}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  Fingerspelling & Alphabet
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/numerals')}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  GSL Number Counting
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/favorites')}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  My Saved Bookmarks
                </button>
              </li>
            </ul>
          </div>

          {/* Deaf Education in Ghana */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              Community & Education
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#cbd5e1' }}>
              <li>
                <button
                  onClick={() => onNavigate('/schools')}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  Deaf Schools in Ghana Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/translate')}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  GSL Translation Studio (Camera Feed)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  Editorial & Attribution
                </button>
              </li>
              <li>
                <a
                  href="https://gnadgh.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#93c5fd', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Ghana National Association of the Deaf <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Provenance & Citation */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              Source Provenance
            </h4>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '13px',
                color: '#94a3b8',
                lineHeight: '1.6',
              }}
            >
              <p style={{ marginBottom: '8px', color: '#f1f5f9', fontWeight: 600 }}>
                Ghanaian Sign Language Dictionary
              </p>
              <p>Third Edition (2018). Prepared by the Special Education Division of Ghana Education Service (GES) & GNAD.</p>
              <p style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                Digitized and transformed into structured web data for SignBridgeGhana.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '13px',
            color: '#64748b',
          }}
        >
          <p>© {new Date().getFullYear()} SignBridgeGhana. Dedicated to advancing deaf inclusion in Ghana.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Non-commercial educational platform</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
              Made with <Heart size={14} color="#ef4444" fill="#ef4444" /> for Ghana
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
