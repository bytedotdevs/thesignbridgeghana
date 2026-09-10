import React from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { SearchBar } from '../components/dictionary/SearchBar';
import { AlphabetRibbon } from '../components/dictionary/AlphabetRibbon';
import { VocabularyCard } from '../components/dictionary/VocabularyCard';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Layers,
  Heart,
  ShieldCheck,
  Compass,
  Users,
  Eye,
  Camera,
  Search,
} from 'lucide-react';
import { GSLSearchIndexItem } from '../types/dictionary';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectSign: (item: GSLSearchIndexItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectSign }) => {
  const { manifest, categories, searchIndex, isLoading } = useDictionary();

  // Pick 4 featured signs from various categories
  const featuredSigns = React.useMemo(() => {
    if (!searchIndex.length) return [];
    // Prioritize well-known cultural words like School, Family, Welcome, Ghana, Love, Friend, Thank
    const targetWords = ['school', 'family', 'father / dad', 'friend', 'love', 'help', 'teach / teacher', 'welcome'];
    const matched = searchIndex.filter((s) => targetWords.some((w) => s.normalizedWord.includes(w)));
    return matched.length >= 4 ? matched.slice(0, 4) : searchIndex.slice(0, 4);
  }, [searchIndex]);

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Studio Lighting Background Glows */}
      <div className="studio-glow-blue" style={{ top: '80px', left: '10%' }} />
      <div className="studio-glow-gold" style={{ top: '200px', right: '15%' }} />

      {/* Hero Section */}
      <section
        style={{
          paddingTop: '60px',
          paddingBottom: '50px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div className="app-container">
          <div style={{ display: 'inline-flex', marginBottom: '18px' }}>
            <Badge variant="ghana" size="md" icon={<ShieldCheck size={16} />}>
              Official 3rd Edition Digital Dictionary • GNAD & GES
            </Badge>
          </div>

          <h1
            style={{
              fontSize: 'clamp(34px, 5.5vw, 62px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: '1.1',
              maxWidth: '900px',
              margin: '0 auto 20px auto',
              color: 'var(--ink-primary)',
            }}
          >
            The Definitive Digital Home for{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ghanaian Sign Language
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--ink-secondary)',
              maxWidth: '680px',
              margin: '0 auto 36px auto',
              lineHeight: '1.6',
            }}
          >
            Explore 1,500+ authentic GSL signs with high-resolution visual plates, step-by-step handshape instructions, and an intelligent A–Z search index.
          </p>

          {/* Main Hero Search Bar */}
          <div style={{ marginBottom: '28px' }}>
            <SearchBar size="lg" onSelectResult={onSelectSign} />
          </div>

          {/* Quick Action Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <LiquidChromeButton
              variant="primary"
              size="md"
              icon={<BookOpen size={16} />}
              onClick={() => onNavigate('/dictionary')}
            >
              Explore Dictionary ({manifest?.totalEntries || 1516} Signs)
            </LiquidChromeButton>

            <LiquidChromeButton
              variant="secondary"
              size="md"
              icon={<Camera size={16} />}
              onClick={() => onNavigate('/translate')}
            >
              GSL Translator Studio
            </LiquidChromeButton>

            <LiquidChromeButton
              variant="subtle"
              size="md"
              icon={<GraduationCap size={16} />}
              onClick={() => onNavigate('/schools')}
            >
              Deaf Schools of Ghana
            </LiquidChromeButton>
          </div>
        </div>
      </section>

      {/* A-Z Quick Jump Ribbon */}
      <section style={{ marginBottom: '50px' }}>
        <div className="app-container">
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              border: '1px solid rgba(220, 230, 245, 0.75)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', padding: '0 8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={15} color="var(--brand-blue)" />
                <span>Jump to Alphabet Letter (A–Z)</span>
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {manifest?.totalEntries || 1516} Vocabulary Records
              </span>
            </div>
            <AlphabetRibbon />
          </div>
        </div>
      </section>

      {/* Community & Authentic GSL Heritage Showcase Banner */}
      <section style={{ marginBottom: '60px' }}>
        <div className="app-container">
          <FrostedGlassCard
            style={{
              padding: '32px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 246, 255, 0.9) 100%)',
              border: '1.5px solid rgba(190, 215, 245, 0.8)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
                alignItems: 'center',
              }}
            >
              <div>
                <Badge variant="blue" size="sm" icon={<Users size={14} />} className="mb-3">
                  Ghanaian Deaf Community & Linguistic Heritage
                </Badge>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '12px', lineHeight: '1.2' }}>
                  Preserving & Elevating Ghanaian Sign Language
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
                  GSL is the visual-gestural language used by over 110,000 deaf and hard-of-hearing individuals across Ghana. Originally introduced through pioneers like Andrew Foster at Mampong-Akuapem in 1957, GSL has evolved a vibrant, indigenous vocabulary rooted in Ghanaian cultures and traditions.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <LiquidChromeButton
                    variant="primary"
                    size="sm"
                    icon={<GraduationCap size={15} />}
                    onClick={() => onNavigate('/schools')}
                  >
                    Explore Ghana's 9 Deaf Schools
                  </LiquidChromeButton>
                  <LiquidChromeButton
                    variant="secondary"
                    size="sm"
                    icon={<Layers size={15} />}
                    onClick={() => onNavigate('/categories')}
                  >
                    Browse by Category
                  </LiquidChromeButton>
                </div>
              </div>

              {/* Community Photos Mosaic */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                }}
              >
                {['/images/community-1.jpg', '/images/community-2.jpg', '/images/community-3.jpg', '/images/community-4.jpg'].map((src, i) => (
                  <div
                    key={i}
                    style={{
                      height: '140px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '2px solid #ffffff',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    }}
                  >
                    <img
                      src={src}
                      alt="Ghanaian Sign Language Community"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </FrostedGlassCard>
        </div>
      </section>

      {/* Featured GSL Vocabulary */}
      <section style={{ marginBottom: '60px' }}>
        <div className="app-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)' }}>
                Featured Signs of the Day
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                Hand-picked essential vocabulary from the official 3rd Edition dictionary.
              </p>
            </div>
            <LiquidChromeButton
              variant="secondary"
              size="sm"
              icon={<ArrowRight size={15} />}
              onClick={() => onNavigate('/dictionary')}
            >
              View All 1,500+ Signs
            </LiquidChromeButton>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            {featuredSigns.map((sign) => (
              <VocabularyCard
                key={sign.id}
                item={sign}
                onClick={onSelectSign}
              />
            ))}
          </div>
        </div>
      </section>

      {/* The 24 Thematic Categories Grid */}
      <section style={{ marginBottom: '60px' }}>
        <div className="app-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink-primary)' }}>
                Explore by Thematic Category
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                The 24 official chapters categorized by Ghana National Association of the Deaf.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/categories')}
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--brand-blue)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>See All 24 Categories</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px',
            }}
          >
            {categories.slice(0, 8).map((cat) => (
              <div
                key={cat.slug}
                onClick={() => onNavigate(`/dictionary?category=${cat.slug}`)}
                className="glass-card-interactive"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: 'var(--brand-blue)',
                      }}
                    >
                      {cat.count} signs
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                      {cat.pageRange}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>
                    {cat.sampleWords.slice(0, 3).join(', ')}...
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--brand-blue)',
                  }}
                >
                  <span>Explore category</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section>
        <div className="app-container">
          <FrostedGlassCard
            style={{
              padding: '36px',
              background: '#0f172a',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px auto' }}>
              <Badge variant="ghana" size="sm" className="mb-2">
                Real-Time Verified Statistics
              </Badge>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Complete Digitization of the GSL 3rd Edition
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                Extracted with precision from the official 318-page dictionary artifact.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '24px',
                textAlign: 'center',
              }}
            >
              <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#60a5fa', marginBottom: '4px' }}>
                  {manifest?.totalEntries || 1516}
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>GSL Vocabulary Signs</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
                  {categories.length || 24}
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Thematic Categories</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
                  9
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Ghana Deaf Schools</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#e879f9', marginBottom: '4px' }}>
                  100%
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Official GNAD Source</div>
              </div>
            </div>
          </FrostedGlassCard>
        </div>
      </section>
    </div>
  );
};
