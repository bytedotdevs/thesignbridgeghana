import React, { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { Heart, Trash2, Download, Upload, ArrowRight, BookOpen, Edit3, ArrowUpRight } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';

export const FavoritesPage: React.FC<{
  onNavigate: (path: string) => void;
  onSelectSign: (slug: string) => void;
}> = ({ onNavigate, onSelectSign }) => {
  const { favorites, toggleFavorite, updateNote, exportFavorites, importFavorites } = useFavorites();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const handleStartEdit = (id: string, currentNote: string = '') => {
    setEditingId(id);
    setNoteInput(currentNote);
  };

  const handleSaveNote = (id: string) => {
    updateNote(id, noteInput);
    setEditingId(null);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const text = await file.text();
        importFavorites(text);
      }
    };
    input.click();
  };

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <Badge variant="emerald" size="sm" icon={<Heart size={14} fill="#10b981" />} className="mb-2">
              My Saved Signs ({favorites.length})
            </Badge>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
              Saved GSL Vocabulary & Study Notes
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
              Your personal collection of bookmarked signs and custom study notes, saved locally on your device.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {favorites.length > 0 && (
              <LiquidChromeButton
                variant="secondary"
                size="sm"
                icon={<Download size={14} />}
                onClick={exportFavorites}
              >
                Export JSON
              </LiquidChromeButton>
            )}
            <LiquidChromeButton
              variant="subtle"
              size="sm"
              icon={<Upload size={14} />}
              onClick={handleImportClick}
            >
              Import JSON
            </LiquidChromeButton>
          </div>
        </div>

        {favorites.length === 0 ? (
          <FrostedGlassCard style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '540px', margin: '40px auto' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Heart size={32} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              No Saved Signs Yet
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              Click the heart icon on any dictionary card or sign detail page to save it to your bookmarks for quick offline study.
            </p>
            <LiquidChromeButton
              variant="primary"
              size="md"
              icon={<BookOpen size={16} />}
              onClick={() => onNavigate('/dictionary')}
            >
              Browse GSL Dictionary
            </LiquidChromeButton>
          </FrostedGlassCard>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {favorites.map((item) => (
              <div
                key={item.id}
                className="glass-card-interactive"
                style={{
                  padding: '20px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Image */}
                  <div
                    onClick={() => onSelectSign(item.slug)}
                    style={{
                      width: '100%',
                      height: '160px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      marginBottom: '14px',
                      cursor: 'pointer',
                      padding: '8px',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.word}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Title & Category */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3
                      onClick={() => onSelectSign(item.slug)}
                      style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)', cursor: 'pointer' }}
                    >
                      {item.word}
                    </h3>
                    <Badge variant="blue" size="sm">
                      {item.category.split(',')[0]}
                    </Badge>
                  </div>

                  {/* Note Section */}
                  <div style={{ marginTop: '10px' }}>
                    {editingId === item.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Add a study note..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(item.id)}
                            style={{ padding: '2px 8px', borderRadius: '6px', border: 'none', background: 'var(--ink-primary)', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : item.note ? (
                      <div
                        onClick={() => handleStartEdit(item.id, item.note)}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'rgba(254, 243, 199, 0.4)',
                          borderRadius: '8px',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          fontSize: '12px',
                          color: '#78350f',
                          cursor: 'pointer',
                        }}
                        title="Click to edit note"
                      >
                        📝 {item.note}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item.id, '')}
                        style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        + Add study note
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Action Row */}
                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <button
                    onClick={() => toggleFavorite(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>

                  <button
                    onClick={() => onSelectSign(item.slug)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-blue)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>View Sign</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
