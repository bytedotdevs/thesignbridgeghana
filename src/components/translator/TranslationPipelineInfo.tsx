import React from 'react';
import { Camera, Cpu, BookOpen, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { FrostedGlassCard } from '../common/FrostedGlassCard';
import { Badge } from '../common/Badge';

export const TranslationPipelineInfo: React.FC = () => {
  const pipelineSteps = [
    {
      step: '01',
      title: 'Spatial Hand & Pose Tracking',
      desc: 'Real-time 21-keypoint 3D landmark extraction on both hands & facial orientation using MediaPipe Holistic.',
      icon: <Camera size={20} color="#3b82f6" />,
    },
    {
      step: '02',
      title: 'Spatial-Temporal Transformer',
      desc: 'Neural classification of dynamic hand movements, trajectory vectors, contact points, and hold durations.',
      icon: <Cpu size={20} color="#f59e0b" />,
    },
    {
      step: '03',
      title: 'GSL Dictionary Lexicon Lookup',
      desc: 'Grounding against the 1,516 official Ghanaian Sign Language vocabulary database and phonetic variations.',
      icon: <BookOpen size={20} color="#10b981" />,
    },
    {
      step: '04',
      title: 'Ghanaian English & Local Gloss',
      desc: 'Translates sequenced signs into coherent Ghanaian English and Akan/Twi cultural glosses.',
      icon: <MessageSquare size={20} color="#8b5cf6" />,
    },
  ];

  return (
    <FrostedGlassCard style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink-primary)' }}>
            GSL Computer Vision Recognition Architecture
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            How SignBridgeGhana interfaces camera pose tracking with the structured 3rd Edition dictionary.
          </p>
        </div>
        <Badge variant="emerald" size="sm" icon={<ShieldCheck size={14} />}>
          Verified Model Pipeline
        </Badge>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {pipelineSteps.map((s, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#ffffff',
              padding: '18px',
              borderRadius: '16px',
              border: '1px solid rgba(220, 230, 245, 0.8)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(240, 244, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.icon}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8' }}>
                  {s.step}
                </span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                {s.title}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: '1.5' }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </FrostedGlassCard>
  );
};
