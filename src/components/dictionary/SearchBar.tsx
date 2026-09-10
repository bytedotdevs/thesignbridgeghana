import React, { useState, useRef, useEffect } from 'react';
import { useDictionary } from '../../context/DictionaryContext';
import { Search, X, ArrowRight, BookOpen, Layers, CornerDownLeft } from 'lucide-react';
import { GSLSearchIndexItem } from '../../types/dictionary';

interface SearchBarProps {
  onSelectResult?: (item: GSLSearchIndexItem) => void;
  autoFocus?: boolean;
  size?: 'md' | 'lg';
  showDropdown?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectResult,
  autoFocus = false,
  size = 'md',
  showDropdown = true,
}) => {
  const { searchQuery, setSearchQuery, filteredResults } = useDictionary();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global '/' keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !isOpen || !filteredResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < Math.min(filteredResults.length - 1, 7) ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.min(filteredResults.length - 1, 7)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredResults[selectedIndex];
      if (selected && onSelectResult) {
        onSelectResult(selected);
        setIsOpen(false);
      }
    }
  };

  const previewResults = filteredResults.slice(0, 8);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: size === 'lg' ? '720px' : '540px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '9999px',
          border: '1.5px solid rgba(190, 205, 230, 0.8)',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.2s ease',
          padding: size === 'lg' ? '6px 8px 6px 20px' : '4px 6px 4px 16px',
        }}
        className="search-input-wrapper"
      >
        <Search
          size={size === 'lg' ? 22 : 18}
          color="var(--brand-blue)"
          style={{ flexShrink: 0, marginRight: '12px' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder="Search 1,500+ Ghanaian signs (e.g. School, Family, Accra)..."
          aria-label="Search Ghanaian Sign Language Dictionary"
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: size === 'lg' ? '17px' : '15px',
            color: 'var(--ink-primary)',
            fontWeight: 500,
          }}
        />

        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
            style={{
              padding: '6px',
              borderRadius: '9999px',
              border: 'none',
              background: 'rgba(226, 232, 240, 0.7)',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '6px',
            }}
            aria-label="Clear search query"
          >
            <X size={14} />
          </button>
        )}

        <kbd
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-surface-soft)',
            border: '1px solid #cbd5e1',
            color: '#64748b',
            fontWeight: 700,
            userSelect: 'none',
          }}
        >
          /
        </kbd>
      </div>

      {/* Live Dropdown Results */}
      {showDropdown && isOpen && searchQuery.trim() && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(210, 225, 245, 0.85)',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.06)',
            zIndex: 1100,
            overflow: 'hidden',
            maxHeight: '440px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 18px',
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748b',
              fontWeight: 600,
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
            }}
          >
            <span>MATCHING SIGNS ({filteredResults.length})</span>
            <span>Use ↑↓ to navigate, Enter to view</span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {previewResults.length > 0 ? (
              previewResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectResult) onSelectResult(item);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(239, 246, 255, 0.9)' : 'transparent',
                      border: isSelected ? '1px solid rgba(191, 219, 254, 0.8)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.word}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              color: 'var(--ink-primary)',
                            }}
                          >
                            {item.word}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: 'rgba(241, 245, 249, 0.9)',
                              color: '#475569',
                              fontWeight: 600,
                            }}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '2px',
                          }}
                        >
                          {item.definition}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isSelected ? 'var(--brand-blue)' : '#94a3b8' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>p.{item.bookPage}</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '4px' }}>
                  No signs matching "{searchQuery}"
                </p>
                <p style={{ fontSize: '13px' }}>
                  Check your spelling or explore the A–Z alphabet browser.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
