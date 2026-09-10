import React from 'react';
import { CameraView } from '../components/translator/CameraView';
import { SignComposer } from '../components/translator/SignComposer';
import { TranslationPipelineInfo } from '../components/translator/TranslationPipelineInfo';
import { Badge } from '../components/common/Badge';
import { Sparkles, Camera, Type, Info, ShieldCheck } from 'lucide-react';

export const TranslatorPage: React.FC<{ onSelectSign?: (slug: string) => void }> = ({ onSelectSign }) => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Badge variant="blue" size="sm" icon={<Sparkles size={14} />}>
              GSL Translation Studio
            </Badge>
            <Badge variant="ghana" size="sm">
              Computer Vision Shell
            </Badge>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--ink-primary)' }}>
            Ghanaian Sign Language Translator Studio
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '4px', maxWidth: '720px' }}>
            Experimental camera pose tracking interface and text-to-sign sequence composer, bridging real GSL vocabulary with next-generation recognition architecture.
          </p>
        </div>

        {/* Prototype Transparency Notice */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(239, 246, 255, 0.8)',
            border: '1px solid rgba(191, 219, 254, 0.9)',
            borderRadius: '16px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Info size={20} color="var(--brand-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.6' }}>
            <strong>Translation Engine Architecture:</strong> This studio connects your local camera stream with a real-time landmark visualizer and provides an instant <strong>Text-to-GSL Sign Composer</strong> mapped directly to the 1,516 official 3rd Edition dictionary records. Full deep-learning GSL sign-to-text weight inference is prepared through the architectural pipeline below.
          </div>
        </div>

        {/* Camera Studio View */}
        <div style={{ marginBottom: '40px' }}>
          <CameraView />
        </div>

        {/* Text to Sign Composer */}
        <div style={{ marginBottom: '40px' }}>
          <SignComposer onSelectSign={onSelectSign} />
        </div>

        {/* Pipeline Architecture */}
        <TranslationPipelineInfo />
      </div>
    </div>
  );
};
