import React from 'react';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';
import { Badge } from '../components/common/Badge';
import { ShieldCheck, BookOpen, Heart, Globe, Award, ExternalLink } from 'lucide-react';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';

export const AboutPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Badge variant="ghana" size="md" icon={<ShieldCheck size={16} />} className="mb-3">
            Authoritative GSL Digitization Project
          </Badge>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'var(--ink-primary)', letterSpacing: '-0.03em' }}>
            About SignBridgeGhana
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--ink-secondary)', maxWidth: '640px', margin: '12px auto 0 auto', lineHeight: '1.6' }}>
            Transforming the official Ghanaian Sign Language Dictionary (3rd Edition) into a modern, accessible digital knowledge system.
          </p>
        </div>

        {/* Mission Card */}
        <FrostedGlassCard style={{ padding: '36px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '14px' }}>
            Our Mission & Purpose
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
            SignBridgeGhana was created to bridge linguistic barriers and preserve the rich visual vocabulary of Ghanaian Sign Language (GSL). By digitizing the official 318-page dictionary into structured, searchable web data, we provide deaf learners, educators, families, and interpreters with immediate, zero-barrier access to authoritative signs.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', lineHeight: '1.8' }}>
            All vocabulary records, signing instructions, handshape classifications, and illustrations are directly grounded in the official publication without synthetic or fabricated data.
          </p>
        </FrostedGlassCard>

        {/* Official Source Attribution */}
        <FrostedGlassCard style={{ padding: '36px', marginBottom: '32px', backgroundColor: '#0f172a', color: '#ffffff' }}>
          <Badge variant="ghana" size="sm" className="mb-3">
            Source & Copyright Provenance
          </Badge>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
            Ghanaian Sign Language Dictionary (3rd Edition)
          </h2>
          <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p>
              <strong>Publishing Authority:</strong> Prepared and validated by the Special Education Division (SPED) of the Ghana Education Service (GES) in partnership with the Ghana National Association of the Deaf (GNAD).
            </p>
            <p>
              <strong>Edition:</strong> Third Edition (2018), Adobe InDesign official release.
            </p>
            <p>
              <strong>Corpus Size:</strong> 318 Pages, 24 Thematic Chapters, 1,516 Digitized GSL Vocabulary Entries with visual plates.
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginTop: '8px' }}>
              "Dedicated to deaf children, parents, teachers, and sign language interpreters who strive every day to build an inclusive Ghana."
            </p>
          </div>
        </FrostedGlassCard>

        {/* Technical Architecture & Accessibility */}
        <FrostedGlassCard style={{ padding: '36px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '14px' }}>
            Accessibility & Design Philosophy
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: '1.7' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Studio Liquid Chrome Aesthetic
              </h3>
              <p>
                Crafted with frosted glass panels, specular lighting reflections, and clean typography to deliver a tactile, luxury product experience.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Zero-Latency Offline Search
              </h3>
              <p>
                Client-side MiniSearch indexing ensures instantaneous typo-tolerant query matching with zero server dependency.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Accessible & Keyboard Ready
              </h3>
              <p>
                Full screen-reader semantics, WCAG high-contrast compliance, keyboard shortcut navigation (/ to search), and mobile responsiveness.
              </p>
            </div>
          </div>
        </FrostedGlassCard>

        {/* Action Button */}
        <div style={{ textAlign: 'center' }}>
          <LiquidChromeButton
            variant="primary"
            size="lg"
            icon={<BookOpen size={18} />}
            onClick={() => onNavigate('/dictionary')}
          >
            Start Exploring GSL Dictionary
          </LiquidChromeButton>
        </div>
      </div>
    </div>
  );
};
