import React, { useState } from 'react';
import { useDictionary } from '../../context/DictionaryContext';
import { useFavorites } from '../../context/FavoritesContext';
import {
  Search,
  BookOpen,
  Sparkles,
  Heart,
  Grid,
  Menu,
  X,
  Compass,
  GraduationCap,
  Hash,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Badge } from './Badge';

interface AppHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
}) => {
  const { manifest } = useDictionary();
  const { favorites } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dictionary', path: '/dictionary', icon: <BookOpen size={16} /> },
    { label: 'Categories', path: '/categories', icon: <Layers size={16} /> },
    { label: 'Alphabet A-Z', path: '/alphabet', icon: <Grid size={16} /> },
    { label: 'Numerals', path: '/numerals', icon: <Hash size={16} /> },
    { label: 'Deaf Schools', path: '/schools', icon: <GraduationCap size={16} /> },
    { label: 'Translator Studio', path: '/translate', icon: <Sparkles size={16} />, highlight: true },
    { label: 'Favorites', path: '/favorites', icon: <Heart size={16} />, count: favorites.length },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(220, 230, 245, 0.8)',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div className="app-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
            gap: '16px',
          }}
        >
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleLinkClick('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                padding: '2px',
                background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #93c5fd 100%)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.18), inset 0 1px 1px #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.9)',
              }}
            >
              <img
                src="/favicon.png"
                alt="SignBridgeGhana Logo"
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                onError={(e) => {
                  // Fallback icon if logo image not yet loaded
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '19px',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--ink-primary)',
                  }}
                >
                  SignBridge<span style={{ color: 'var(--brand-blue)' }}>Ghana</span>
                </span>
                <Badge variant="ghana" size="sm">
                  GSL 3rd Ed.
                </Badge>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--ink-muted)',
                  marginTop: '-2px',
                }}
              >
                Ghanaian Sign Language Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="desktop-nav-menu"
          >
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path === '/dictionary' && currentPath.startsWith('/dictionary/'));
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#ffffff' : link.highlight ? 'var(--brand-blue)' : 'var(--ink-secondary)',
                    backgroundColor: isActive
                      ? 'var(--ink-primary)'
                      : link.highlight
                      ? 'rgba(37, 99, 235, 0.08)'
                      : 'transparent',
                    border: isActive
                      ? '1px solid var(--ink-primary)'
                      : link.highlight
                      ? '1px solid rgba(37, 99, 235, 0.2)'
                      : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(220, 38, 38, 0.12)',
                        color: isActive ? '#ffffff' : 'var(--brand-red)',
                        fontWeight: 700,
                      }}
                    >
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Button & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
                else handleLinkClick('/dictionary');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-surface-soft)',
                border: '1px solid rgba(200, 215, 235, 0.7)',
                color: 'var(--ink-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Search vocabulary (/ to focus)"
            >
              <Search size={15} color="var(--brand-blue)" />
              <span className="search-pill-text">Search GSL...</span>
              <kbd
                style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                /
              </kbd>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-surface-soft)',
                border: '1px solid rgba(200, 215, 235, 0.7)',
                cursor: 'pointer',
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className="animate-fade-in"
            style={{
              padding: '16px 0 24px 0',
              borderTop: '1px solid rgba(220, 230, 245, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isActive ? '#ffffff' : 'var(--ink-primary)',
                    backgroundColor: isActive ? 'var(--ink-primary)' : 'rgba(240, 243, 248, 0.8)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  {link.count !== undefined && link.count > 0 ? (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        backgroundColor: 'var(--brand-red)',
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    >
                      {link.count}
                    </span>
                  ) : (
                    <ArrowRight size={16} opacity={0.6} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav-menu {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .search-pill-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
