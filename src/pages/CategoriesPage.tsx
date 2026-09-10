import React from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { Badge } from '../components/common/Badge';
import { Layers, ArrowRight, BookOpen } from 'lucide-react';

export const CategoriesPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { categories, manifest } = useDictionary();

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container">
        <div style={{ marginBottom: '32px' }}>
          <Badge variant="blue" size="sm" icon={<Layers size={14} />} className="mb-2">
            Thematic Classification
          </Badge>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
            24 Thematic GSL Vocabulary Categories
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Explore Ghanaian Sign Language organized into 24 official thematic chapters from the 3rd Edition dictionary.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {categories.map((cat, idx) => (
            <div
              key={cat.slug}
              onClick={() => onNavigate(`/dictionary?category=${cat.slug}`)}
              className="glass-card-interactive"
              style={{
                padding: '24px',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--ink-primary)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <Badge variant="blue" size="sm">
                    {cat.count} Signs
                  </Badge>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '8px' }}>
                  {cat.name}
                </h3>

                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  Sample vocabulary: {cat.sampleWords.join(', ')}...
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--brand-blue)',
                }}
              >
                <span>{cat.pageRange}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Browse Category</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
