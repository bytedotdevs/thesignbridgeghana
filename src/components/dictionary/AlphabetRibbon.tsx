import React, { useRef } from 'react';
import { useDictionary } from '../../context/DictionaryContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const AlphabetRibbon: React.FC = () => {
  const { selectedLetter, setSelectedLetter, manifest } = useDictionary();
  const scrollRef = useRef<HTMLDivElement>(null);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        margin: '16px 0',
      }}
    >
      <button
        onClick={() => handleScroll('left')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '9999px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          zIndex: 10,
          flexShrink: 0,
        }}
        aria-label="Scroll alphabet ribbon left"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          padding: '6px 10px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flex: 1,
        }}
        className="alphabet-scroll-track"
      >
        <button
          onClick={() => setSelectedLetter(null)}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            backgroundColor: selectedLetter === null ? 'var(--ink-primary)' : 'rgba(255, 255, 255, 0.8)',
            color: selectedLetter === null ? '#ffffff' : 'var(--ink-secondary)',
            border: selectedLetter === null ? '1px solid var(--ink-primary)' : '1px solid rgba(200, 215, 235, 0.7)',
            boxShadow: selectedLetter === null ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
          }}
        >
          All (A–Z)
        </button>

        {letters.map((letterChar) => {
          const isSelected = selectedLetter === letterChar;
          const count = manifest?.letterCounts?.[letterChar] ?? 0;
          const isDisabled = count === 0;

          return (
            <button
              key={letterChar}
              disabled={isDisabled}
              onClick={() => setSelectedLetter(isSelected ? null : letterChar)}
              title={`${letterChar} (${count} signs)`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: isSelected ? 800 : 600,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                backgroundColor: isSelected ? 'var(--ink-primary)' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--ink-primary)',
                border: isSelected ? '1px solid var(--ink-primary)' : '1px solid rgba(200, 215, 235, 0.7)',
                boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <span>{letterChar}</span>
              {count > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    opacity: isSelected ? 0.85 : 0.6,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => handleScroll('right')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '9999px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          zIndex: 10,
          flexShrink: 0,
        }}
        aria-label="Scroll alphabet ribbon right"
      >
        <ChevronRight size={16} />
      </button>

      <style>{`
        .alphabet-scroll-track::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
