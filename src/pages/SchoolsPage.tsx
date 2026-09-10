import React from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { FrostedGlassCard } from '../components/common/FrostedGlassCard';
import { Badge } from '../components/common/Badge';
import { GraduationCap, MapPin, Building, Calendar, Info, ExternalLink } from 'lucide-react';
import { LiquidChromeButton } from '../components/common/LiquidChromeButton';

export const SchoolsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { schools } = useDictionary();

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Badge variant="blue" size="sm" icon={<GraduationCap size={14} />} className="mb-2">
            Deaf Education in Ghana
          </Badge>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Deaf Schools of Ghana Directory
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Official directory of specialized educational institutions for deaf learners across Ghana (from Page 10 of the dictionary).
          </p>
        </div>

        {/* Historic Spotlight Card */}
        <FrostedGlassCard
          style={{
            padding: '32px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            marginBottom: '40px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'center' }}>
            <div>
              <Badge variant="ghana" size="sm" className="mb-3">
                Historical Heritage • 1957 – Present
              </Badge>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
                The Genesis of Deaf Education in Ghana
              </h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', marginBottom: '16px' }}>
                Formal deaf education in Ghana was pioneered in 1957 by Dr. Andrew Foster, the first African American deaf graduate of Gallaudet University. He established the Ghana Mission School for the Deaf at Mampong-Akuapem, laying the foundational roots of Ghanaian Sign Language.
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                Today, the Special Education Division (SPED) of the Ghana Education Service (GES) oversees specialized deaf primary, junior high, and senior technical institutions nationwide.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
                Institutional Summary
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Recognized Public Deaf Schools:</span>
                  <strong style={{ color: '#60a5fa' }}>{schools.length} Schools</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Coverage Regions:</span>
                  <strong style={{ color: '#f59e0b' }}>7+ Administrative Regions</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Only Secondary Tech in W. Africa:</span>
                  <strong style={{ color: '#10b981' }}>SEC-TECH Mampong</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Governing Body:</span>
                  <strong style={{ color: '#e2e8f0' }}>GES / SPED & GNAD</strong>
                </li>
              </ul>
            </div>
          </div>
        </FrostedGlassCard>

        {/* Directory Grid */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '16px' }}>
            Directory of Specialized Institutions
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {schools.map((school) => (
              <div
                key={school.id}
                className="glass-card-interactive"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <Badge variant="blue" size="sm">
                      {school.type}
                    </Badge>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                      p.{school.sourcePage}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '8px' }}>
                    {school.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
                    <MapPin size={15} color="var(--brand-blue)" />
                    <span>{school.location}, {school.region}</span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: '1.6' }}>
                    {school.details}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '14px',
                    borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                >
                  <span>Special Education Division</span>
                  <span style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>GES Accredited</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
