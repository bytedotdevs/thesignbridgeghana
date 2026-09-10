import React from 'react';
import { GSLSearchIndexItem } from '../../types/dictionary';
import { useFavorites } from '../../context/FavoritesContext';
import { Heart, BookOpen, ArrowUpRight, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';

interface VocabularyCardProps {
  item: GSLSearchIndexItem;
  onClick: (item: GSLSearchIndexItem) => void;
  onQuickView?: (item: GSLSearchIndexItem) => void;
  viewMode?: 'grid' | 'list' | 'compact';
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  onClick,
  onQuickView,
  viewMode = 'grid',
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(item.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: item.id,
      slug: item.slug,
      word: item.word,
      category: item.category,
      image: item.image,
    });
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onClick(item)}
        className="glass-card-interactive animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          gap: '20px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: 0 }}>
          {/* Sign Thumbnail */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(220, 230, 245, 0.9)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            <img
              src={item.image}
              alt={item.word}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLElement).style.opacity = '0.3';
              }}
            />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)' }}>
                {item.word}
              </h3>
              <Badge variant="blue" size="sm">
                {item.category}
              </Badge>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                Page {item.bookPage}
              </span>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--ink-secondary)',
                lineHeight: '1.5',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.definition}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={handleFavoriteClick}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '9999px',
              backgroundColor: favorited ? 'rgba(239, 68, 68, 0.1)' : 'rgba(240, 243, 248, 0.8)',
              border: favorited ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(210, 225, 245, 0.7)',
              color: favorited ? '#ef4444' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={favorited ? '#ef4444' : 'none'} />
          </button>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '9999px',
              backgroundColor: 'var(--ink-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div
      onClick={() => onClick(item)}
      className="glass-card-interactive animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        cursor: 'pointer',
        height: '100%',
      }}
    >
      {/* Sign Illustration Plate */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '190px',
          borderRadius: '14px',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(220, 232, 248, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          marginBottom: '16px',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <img
          src={item.image}
          alt={`Sign for ${item.word}`}
          loading="lazy"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transition: 'transform 0.25s ease',
          }}
          onError={(e) => {
            (e.target as HTMLElement).style.opacity = '0.3';
          }}
        />

        {/* Favorite Bookmark Button */}
        <button
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '32px',
            height: '32px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(220, 230, 245, 0.8)',
            color: favorited ? '#ef4444' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.15s ease',
            zIndex: 10,
          }}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} fill={favorited ? '#ef4444' : 'none'} />
        </button>

        {/* Book Page Badge */}
        <span
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(241, 245, 249, 0.92)',
            color: '#64748b',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(203, 213, 225, 0.7)',
          }}
        >
          p.{item.bookPage}
        </span>
      </div>

      {/* Title & Category */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 800,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.02em',
            lineHeight: '1.3',
          }}
        >
          {item.word}
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            color: 'var(--brand-blue)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {item.category.split(',')[0]}
        </span>
      </div>

      {/* Description Snippet */}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--ink-secondary)',
          lineHeight: '1.5',
          marginBottom: '16px',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {item.definition}
      </p>

      {/* Footer Link */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--brand-blue)',
        }}
      >
        <span>View Full Sign</span>
        <ArrowUpRight size={16} />
      </div>
    </div>
  );
};
