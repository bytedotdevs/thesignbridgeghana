/**
 * TranslatorPage — Unified GSL Translation Studio
 *
 * Two translation modes:
 *  1. Sign-to-Text (Camera → GSL recognition → written text + TTS audio)
 *  2. Text-to-Sign (Typed/spoken text → 3D avatar signing)
 */

import React, { useState } from 'react';
import { SignToTextView } from '../components/translator/SignToTextView';
import { TextToSignAvatar } from '../components/translator/TextToSignAvatar';
import { SignComposer } from '../components/translator/SignComposer';
import { TranslationPipelineInfo } from '../components/translator/TranslationPipelineInfo';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  Camera,
  Type,
  Bot,
  Info,
  ArrowLeftRight,
  Zap,
  Shield,
} from 'lucide-react';

type TranslatorMode = 'sign-to-text' | 'text-to-sign' | 'composer';

export const TranslatorPage: React.FC<{ onSelectSign?: (slug: string) => void }> = ({
  onSelectSign,
}) => {
  const [mode, setMode] = useState<TranslatorMode>('sign-to-text');

  const tabs: {
    id: TranslatorMode;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    description: string;
  }[] = [
    {
      id: 'sign-to-text',
      label: 'Sign → Text',
      icon: <Camera size={16} />,
      badge: 'Camera AI',
      description: 'Use your camera to detect GSL signs in real-time and translate them to text or spoken audio.',
    },
    {
      id: 'text-to-sign',
      label: 'Text → Sign',
      icon: <Bot size={16} />,
      badge: '3D Avatar',
      description: 'Type or speak words and watch a 3D avatar perform the correct Ghanaian Sign Language signs.',
    },
    {
      id: 'composer',
      label: 'Sign Composer',
      icon: <Type size={16} />,
      badge: 'Dictionary',
      description: 'Look up and sequence GSL signs word-by-word using the full GSL 3rd Edition dictionary.',
    },
  ];

  const activeTab = tabs.find((t) => t.id === mode)!;

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
      <div className="app-container">
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <Badge variant="blue" size="sm" icon={<Sparkles size={13} />}>
              GSL Translation Studio
            </Badge>
            <Badge variant="ghana" size="sm" icon={<ArrowLeftRight size={12} />}>
              Bidirectional
            </Badge>
            <Badge variant="chrome" size="sm" icon={<Zap size={12} />}>
              Real-time AI
            </Badge>
          </div>

          <h1
            style={{
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 800,
              color: 'var(--ink-primary)',
              letterSpacing: '-0.03em',
              marginBottom: '8px',
            }}
          >
            Ghanaian Sign Language
            <span style={{ display: 'block', color: 'var(--brand-blue)' }}>
              Real-Time Translation Studio
            </span>
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--ink-secondary)',
              maxWidth: '700px',
              lineHeight: '1.7',
            }}
          >
            Bridge communication between deaf and hearing communities. Detect GSL signs from your
            camera, or type/speak to see a 3D avatar perform the correct signs — powered by the
            1,514-sign GSL 3rd Edition Dictionary.
          </p>
        </div>

        {/* Transparency Notice */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: 'rgba(239, 246, 255, 0.9)',
            border: '1px solid rgba(191, 219, 254, 0.9)',
            borderRadius: '14px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Info size={18} color="var(--brand-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.65' }}>
            <strong>Technology Notice:</strong> Sign-to-Text uses MediaPipe Holistic for real-time
            hand/body landmark detection with a dictionary-based classifier. Text-to-Sign uses a
            Three.js 3D skeletal avatar with procedurally generated sign animations mapped to the GSL
            dictionary. All processing happens locally in your browser — no data is sent externally.{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} color="#2563eb" /> Zero data transmitted.
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '24px',
            padding: '6px',
            backgroundColor: '#f0f3f8',
            borderRadius: '18px',
            flexWrap: 'wrap',
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === mode;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                style={{
                  flex: '1 1 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '13px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isActive ? '#ffffff' : 'var(--ink-secondary)',
                  backgroundColor: isActive ? '#0f172a' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 16px rgba(15,23,42,0.2)' : 'none',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    style={{
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(37,99,235,0.12)',
                      color: isActive ? '#ffffff' : 'var(--brand-blue)',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Mode Description */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(220,230,245,0.8)',
            borderRadius: '14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(37,99,235,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {activeTab.icon}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--ink-primary)' }}>{activeTab.label}:</strong>{' '}
            {activeTab.description}
          </p>
        </div>

        {/* Active Mode Content */}
        <div className="animate-fade-in">
          {mode === 'sign-to-text' && <SignToTextView />}
          {mode === 'text-to-sign' && <TextToSignAvatar />}
          {mode === 'composer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <SignComposer onSelectSign={onSelectSign} />
            </div>
          )}
        </div>

        {/* Architecture Info (always shown at bottom) */}
        <div style={{ marginTop: '48px' }}>
          <TranslationPipelineInfo />
        </div>
      </div>
    </div>
  );
};
