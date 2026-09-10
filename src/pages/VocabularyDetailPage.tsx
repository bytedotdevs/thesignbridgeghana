import React, { useState, useEffect } from 'react';
import { GSLVocabulary } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { useFavorites } from '../context/FavoritesContext';
import {
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Share2,
  BookOpen,
  Layers,
  Sparkles,
  Download,
  Check,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';
import { Badge } from '../components/common/Badge';

interface VocabularyDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectSign: (slug: string) => void;
}

export const VocabularyDetailPage: React.FC<VocabularyDetailPageProps> = ({
  slug,
  onNavigate,
  onSelectSign,
}) => {
  const [vocab, setVocab] = useState<GSLVocabulary | null>(null);
  const [related, setRelated] = useState<GSLVocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const { isFavorite, toggleFavorite, favorites, updateNote, showToast } = useFavorites();

  useEffect(() => {
    async function loadSign() {
      setIsLoading(true);
      try {
        const data = await dictionaryService.getVocabularyBySlug(slug);
        setVocab(data);

        if (data) {
          // Find note if in favorites
          const existingFav = favorites.find((f) => f.id === data.id);
          setNoteText(existingFav?.note || '');

          // Load related words
          const relatedItems = await dictionaryService.getRelatedVocabulary(data.categorySlug, data.slug, 6);
          setRelated(relatedItems);
        }
      } catch (err) {
        console.error('Failed to load vocabulary detail:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSign();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, favorites]);

  if (isLoading) {
    return (
      <div style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div className="app-container" style={{ maxWidth: '960px' }}>
          <div className="skeleton-loading" style={{ height: '40px', width: '200px', borderRadius: '12px', marginBottom: '24px' }} />
          <div className="skeleton-loading" style={{ height: '420px', width: '100%', borderRadius: '24px', marginBottom: '24px' }} />
        </div>
      </div>
    );
  }

  if (!vocab) {
    return (
      <div style={{ paddingTop: '60px', paddingBottom: '80px', textAlign: 'center' }}>
        <div className="app-container" style={{ maxWidth: '600px' }}>
          <FrostedGlassCard style={{ padding: '40px 24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
              Sign Entry Not Found
            </h2>
            <p style={{ color: 'var(--ink-secondary)', marginBottom: '24px' }}>
              We could not find a Ghanaian Sign Language record matching this entry.
            </p>
            <LiquidChromeButton
              variant="primary"
              size="md"
              icon={<ArrowLeft size={16} />}
              onClick={() => onNavigate('/dictionary')}
            >
              Back to Dictionary Browser
            </LiquidChromeButton>
          </FrostedGlassCard>
        </div>
      </div>
    );
  }

  const favorited = isFavorite(vocab.id);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveNote = () => {
    if (!favorited) {
      toggleFavorite({
        id: vocab.id,
        slug: vocab.slug,
        word: vocab.word,
        category: vocab.category,
        image: vocab.image.src,
      });
    }
    updateNote(vocab.id, noteText);
    setIsEditingNote(false);
  };

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container" style={{ maxWidth: '1040px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => onNavigate('/dictionary')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-secondary)',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Dictionary</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink-secondary)',
                cursor: 'pointer',
              }}
            >
              {copiedLink ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Copied Link' : 'Share Sign'}</span>
            </button>

            <button
              onClick={() =>
                toggleFavorite({
                  id: vocab.id,
                  slug: vocab.slug,
                  word: vocab.word,
                  category: vocab.category,
                  image: vocab.image.src,
                })
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: favorited ? 'rgba(239, 68, 68, 0.1)' : '#ffffff',
                border: favorited ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: favorited ? '#ef4444' : 'var(--ink-secondary)',
                cursor: 'pointer',
              }}
            >
              <Heart size={14} fill={favorited ? '#ef4444' : 'none'} />
              <span>{favorited ? 'Saved to Bookmarks' : 'Save Sign'}</span>
            </button>
          </div>
        </div>

        {/* Hero Sign Visual & Definition Split Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            border: '1px solid rgba(220, 230, 245, 0.85)',
            boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.08), inset 0 1px 1px #fff',
            overflow: 'hidden',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '0',
            }}
          >
            {/* Left: Large High-Resolution Sign Illustration Plate */}
            <div
              style={{
                padding: '36px 28px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid rgba(226, 232, 240, 0.8)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxHeight: '380px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <img
                  src={vocab.image.src}
                  alt={vocab.image.alt}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Attribution caption */}
              <div
                style={{
                  marginTop: '16px',
                  fontSize: '12px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>GNAD 3rd Edition Plate</span>
                <span>•</span>
                <span>Book Page {vocab.source.page}</span>
              </div>
            </div>

            {/* Right: Linguistic Information & Description */}
            <div
              style={{
                padding: '36px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
              }}
            >
              <div>
                {/* Category & Letter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <button
                    onClick={() => onNavigate(`/dictionary?category=${vocab.categorySlug}`)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <Badge variant="blue" size="md">
                      {vocab.category}
                    </Badge>
                  </button>
                  <button
                    onClick={() => onNavigate(`/dictionary?letter=${vocab.letter}`)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <Badge variant="chrome" size="md">
                      Letter {vocab.letter}
                    </Badge>
                  </button>
                  <Badge variant="default" size="md">
                    Page {vocab.source.page}
                  </Badge>
                </div>

                {/* Primary Word */}
                <h1
                  style={{
                    fontSize: 'clamp(32px, 4vw, 44px)',
                    fontWeight: 800,
                    color: 'var(--ink-primary)',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.1',
                    marginBottom: '10px',
                  }}
                >
                  {vocab.word}
                </h1>

                {/* Synonyms if any */}
                {vocab.synonyms.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Alternate Forms / Synonyms:</span>
                    {vocab.synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#e2e8f0',
                          color: '#334155',
                          fontWeight: 600,
                        }}
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                )}

                {/* Signing Movement Instructions */}
                <div style={{ marginBottom: '28px' }}>
                  <h3
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--brand-blue)',
                      marginBottom: '8px',
                    }}
                  >
                    GSL Sign Execution Description
                  </h3>
                  <div
                    style={{
                      padding: '18px 22px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid rgba(220, 230, 245, 0.9)',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '16px',
                        color: 'var(--ink-primary)',
                        lineHeight: '1.7',
                        fontWeight: 500,
                      }}
                    >
                      {vocab.definition}
                    </p>
                  </div>
                </div>

                {/* Study Notes Feature */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Edit3 size={14} color="var(--brand-blue)" />
                      <span>My Learning Note</span>
                    </span>
                    {!isEditingNote && (
                      <button
                        onClick={() => setIsEditingNote(true)}
                        style={{ fontSize: '12px', color: 'var(--brand-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {noteText ? 'Edit Note' : '+ Add Note'}
                      </button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write a personal note or mnemonic for this sign..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setIsEditingNote(false)}
                          style={{ padding: '4px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNote}
                          style={{ padding: '4px 12px', borderRadius: '8px', border: 'none', background: 'var(--ink-primary)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : noteText ? (
                    <div style={{ padding: '10px 14px', backgroundColor: 'rgba(254, 243, 199, 0.4)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '13px', color: '#78350f' }}>
                      {noteText}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                      No study note added yet. Click "+ Add Note" to record your notes.
                    </p>
                  )}
                </div>
              </div>

              {/* Source Provenance Footer Box */}
              <div
                style={{
                  marginTop: '32px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#64748b',
                }}
              >
                <span>Source: {vocab.source.title}</span>
                <span>Special Education Division, GES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Signs in Category */}
        {related.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink-primary)' }}>
                Related Signs in {vocab.category}
              </h3>
              <button
                onClick={() => onNavigate(`/dictionary?category=${vocab.categorySlug}`)}
                style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-blue)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View All in Category →
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {related.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectSign(item.slug)}
                  className="glass-card-interactive"
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '120px',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                      padding: '6px',
                    }}
                  >
                    <img
                      src={item.image.src}
                      alt={item.word}
                      loading="lazy"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '4px' }}>
                    {item.word}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    p.{item.source.page}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
